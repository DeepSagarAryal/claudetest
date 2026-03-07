import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PlanForm from "@/components/plan-form";

async function createOrUpdatePlan(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return;

  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const baseRate = parseFloat(formData.get("baseRate") as string) / 100;
  const threshold = parseFloat(formData.get("threshold") as string);
  const acceleratorRate =
    parseFloat(formData.get("acceleratorRate") as string) / 100;

  if (id) {
    await prisma.commissionPlan.update({
      where: { id },
      data: { title, baseRate, threshold, acceleratorRate },
    });
  } else {
    await prisma.commissionPlan.create({
      data: { title, baseRate, threshold, acceleratorRate },
    });
  }

  revalidatePath("/admin/plans");
}

async function deletePlan(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return;

  const id = formData.get("id") as string;
  await prisma.commissionPlan.delete({ where: { id } });
  revalidatePath("/admin/plans");
}

export default async function PlansPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const plans = await prisma.commissionPlan.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Commission Plans
      </h2>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Create New Plan
        </h3>
        <PlanForm action={createOrUpdatePlan} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Existing Plans
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Base Rate</th>
                <th className="px-6 py-3">Threshold</th>
                <th className="px-6 py-3">Accelerator Rate</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No commission plans yet. Create one above.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {plan.title}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {(plan.baseRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      ${plan.threshold.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {(plan.acceleratorRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <form action={deletePlan}>
                        <input type="hidden" name="id" value={plan.id} />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
