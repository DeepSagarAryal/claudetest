import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SyncButton from "@/components/sync-button";

export default async function SyncPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Hubspot Sync</h2>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Sync Closed Won Deals
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          Pull the latest &quot;Closed Won&quot; deals from Hubspot, calculate
          commissions, and update the database. Duplicate deals will be skipped.
        </p>
        <SyncButton />
      </div>
    </div>
  );
}
