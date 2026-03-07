import { Client } from "@hubspot/api-client";
import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/deals/models/Filter";
import { prisma } from "@/lib/prisma";
import { calculateCommission } from "@/lib/commission";

interface HubspotDealProperties {
  dealname?: string;
  amount?: string;
  closedate?: string;
  dealstage?: string;
  hubspot_owner_id?: string;
}

interface SyncResult {
  created: number;
  skipped: number;
  errors: string[];
}

export async function syncClosedWonDeals(
  accessToken: string
): Promise<SyncResult> {
  const hubspotClient = new Client({ accessToken });

  const result: SyncResult = { created: 0, skipped: 0, errors: [] };

  const plan = await prisma.commissionPlan.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!plan) {
    result.errors.push("No commission plan configured. Create one first.");
    return result;
  }

  let after: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const searchResponse = await hubspotClient.crm.deals.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "dealstage",
              operator: FilterOperatorEnum.Eq,
              value: "closedwon",
            },
          ],
        },
      ],
      properties: [
        "dealname",
        "amount",
        "closedate",
        "dealstage",
        "hubspot_owner_id",
      ],
      limit: 100,
      after: after ?? "0",
      sorts: [],
    });

    const deals = searchResponse.results;

    for (const deal of deals) {
      const props = deal.properties as unknown as HubspotDealProperties;
      const hubspotDealId = deal.id;

      const existing = await prisma.deal.findUnique({
        where: { hubspotDealId },
      });

      if (existing) {
        result.skipped++;
        continue;
      }

      const ownerHubspotId = props.hubspot_owner_id;
      if (!ownerHubspotId) {
        result.errors.push(`Deal ${hubspotDealId}: no owner ID`);
        continue;
      }

      const owner = await prisma.user.findUnique({
        where: { hubspotId: ownerHubspotId },
      });

      if (!owner) {
        result.errors.push(
          `Deal ${hubspotDealId}: no matching user for owner ${ownerHubspotId}`
        );
        continue;
      }

      const amount = parseFloat(props.amount || "0");
      const closeDate = props.closedate
        ? new Date(props.closedate)
        : new Date();

      const periodStart = new Date(
        closeDate.getFullYear(),
        Math.floor(closeDate.getMonth() / 3) * 3,
        1
      );

      const periodDeals = await prisma.deal.aggregate({
        where: {
          ownerId: owner.id,
          closeDate: { gte: periodStart, lt: closeDate },
        },
        _sum: { amount: true },
      });

      const periodRevenue = periodDeals._sum.amount || 0;
      const commission = calculateCommission(amount, plan, periodRevenue);

      await prisma.deal.create({
        data: {
          hubspotDealId,
          dealName: props.dealname || null,
          amount,
          stage: props.dealstage || "closedwon",
          closeDate,
          ownerId: owner.id,
          commissionEarned: commission.totalCommission,
        },
      });

      result.created++;
    }

    if (searchResponse.paging?.next?.after) {
      after = searchResponse.paging.next.after;
    } else {
      hasMore = false;
    }
  }

  return result;
}
