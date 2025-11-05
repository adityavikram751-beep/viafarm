// ✅ StatsCards.tsx — Final Perfect Layout & Styled "% change" Line
"use client";

import { useState, useEffect } from "react";

// ---------------- API CONFIG ----------------
const BASE_URL = "https://viafarm-1.onrender.com/api/admin/dashboard";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTc5MjQwYzZjNzIzOGM0YTcxNWUyMiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc2MTUzOTgxNiwiZXhwIjoxNzYyODM1ODE2fQ.vqzkxIWUxeASxojseBtnlVXG0A6NLzWase6dEoe4ZjU";

// ---------------- INTERFACES ----------------
interface DashboardCardData {
  current: number;
  change: string;
  increased: boolean;
}

interface DashboardData {
  vendors: DashboardCardData;
  buyers: DashboardCardData;
  products: DashboardCardData;
  orders: DashboardCardData;
}

interface ApiResponse {
  success: boolean;
  data: DashboardData;
}

// ---------------- CARD COMPONENT ----------------
interface StatCardProps {
  value: string;
  label: string;
  change: string;
  isPositive?: boolean;
  isLoading?: boolean;
}

function StatCard({
  value,
  label,
  change,
  isPositive = true,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 h-[140px] flex flex-col items-center justify-center animate-pulse">
        <div className="h-6 bg-gray-200 w-1/2 mb-2 rounded"></div>
        <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
        <div className="h-3 bg-gray-200 w-1/3 rounded"></div>
      </div>
    );
  }

  // ✅ Prepare formatted change value
  const formattedChange = isPositive
    ? change.startsWith("+")
      ? change
      : `+${change}`
    : change.startsWith("-")
    ? change
    : `-${change}`;

  // 🧩 Card Layout (Screenshot Style)
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 text-center flex flex-col items-center justify-center">
      {/* Main number */}
      <h3 className="text-3xl font-semibold text-gray-900">{value}</h3>

      {/* Label */}
      <p className="text-2xl font-semibold text-gray-600 mt-1">{label}</p>

      {/* Change line — styled like screenshot */}
      <div
        className={`flex items-center justify-center mt-4 space-x-1 ${
          isPositive ? "text-green-600" : "text-red-500"
        }`}
      >
        <span className="font-semibold text-base">{formattedChange}</span>
        <span className="font-normal text-sm text-current">
          from last month
        </span>
      </div>
    </div>
  );
}

// ---------------- MAIN COMPONENT ----------------
export default function StatsCards() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      if (!AUTH_TOKEN) {
        setError("Authorization Token is missing.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(BASE_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          throw new Error("401 Unauthorized. The provided token is invalid or expired.");
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch data. HTTP Status: ${res.status}`);
        }

        const json: ApiResponse = await res.json();

        if (json.success && json.data) {
          setDashboardData(json.data);
          console.log("✅ Dashboard data fetched successfully:", json.data);
        } else {
          throw new Error("API reported internal failure or missing data.");
        }
      } catch (err: any) {
        console.error("❌ API Fetch Error:", err.message);
        setError(err.message);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardMapping = [
    { label: "Active Vendors", key: "vendors" },
    { label: "Active Buyers", key: "buyers" },
    { label: "Active Products", key: "products" },
    { label: "Active Orders", key: "orders" },
  ] as const;

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 font-medium">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
      {cardMapping.map((card) => {
        const data = dashboardData?.[card.key] || null;
        return (
          <StatCard
            key={card.key}
            label={card.label}
            isLoading={loading}
            value={data ? data.current.toLocaleString() : "..."}
            change={data ? data.change : "..."}
            isPositive={data ? data.increased : true}
          />
        );
      })}
    </div>
  );
}
