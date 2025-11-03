'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Bell, X, Trash2 } from 'lucide-react';
import axios from 'axios';
import socket from "../lib/socket";
import { useRouter } from "next/navigation";

/* ---------------- CONFIG ---------------- */
const BASE_URL = "https://393rb0pp-5000.inc1.devtunnels.ms";
const NOTIF_API = `${BASE_URL}/api/notifications`;
const DEL_ALL_API = `${NOTIF_API}/delete-all`;
const PROFILE_API = `${BASE_URL}/api/admin/settings/profile`;
const FALLBACK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDQ0ZTdiZTZmZDBmMDY3MjNkOWE4MCIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc2MTg5NjczNSwiZXhwIjoxNzYzMTkyNzM1fQ.UPk8gJUDvH70awCBMd5Yx7Fg5bDBmmruESuGERzv3pg";

/* ---------------- TYPES ---------------- */
interface Notification {
  _id: string;
  title?: string;
  message?: string;
  data?: any;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfile {
  name: string;
  email: string;
  profilePicture: string;
}

/* ---------------- COMPONENT ---------------- */
const Topbar: React.FC = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getAuthConfig = () => {
    let token = FALLBACK_TOKEN;
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      if (t) token = t;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(PROFILE_API, getAuthConfig());
      const data = res.data?.data || res.data?.user || res.data;
      if (data) {
        setProfile(data);
        localStorage.setItem("profilePic", data.profilePicture || "");
      }
    } catch (err) {
      console.error("❌ Profile fetch failed:", err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(NOTIF_API, getAuthConfig());
      const raw = res.data?.notifications ?? res.data?.data ?? res.data;
      const items = Array.isArray(raw)
        ? raw
        : raw?.notification
          ? [raw.notification]
          : [];
      items.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setNotifications(items);
    } catch (err) {
      console.error("❌ Notification fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchNotifications();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("adminNotification", (data: any) => {
      console.log("🔔 New Notification:", data);
      setNotifications(prev => {
        if (!data || !data._id) return prev;
        if (prev.find(n => n._id === data._id)) return prev;

        // ✅ Play sound when a *new* notification arrives
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {
            console.warn("⚠️ User interaction required before playing sound");
          });
        }

        return [data, ...prev];
      });
    });

    return () => {
      socket.off("adminNotification");
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdated = (e: any) => {
      if (e?.detail?.profilePicture) {
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

  const markAsRead = async (_id: string) => {
    if (!_id) return;
    const already = notifications.find(n => n._id === _id)?.isRead;
    if (already) return;
    setNotifications(prev => prev.map(n => (n._id === _id ? { ...n, isRead: true } : n)));

    try {
      const res = await axios.put(`${NOTIF_API}/${_id}/read`, {}, getAuthConfig());
      const updated = res?.data?.notification ?? res?.data;
      if (updated && updated._id) {
        setNotifications(prev =>
          prev.map(n => (n._id === updated._id ? { ...n, ...updated } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (_id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setNotifications(prev => prev.filter(n => n._id !== _id));
    try {
      await axios.delete(`${NOTIF_API}/${_id}`, getAuthConfig());
    } catch {
      fetchNotifications();
    }
  };

  const deleteAllNotifications = async () => {
    const confirmDelete = window.confirm("Delete all notifications?");
    if (!confirmDelete) return;
    setNotifications([]);
    try {
      await axios.delete(DEL_ALL_API, getAuthConfig());
    } catch {
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* 🔊 Hidden Audio element for ringtone */}
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

      <div className="fixed top-0 left-64 w-[calc(100%-16rem)] flex justify-between items-center px-6 py-4 bg-gray-100 border-b z-50">
        <h1 className="text-2xl font-semibold text-gray-800">Order</h1>

        <div className="flex items-center gap-5">
          <span className="text-gray-700 text-sm font-medium">{currentDate}</span>

          {/* 🔔 Notification Bell */}
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
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map(notif => {
                      const isRead = !!notif.isRead;
                      const displayMessage = notif.message ?? notif.title ?? "Notification";
                      const timeText = notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "";

                      return (
                        <div
                          key={notif._id}
                          onClick={() => markAsRead(notif._id)}
                          className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${isRead
                            ? "bg-white text-gray-600"
                            : "bg-blue-50/50 text-gray-800 font-medium hover:bg-blue-100"
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm pr-2">{displayMessage}</p>
                            <button
                              onClick={(e) => deleteNotification(notif._id, e)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 -m-1"
                              title="Delete Notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <span className="text-xs text-gray-500 mt-0.5 block">{timeText}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t text-center flex justify-center">
                  <button
                    onClick={deleteAllNotifications}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 👤 Profile */}
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
    </>
  );
};

export default Topbar;
