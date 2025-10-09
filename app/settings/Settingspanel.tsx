"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [profilePic, setProfilePic] = useState("/profile.jpg");

  const [formData, setFormData] = useState({
    name: "Risha Sharma",
    phone: "9999999999",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    vendor: true,
    buyer: true,
    product: true,
    order: true,
  });

  // Input change handler
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Image upload
  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setProfilePic(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Delete profile image
  const handleDelete = () => {
    setProfilePic("/profile.jpg");
  };

  // Save profile info
  const handleSave = () => {
    alert(`✅ Profile Updated!\nName: ${formData.name}\nPhone: ${formData.phone}`);
  };

  // Update password
  const handlePasswordUpdate = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert("⚠️ Please fill all password fields!");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("❌ New passwords do not match!");
      return;
    }

    alert("✅ Password updated successfully!");
    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar (Fixed) */}
      <div className="w-64 bg-gray-200 p-6 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-6"></h2>
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

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-white p-10 rounded-l-2xl shadow-md">
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-8 pb-16">
            {/* Profile Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-5">Profile Info</h3>

              <div className="flex items-center gap-120 mb-6">
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

              {/* Input Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  />
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white rounded-lg px-10 py-2 text-base font-medium hover:bg-green-600 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-5">Change Password</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  />
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={handlePasswordUpdate}
                    className="bg-green-500 text-white rounded-lg px-10 py-2 text-base font-medium hover:bg-green-600 transition"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="border rounded-xl p-8 bg-gray-50 shadow-sm space-y-6 pb-16">
            <h3 className="font-semibold mb-6 text-gray-800">Manage Your Notifications</h3>
            {[
              { label: "New Vendor Registration", key: "vendor" },
              { label: "New Buyer Registration", key: "buyer" },
              { label: "New Product Registration", key: "product" },
              { label: "New Order Placed", key: "order" },
            ].map(({ label, key }) => (
              <div
                key={key}
                className="flex items-center justify-between w-full max-w-xl"
              >
                <span className="text-gray-700 text-base">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[key as keyof typeof notifications]}
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
