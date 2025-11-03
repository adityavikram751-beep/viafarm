// StatsCards.tsx (Integrated with Auth Token to fix 401 error)

"use client";

import { useState, useEffect } from "react";

// API Base URL (Full Endpoint)
const BASE_URL = "https://393rb0pp-5000.inc1.devtunnels.ms/api/admin/dashboard"; 

// 🔑 AUTH_TOKEN - Necessary to fix the 401 Unauthorized error.
// We must use the token you provided, as the server demands it.
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTc5MjQwYzZjNzIzOGM0YTcxNWUyMiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc2MTUzOTgxNiwiZXhwIjoxNzYyODM1ODE2fQ.vqzkxIWUxeASxojseBtnlVXG0A6NLzWase6dEoe4ZjU";

// --- TypeScript Interfaces ---
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

// --- StatCard Component (Layout Unchanged) ---
interface StatCardProps {
  value: string;
  label: string;
  change: string;
  isPositive?: boolean;
  isLoading?: boolean;
}

function StatCard({ value, label, change, isPositive = true, isLoading = false }: StatCardProps) {
  // Skeleton Loader (Kept the original styling)
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 h-[120px] flex flex-col items-center justify-center animate-pulse">
        <div className="h-6 bg-gray-200 w-1/2 mb-2 rounded"></div>
        <div className="h-4 bg-gray-200 w-3/4 mb-1 rounded"></div>
        <div className="h-3 bg-gray-200 w-1/3 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-8 m-6 text-center flex flex-col items-center justify-center">
      <h3 className="text-2xl  font-bold">{value}</h3>
      <p className="text-xl font-bold    text-gray-600">{label}</p>
      <p
        className={`text-xs font-medium mt-4 ${
          isPositive ? "text-green-600" : "text-red-500"
        }`}
      >
        {change} from last month
      </p>
    </div>
  );
}

// --- StatsCards Component (Fixed with Authorization Header) ---
export default function StatsCards() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      // 🛑 Safety check for token
      if (!AUTH_TOKEN) {
          setError("Authorization Token is missing. Cannot fetch secure data.");
          setLoading(false);
          return;
      }

      try {
        const res = await fetch(BASE_URL, {
            method: 'GET',
            headers: { 
                // 🔑 FIX for 401 Error: Adding the Bearer Token
                'Authorization': `Bearer ${AUTH_TOKEN}`, 
                'Content-Type': 'application/json',
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
            console.log("Dashboard data fetched successfully:", json.data);
        } else {
            throw new Error("API reported internal failure or missing data.");
        }

      } catch (err: any) {
        console.error("Critical API Fetch Error:", err.message);
        setError(err.message); 
        setDashboardData(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Run only once

  const cardMapping = [
    { label: "Active Vendors", key: "vendors" },
    { label: "Active Buyers", key: "buyers" },
    { label: "Active Products", key: "products" },
    { label: "Active Orders", key: "orders" },
  ] as const;

  // Display error message if fetching fails
  if (error) {
    return <div className="p-4 text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 font-medium">
        Error loading data: {error}
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cardMapping.map((card) => {
        const data = dashboardData?.[card.key] || null;

        return (
          <StatCard
            key={card.key}
            label={card.label}
            isLoading={loading}
            // Data Mapping
            value={data ? data.current.toLocaleString() : "..."} 
            change={data ? data.change : "..."}                 
            isPositive={data ? data.increased : true}           
          />
        );
      })}
    </div>
  );
}