interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  color?: "red" | "blue" | "green" | "yellow" | "default";
}

const colorClasses = {
  red: "text-brand-red",
  blue: "text-brand-blue",
  green: "text-success",
  yellow: "text-yellow-400",
  default: "text-text-primary",
};

export function StatCard({
  label,
  value,
  description,
  color = "default",
}: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-1">
        {label}
      </p>
      <p className={`text-2xl font-black ${colorClasses[color]}`}>{value}</p>
      {description && (
        <p className="text-xs text-text-muted mt-1">{description}</p>
      )}
    </div>
  );
}
