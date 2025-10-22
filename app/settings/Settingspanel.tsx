"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const BASE_URL = "https://393rb0pp-5000.inc1.devtunnels.ms";

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState("/profile.jpg");

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

  // ✅ Get Token
  const getToken = () => localStorage.getItem("token");

  // ✅ Safe JSON parser
  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error("❌ Non-JSON response:", text);
      return { success: false, message: "Server returned non-JSON response" };
    }
  };

  // ✅ Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) return alert("⚠️ Token missing!");

        const res = await fetch(`${BASE_URL}/api/admin/settings/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await safeJson(res);
        if (res.ok && data.success && data.data) {
          setFormData((prev) => ({
            ...prev,
            name: data.data.name || "",
            email: data.data.email || "",
            upiId: data.data.upiId || "",
          }));
          if (data.data.profilePicture) setProfilePic(data.data.profilePicture);
        } else {
          alert(`⚠️ Failed to fetch profile: ${data.message || "Error"}`);
        }
      } catch (error) {
        console.error("❌ Fetch profile failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/api/admin/settings/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await safeJson(res);
        if (res.ok && data) setNotifications(data);
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  // ✅ Input Change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Upload Image
  const handleUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => setProfilePic(event.target.result);
    reader.readAsDataURL(file);
  };

  // ✅ Delete Profile Picture
  const handleDelete = async () => {
    if (!confirm("🗑️ Are you sure you want to delete your profile picture?"))
      return;

    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${BASE_URL}/api/admin/settings/profile-picture`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeJson(res);
      if (res.ok && data.success) {
        setProfilePic("/profile.jpg");
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

  // ✅ Save Profile Info
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return alert("⚠️ No token found!");

      const res = await fetch(`${BASE_URL}/api/admin/settings/profile`, {
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

      const data = await safeJson(res);
      if (res.ok && data.success) {
        alert("✅ Profile updated successfully!");
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

  // ✅ Change Password
  const handlePasswordUpdate = async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      return alert("⚠️ Please fill all password fields!");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return alert("❌ Passwords do not match!");
    }

    try {
      setLoading(true);
      const token = getToken();
      if (!token) return alert("⚠️ No token found!");

      const res = await fetch(
        `${BASE_URL}/api/admin/settings/change-password`,
        {
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
        }
      );

      const data = await safeJson(res);
      if (res.ok && data.success) {
        alert("✅ Password updated successfully!");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
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

  // ✅ Toggle Notification
  const toggleNotification = async (key: string) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    };
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
      if (!res.ok || !data.success) {
        alert("⚠️ Failed to update notification settings!");
      }
    } catch (error) {
      console.error("❌ Notification update failed:", error);
    }
  };

  // ✅ Loader
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        Loading...
      </div>
    );

  // ✅ Layout
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-6 flex-shrink-0">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-2 px-3 text-left rounded-md transition ${
              activeTab === "general"
                ? "bg-white shadow font-medium"
                : "hover:bg-gray-300"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 px-3 text-left rounded-md transition ${
              activeTab === "notifications"
                ? "bg-white shadow font-medium"
                : "hover:bg-gray-300"
            }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-white p-10 rounded-l-2xl shadow-md">
        {activeTab === "general" && (
          <div className="space-y-10 pb-16">
            {/* Profile Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-5">Profile Info</h3>
              <div className="flex items-center gap-10 mb-6">
                <Image
                  src={profilePic}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full object-cover border"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleDelete}
                    className="border border-red-500 text-red-500 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                  <label className="border border-green-500 text-green-500 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-50 cursor-pointer">
                    <Upload size={16} /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label>Email Id *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label>UPI Id *</label>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white rounded-lg px-10 py-2 hover:bg-green-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-5">
                Change Password
              </h3>
              <div className="space-y-5">
                <div>
                  <label>Current Password *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label>New Password *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handlePasswordUpdate}
                    className="bg-blue-600 text-white rounded-lg px-10 py-2 hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="border rounded-xl p-8 bg-gray-50 shadow-sm space-y-6 pb-16">
            <h3 className="font-semibold mb-6 text-gray-800">
              Manage Your Notifications
            </h3>
            {Object.entries(notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between w-full max-w-xl"
              >
                <span>{key.replace(/([A-Z])/g, " $1")}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleNotification(key)}
                    className="sr-only peer"
                  />
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
