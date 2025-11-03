'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bell, X } from 'lucide-react';
import axios from 'axios';
import socket from "../lib/socket";
import { useRouter } from "next/navigation";

/* ---------------- CONFIG ---------------- */
const BASE_URL = "https://393rb0pp-5000.inc1.devtunnels.ms";
const NOTIF_API = `${BASE_URL}/api/notifications`;
const PROFILE_API = `${BASE_URL}/api/admin/settings/profile`;
const FALLBACK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDQ0ZTdiZTZmZDBmMDY3MjNkOWE4MCIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc2MTg5NjczNSwiZXhwIjoxNzYzMTkyNzM1fQ.UPk8gJUDvH70awCBMd5Yx7Fg5bDBmmruESuGERzv3pg";

interface Notification {
  _id: string;
  message: string;
  time: string;
  read: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  profilePicture: string;
}

const Topbar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllNotifsModal, setShowAllNotifsModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  /* ---------------- AUTH HEADER ---------------- */
  const getAuthConfig = () => {
    let token = FALLBACK_TOKEN;
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      if (t) token = t;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = async () => {
    try {
      const res = await axios.get(PROFILE_API, getAuthConfig());
      const data = res.data.data || res.data.user || res.data;
      if (data) {
        setProfile(data);
        localStorage.setItem("profilePic", data.profilePicture || "");
      }
    } catch (err) {
      console.error("❌ Profile fetch failed:", err);
    }
  };

  /* ---------------- FETCH NOTIFICATIONS ---------------- */
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(NOTIF_API, getAuthConfig());
      const apiData = res.data.notifications || res.data;
      setNotifications(apiData.reverse());
    } catch (err) {
      console.error("❌ Notification fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SOCKET + INIT ---------------- */
  useEffect(() => {
    fetchProfile();
    fetchNotifications();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("adminNotification", (data: any) => {
      console.log("🔔 Realtime Notification:", data);
      setNotifications(prev => [data, ...prev]);
    });

    return () => {
      socket.off("adminNotification");
      socket.off("connect");
    };
  }, []);

  /* ---------------- AUTO PROFILE UPDATE ---------------- */
  useEffect(() => {
    const handleProfileUpdated = (e: any) => {
      if (e.detail?.profilePicture) {
        setProfile(prev => ({
          ...prev!,
          profilePicture: e.detail.profilePicture,
        }));
      } else {
        fetchProfile();
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("profile-updated", handleProfileUpdated);
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const markAsRead = async (_id: string) => {
    setNotifications(prev =>
      prev.map(n => (n._id === _id ? { ...n, read: true } : n))
    );
    try {
      await axios.put(`${NOTIF_API}/${_id}/read`, {}, getAuthConfig());
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await axios.put(`${NOTIF_API}/mark-all-read`, {}, getAuthConfig());
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ---------------- JSX ---------------- */
  return (
    <>
      {/* ✅ Topbar */}
      <div className="fixed top-0 left-64 w-[calc(100%-16rem)] flex justify-between items-center px-6 py-4 bg-gray-100 border-b-3 z-50">
        <h1 className="text-2xl font-semibold text-gray-800">ManageApp</h1>

        <div className="flex items-center gap-5">
          <span className="text-gray-700 text-sm font-medium">{currentDate}</span>

          {/* ✅ Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-gray-700 hover:bg-white transition"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-base font-semibold text-gray-800">
                    Notifications ({unreadCount} unread)
                  </h3>
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <p className="p-4 text-sm text-gray-500 text-center">
                      Loading notifications...
                    </p>
                  ) : (
                    notifications.slice(0, 7).map(notif => (
                      <div
                        key={notif._id}
                        onClick={() => markAsRead(notif._id)}
                        className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${notif.read
                            ? "bg-white text-gray-600"
                            : "bg-blue-50/50 text-gray-800 font-medium hover:bg-blue-100"
                          }`}
                      >
                        <p className="text-sm">{notif.message}</p>
                        <span className="text-xs text-gray-500 mt-0.5 block">
                          {notif.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t text-center flex justify-between items-center">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded-md"
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={() => setShowAllNotifsModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md font-medium"
                  >
                    View All ({notifications.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Profile Avatar (Click → Settings Page) */}
          <button
            onClick={() => router.push("/settings")}
            className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 shadow-sm cursor-pointer"
            title={`${profile?.name || "Profile"} (${profile?.email || ""})`}
          >
            <Image
              src={profile?.profilePicture || "/about/about.jpg"}
              alt="Profile"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </button>
        </div>
      </div>

      {/* ✅ All Notifications Modal */}
      {showAllNotifsModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col relative">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                All Notifications ({notifications.length})
              </h3>
              <button
                onClick={() => setShowAllNotifsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => markAsRead(notif._id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${notif.read
                      ? "bg-gray-50 border-gray-200"
                      : "bg-blue-100/50 border-blue-200 hover:bg-blue-100"
                    }`}
                >
                  <p
                    className={`text-base ${notif.read
                        ? "text-gray-700"
                        : "text-gray-900 font-medium"
                      }`}
                  >
                    {notif.message}
                  </p>
                  <span className="text-sm text-gray-500 mt-1 block">
                    {notif.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 px-4 py-2 border rounded-lg"
              >
                Mark All As Read
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
