interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
}

export default function ProgressBar({
  current,
  target,
  label,
}: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        <span className="text-sm font-medium text-gray-500">
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 100 ? "bg-green-500" : "bg-blue-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{formatCurrency(current)}</span>
        <span>{formatCurrency(target)}</span>
      </div>
    </div>
  );
}
