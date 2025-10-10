"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {Sidebar} from "../login/sidebar"; // adjust path if needed


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

   useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login"); 
    }
  }, [router]);

  return (
      
    <div className="flex bg-gray-100 min-h-screen">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main Content (with left margin to account for sidebar) */}
      <main className="flex-1 ml-64">
        {/* Optional Topbar — paste topbar component here */}
        <div className="p-12">
          {/* <Topbar /> */}
          <div className="mt-4">{children}</div>
        </div>
        
      </main>
    </div>
  );
}
