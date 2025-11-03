/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
// 🚨 NOTE: 'date-fns' must be installed for this to work.
import { formatDistanceToNow, parseISO } from 'date-fns'; 

// --- API Configuration ---
const BASE_URL = "https://393rb0pp-5000.inc1.devtunnels.ms/api/admin/recent-activity";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTc5MjQwYzZjNzIzOGM0YTcxNWUyMiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc2MTUzOTgxNiwiZXhwIjoxNzYyODM1ODE2fQ.vqzkxIWUxeASxojseBtnlVXG0A6NLzWase6dEoe4ZjU";

// --- TypeScript Interfaces ---
interface ActivityItem {
    _id: string;
    createdAt: string; 
    name: string; 
    profilePicture?: string;
}

interface RecentActivityData {
    activities: ActivityItem[];
    page: number;
    pages: number;
    total: number;
}

interface ApiResponse {
    success: boolean;
    data: RecentActivityData;
}

// Helper to format time
const formatTime = (isoDate: string): string => {
    try {
        return formatDistanceToNow(parseISO(isoDate), { addSuffix: true })
               .replace('about ', '')
               .replace('less than a minute ago', 'just now');
    } catch (e) {
        return "Unknown time";
    }
};

const DEFAULT_AVATAR = "/images/default-user.png"; 

export default function RecentActivity() {
    const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 3;
    const totalPages = Math.ceil(allActivities.length / perPage);

    // --- API Fetching Logic ---
    useEffect(() => {
        const fetchActivityData = async () => {
            setLoading(true);
            setError(null);
            
            if (!AUTH_TOKEN) {
                setError("Authorization Token is missing.");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(BASE_URL, {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${AUTH_TOKEN}`, 
                        'Content-Type': 'application/json',
                    },
                });
                
                if (res.status === 401) {
                    throw new Error("401 Unauthorized. Token invalid or expired.");
                }
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch data. HTTP Status: ${res.status}`);
                }
                
                const json: ApiResponse = await res.json(); 
                
                if (json.success && json.data) {
                    setAllActivities(json.data.activities || []);
                } else {
                    throw new Error("API reported failure or missing data.");
                }

            } catch (err: any) {
                console.error("Critical API Fetch Error:", err.message);
                setError(err.message); 
                setAllActivities([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchActivityData();
    }, []);

    // --- Client-Side Pagination Handlers ---
    const startIndex = (currentPage - 1) * perPage;
    const currentActivities = allActivities.slice(startIndex, startIndex + perPage);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const ActivitySkeleton = () => (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm animate-pulse">
            <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                    <div className="h-4 bg-gray-200 w-40 mb-1 rounded"></div>
                    <div className="h-3 bg-gray-200 w-24 rounded"></div>
                </div>
            </div>
            <div className="h-3 bg-gray-200 w-10 rounded"></div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow p-4 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>

            {error && (
                <div className="p-3 text-red-700 bg-red-100 rounded-lg border-l-4 border-red-500 font-medium">
                    Error loading activity: {error}
                </div>
            )}
            
            <div className="space-y-3">
                {loading ? (
                    <>
                        <ActivitySkeleton /><ActivitySkeleton /><ActivitySkeleton />
                    </>
                ) : currentActivities.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No recent activity found.</div>
                ) : (
                    currentActivities.map((activity) => (
                        <div
                            key={activity._id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={activity.profilePicture || DEFAULT_AVATAR}
                                    alt={activity.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-sm font-medium">New Buyer Registration</p> 
                                    <p className="text-xs text-gray-500">{activity.name}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">
                                {formatTime(activity.createdAt)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination footer */}
            <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                <p>
                    {currentActivities.length > 0 ? (
                        `Page ${currentPage} of ${totalPages}`
                    ) : (
                        `No pages`
                    )}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1 || loading}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                        <span className="text-gray-600 text-sm">{"<"}</span>
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages || loading}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                        <span className="text-gray-600 text-sm">{">"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}