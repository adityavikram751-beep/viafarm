"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import socket from "../lib/socket";

export default function SettingsPage() {
  const BASE_URL = "https://viafarm-1.onrender.com";

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState("/profile.png");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    upiId: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    newVendorRegistration: false,
    newBuyerRegistration: false,
    newProductRegistration: false,
    newOrderPlaced: false,
  });

  const getToken = () => localStorage.getItem("token");

  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error("❌ Non-JSON response:", text);
      return { success: false, message: "Server returned non-JSON response" };
    }
  };

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) return;
        const res = await fetch(`${BASE_URL}/api/admin/settings/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await safeJson(res);
        console.log("📥 Profile Data:", data);
        if (res.ok && data.success && data.data) {
          setFormData((prev) => ({
            ...prev,
            name: data.data.name || "",
            email: data.data.email || "",
            upiId: data.data.upiId || "",
          }));
          if (data.data.profilePicture) setProfilePic(data.data.profilePicture);
        }
      } catch (error) {
        console.error("❌ Fetch profile failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/api/admin/settings/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await safeJson(res);
        console.log("📥 Notification Data:", data);
        if (res.ok && data) setNotifications(data);
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Input Change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload preview
  const handleUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (event: any) => setProfilePic(event.target.result);
    reader.readAsDataURL(file);
  };

  // Delete Profile Picture
  const handleDelete = async () => {
    if (!confirm("🗑️ Are you sure you want to delete your profile picture?")) return;
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/admin/settings/profile-picture`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      console.log("📩 Delete response:", data);
      if (res.ok && data.success) {
        setProfilePic("/profile.png");
        // dispatch browser event
        window.dispatchEvent(
          new CustomEvent("profile-updated", {
            detail: { profilePicture: "/profile.png" },
          })
        );
        // emit socket if available
        try { if (socket?.connected) socket.emit("profileUpdated", { profilePicture: "/profile.png" }); } catch {}
        alert("✅ Profile picture deleted successfully!");
      } else {
        alert(`⚠️ Delete failed: ${data.message || "Error"}`);
      }
    } catch (error) {
      console.error("❌ Delete failed:", error);
      alert("❌ Failed to delete profile picture.");
    } finally {
      setLoading(false);
    }
  };

  // Save Profile Info (with upload)
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return alert("⚠️ No token found!");

      let res;
      if (uploadFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("upiId", formData.upiId);
        formDataToSend.append("profilePicture", uploadFile);

        res = await fetch(`${BASE_URL}/api/admin/settings/profile`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataToSend,
        });
      } else {
        res = await fetch(`${BASE_URL}/api/admin/settings/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            upiId: formData.upiId,
            profilePicture: profilePic,
          }),
        });
      }

      const data = await safeJson(res);
      console.log("📩 Response from backend:", data);

      if (res.ok && data.success) {
        // if server returned updated profilePicture URL, use it
        const newPic = data.data?.profilePicture || data.profilePicture || profilePic;
        setProfilePic(newPic);

        // dispatch browser event to update Topbar etc.
        window.dispatchEvent(
          new CustomEvent("profile-updated", {
            detail: { profilePicture: newPic, name: formData.name, email: formData.email },
          })
        );
        // emit socket as well (optional)
        try { if (socket?.connected) socket.emit("profileUpdated", { profilePicture: newPic, name: formData.name }); } catch {}

        alert("✅ Profile updated successfully!");
        // clear uploadFile after success
        setUploadFile(null);
      } else {
        alert(`❌ Update failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Update failed:", error);
      alert("❌ Update failed due to network or server error.");
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handlePasswordUpdate = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return alert("⚠️ Please fill all password fields!");
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("❌ Passwords do not match!");
    }
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return alert("⚠️ No token found!");

      const res = await fetch(`${BASE_URL}/api/admin/settings/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await safeJson(res);
      if (res.ok && data.success) {
        alert("✅ Password updated successfully!");
        setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        alert(`⚠️ Failed to change password: ${data.message || "Error"}`);
      }
    } catch (error) {
      console.error("❌ Password update failed:", error);
      alert("❌ Password update failed.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Notification (live event)
  const toggleNotification = async (key: string) => {
    const updated = { ...notifications, [key]: !notifications[key as keyof typeof notifications] };
    setNotifications(updated);
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/admin/settings/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      const data = await safeJson(res);
      if (res.ok && data.success) {
        // dispatch browser event for Topbar
        window.dispatchEvent(new CustomEvent("notification-updated", { detail: updated }));
        try { if (socket?.connected) socket.emit("notificationSettingsUpdated", updated); } catch {}
      } else {
        alert("⚠️ Failed to update notification settings!");
      }
    } catch (error) {
      console.error("❌ Notification update failed:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        Loading...
      </div>
    );

  return (
    <div className="flex bg-gray-100 h-screen fixed overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 border-r border-gray-300 p-6 flex-shrink h-full">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-2 px-3 text-left rounded-md transition ${activeTab === "general" ? "bg-white shadow font-medium" : "hover:bg-gray-300"}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 px-3 text-left rounded-md transition ${activeTab === "notifications" ? "bg-white shadow font-medium" : "hover:bg-gray-300"}`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-scroll no-scrollbar w-[65vw] p-10">
        {activeTab === "general" && (
          <div className="space-y-6 pb-16">
            {/* Profile Info */}
            <div className="bg-gray-50 border left-20 border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-5">Profile Info</h3>
              <div className="flex items-center gap-10 mb-6">
                <Image
                  src={profilePic}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm hover:scale-105 transition-transform duration-300"
                />
                <div className="flex gap-4">
                  <button onClick={handleDelete} className="border border-red-500 text-red-500 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                  <label className="border border-green-500 text-green-500 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-50 cursor-pointer">
                    <Upload size={16} /> Upload
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label>Email Id *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label>Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label>UPI Id *</label>
                  <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div className="flex justify-center mt-6">
                  <button onClick={handleSave} className="bg-green-500 text-white rounded-lg px-10 py-2 hover:bg-green-600">
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-5">Change Password</h3>
              <div className="space-y-5">
                <div>
                  <label>Current Password *</label>
                  <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label>New Password *</label>
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label>Confirm Password *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                </div>
                <div className="flex justify-center mt-6">
                  <button onClick={handlePasswordUpdate} className="bg-blue-600 text-white rounded-lg px-10 py-2 hover:bg-blue-700">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="border rounded-xl p-8 bg-gray-50 shadow-sm space-y-6 pb-16">
            <h3 className="font-semibold mb-6 text-gray-800">Manage Your Notifications</h3>
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between w-full max-w-xl">
                <span>{key.replace(/([A-Z])/g, " $1")}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={value} onChange={() => toggleNotification(key)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
