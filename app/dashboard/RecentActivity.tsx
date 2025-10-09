/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Image from "next/image";

interface Activity {
  id: number;
  title: string;
  user: string;
  time: string;
  avatar: string;
}

const activities: Activity[] = [
  { id: 1, title: "New Buyer Registration", user: "Kunal Sharma", time: "3 h ago", avatar: "/images/user1.png" },
  { id: 2, title: "Order Placed", user: "Ravi Kumar", time: "4 h ago", avatar: "/images/user1.png" },
  { id: 3, title: "Product Added", user: "Neha Singh", time: "6 h ago", avatar: "/images/user1.png" },
  { id: 4, title: "New Buyer Registration", user: "Kunal Sharma", time: "3 h ago", avatar: "/images/user1.png" },
  { id: 5, title: "Order Delivered", user: "Ravi Kumar", time: "8 h ago", avatar: "/images/user1.png" },
  { id: 6, title: "Payment Completed", user: "Neha Singh", time: "9 h ago", avatar: "/images/user1.png" },
  { id: 7, title: "New Buyer Registration", user: "Amit Sharma", time: "10 h ago", avatar: "/images/user1.png" },
  { id: 8, title: "Refund Issued", user: "Ravi Kumar", time: "12 h ago", avatar: "/images/user1.png" },
  { id: 9, title: "New Buyer Registration", user: "Kunal Sharma", time: "15 h ago", avatar: "/images/user1.png" },
];

export default function RecentActivity() {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 3;
  const totalPages = Math.ceil(activities.length / perPage);

  const startIndex = (currentPage - 1) * perPage;
  const currentActivities = activities.slice(startIndex, startIndex + perPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

      <div className="space-y-3">
        {currentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Image
                src={activity.avatar}
                width={100}
                height={100}
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.user}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{activity.time}</span>
          </div>
        ))}
      </div>

      {/* Pagination footer */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <span className="text-gray-600 text-sm">{"<"}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <span className="text-gray-600 text-sm">{">"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
