export interface CommissionPlanInput {
  baseRate: number;
  threshold: number;
  acceleratorRate: number;
}

export interface CommissionResult {
  baseCommission: number;
  acceleratorCommission: number;
  totalCommission: number;
}

export function calculateCommission(
  dealAmount: number,
  plan: CommissionPlanInput,
  periodRevenue: number = 0
): CommissionResult {
  const newCumulativeRevenue = periodRevenue + dealAmount;

  if (newCumulativeRevenue <= plan.threshold) {
    const base = dealAmount * plan.baseRate;
    return {
      baseCommission: base,
      acceleratorCommission: 0,
      totalCommission: base,
    };
  }

  if (periodRevenue >= plan.threshold) {
    const accel = dealAmount * plan.acceleratorRate;
    return {
      baseCommission: 0,
      acceleratorCommission: accel,
      totalCommission: accel,
    };
  }

  const baseAmount = plan.threshold - periodRevenue;
  const acceleratorAmount = dealAmount - baseAmount;
  const baseCommission = baseAmount * plan.baseRate;
  const acceleratorCommission = acceleratorAmount * plan.acceleratorRate;

  return {
    baseCommission,
    acceleratorCommission,
    totalCommission: baseCommission + acceleratorCommission,
  };
}
