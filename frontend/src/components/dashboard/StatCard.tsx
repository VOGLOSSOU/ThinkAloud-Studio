interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="label">{label}</span>
      <span className="font-playfair text-2xl text-blanc-brume">{value}</span>
      {sub && <span className="text-xs text-gris-cendre font-mono">{sub}</span>}
    </div>
  );
}
