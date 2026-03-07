import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DollarSign, TrendingUp, Target } from "lucide-react";
import StatCard from "@/components/stat-card";
import ProgressBar from "@/components/progress-bar";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const quarterStart = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  );

  const [mtdDeals, qtdDeals, plan] = await Promise.all([
    prisma.deal.findMany({
      where: {
        ownerId: session.user.id,
        closeDate: { gte: monthStart },
      },
      orderBy: { closeDate: "desc" },
    }),
    prisma.deal.findMany({
      where: {
        ownerId: session.user.id,
        closeDate: { gte: quarterStart },
      },
      orderBy: { closeDate: "desc" },
    }),
    prisma.commissionPlan.findFirst({
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const mtdEarnings = mtdDeals.reduce((s, d) => s + d.commissionEarned, 0);
  const qtdEarnings = qtdDeals.reduce((s, d) => s + d.commissionEarned, 0);
  const qtdRevenue = qtdDeals.reduce((s, d) => s + d.amount, 0);
  const threshold = plan?.threshold ?? 0;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Sales Dashboard
      </h2>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="MTD Earnings"
          value={formatCurrency(mtdEarnings)}
          icon={DollarSign}
          subtitle={`${mtdDeals.length} deals this month`}
        />
        <StatCard
          title="QTD Earnings"
          value={formatCurrency(qtdEarnings)}
          icon={TrendingUp}
          subtitle={`${qtdDeals.length} deals this quarter`}
        />
        <StatCard
          title="QTD Revenue"
          value={formatCurrency(qtdRevenue)}
          icon={Target}
          subtitle={plan ? `Threshold: ${formatCurrency(threshold)}` : "No plan set"}
        />
      </div>

      {plan && (
        <div className="mb-6">
          <ProgressBar
            current={qtdRevenue}
            target={threshold}
            label="Progress to Accelerator Threshold"
          />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Closed Won Deals
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                <th className="px-6 py-3">Deal</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Close Date</th>
                <th className="px-6 py-3">Commission</th>
                <th className="px-6 py-3">Rate</th>
              </tr>
            </thead>
            <tbody>
              {qtdDeals.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No deals found for this quarter.
                  </td>
                </tr>
              ) : (
                qtdDeals.map((deal) => {
                  const effectiveRate =
                    deal.amount > 0
                      ? (deal.commissionEarned / deal.amount) * 100
                      : 0;
                  return (
                    <tr
                      key={deal.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {deal.dealName || deal.hubspotDealId}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatCurrency(deal.amount)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(deal.closeDate)}
                      </td>
                      <td className="px-6 py-4 font-medium text-green-600">
                        {formatCurrency(deal.commissionEarned)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {effectiveRate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
