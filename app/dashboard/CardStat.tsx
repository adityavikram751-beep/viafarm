"use client";

interface StatCardProps {
  value: string;
  label: string;
  change: string;
  isPositive?: boolean;
}

function StatCard({ value, label, change, isPositive = true }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center flex flex-col items-center justify-center">
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-sm text-gray-600">{label}</p>
      <p
        className={`text-xs font-medium mt-1 ${
          isPositive ? "text-green-600" : "text-red-500"
        }`}
      >
        {change} from last month
      </p>
    </div>
  );
}

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard value="702" label="Active Vendors" change="+11%" isPositive />
      <StatCard value="400" label="Active Buyers" change="-8%" isPositive={false} />
      <StatCard value="1,100" label="Active Products" change="+12%" isPositive />
      <StatCard value="200" label="Active Orders" change="+12%" isPositive />
    </div>
  );
}
