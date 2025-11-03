"use client"
// Galti Line 2 ko hata diya gaya hai, kyunki aapko ManageApp ka component 
// local folder se mil raha hai (Line 7 se).

import Topbar from "./Topbar";
// import ActivitySlider from "./components/ActivitySlider";
import socket from '../lib/socket'
import { useEffect } from "react";
import ManageApp from "./ManageApp"; // ✅ Sahi aur Single Import
export default function Notifications() {
 
 useEffect(() => {
   
    socket.connect();
    socket.on("connect", () => {
      console.log("✅ Connected to socket server:", socket.id);
    });

    
    socket.on("adminNotification", (data) => {
      console.log("📩 Notification from server:", data);
    });

    
    return () => {
      socket.off("connect");
      socket.off("adminNotification");
      socket.disconnect();
    };
  }, []);
  return (
    <div className="p-6 space-y-1">
      

      <Topbar/>
      {/* Stats Section */}
      <ManageApp/>

      {/* Recent Activity */}
      {/* <ActivitySlider /> */}

      {/* Manage Banners (Placeholder) */}
      
    </div>
  );
}