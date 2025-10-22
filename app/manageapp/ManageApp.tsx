"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import {
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

// --------------------
// Interfaces
// --------------------
interface CategoryImage {
  url: string;
  public_id?: string;
}

interface Category {
  _id: string;
  name: string;
  image?: CategoryImage;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// --------------------
// Base URL
// --------------------
const CATEGORIES_BASE =
  "https://393rb0pp-5000.inc1.devtunnels.ms/api/admin/manage-app/categories";

// --------------------
// Component
// --------------------
export default function ManagePanel() {
  const [activeTab, setActiveTab] = useState<string>("products");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --------------------
  // API FUNCTIONS
  // --------------------

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await axios.get<ApiResponse<Category[]>>(CATEGORIES_BASE);
      const data = Array.isArray(res.data)
        ? (res.data as Category[])
        : res.data?.data || [];
      setCategories(data);
    } catch (error) {
      const err = error as AxiosError;
      console.error("Fetch error:", err.message);
      alert("⚠️ Failed to fetch categories. Check API URL or tunnel.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Please enter category name");
      return;
    }

    const form = new FormData();
    form.append("name", newCategory.trim());
    if (imageFile) form.append("image", imageFile);

    try {
      setSaving(true);
      const res = await axios.post<ApiResponse<Category>>(
        CATEGORIES_BASE,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.success) {
        alert("✅ Category added successfully!");
        await fetchCategories();
        resetModal();
      } else {
        alert("❌ Failed to save category: " + (res.data?.message || ""));
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error("Add error:", err.message);
      alert("❌ API Error while saving category");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editIndex === null) return;
    const cat = categories[editIndex];
    if (!cat?._id) return alert("Invalid category selected");

    const form = new FormData();
    form.append("name", newCategory.trim());
    if (imageFile) form.append("image", imageFile);

    try {
      setSaving(true);
      const res = await axios.put<ApiResponse<Category>>(
        `${CATEGORIES_BASE}/${cat._id}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.success) {
        alert("✅ Category updated!");
        await fetchCategories();
        resetModal();
      } else {
        alert("❌ Failed to update: " + (res.data?.message || ""));
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error("Update error:", err.message);
      alert("❌ Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    const cat = categories[index];
    if (!cat?._id) return;
    if (!confirm(`Delete category "${cat.name}"?`)) return;

    try {
      const res = await axios.delete<ApiResponse<null>>(
        `${CATEGORIES_BASE}/${cat._id}`
      );
      if (res.data?.success) {
        alert("🗑️ Category deleted successfully!");
        setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      } else {
        alert("❌ Delete failed");
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error("Delete error:", err.message);
      alert("❌ API Error while deleting category");
    }
  };

  // --------------------
  // UI HANDLERS
  // --------------------

  const openAddModal = () => {
    setEditIndex(null);
    setNewCategory("");
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEdit = (index: number) => {
    const cat = categories[index];
    setEditIndex(index);
    setNewCategory(cat.name);
    setImagePreview(cat.image?.url || null);
    setShowModal(true);
  };

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setNewCategory("");
    setImageFile(null);
    setImagePreview(null);
  };

  useEffect(() => {
    if (activeTab === "products") fetchCategories();
  }, [activeTab]);

  // --------------------
  // RENDER
  // --------------------

  return (
    <div className="flex bg-[#f9fafb] min-h-screen overflow-hidden">
      <aside className="w-64 bg-[#f3f4f6] border-r border-gray-200 p-5 fixed h-full">
        <nav className="flex flex-col gap-4">
          {["Products", "Coupons", "Support", "About"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab.toLowerCase().replace(/ /g, ""))
              }
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === tab.toLowerCase().replace(/ /g, "")
                  ? "bg-white shadow-sm text-gray-900"
                  : "hover:bg-gray-200 text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-64 px-10 py-6 overflow-y-auto">
        {activeTab === "products" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-4xl">
            <h2 className="text-gray-800 text-base font-medium mb-4">
              Manage Product Categories
            </h2>

            {loadingCategories && (
              <p className="text-gray-500 text-sm">Loading categories...</p>
            )}

            <div className="space-y-3 mb-10">
              {categories.map((c, i) => (
                <div
                  key={c._id}
                  className="flex justify-between items-center border-b border-gray-200 pb-3"
                >
                  <div className="flex items-center gap-3">
                    {c.image?.url && (
                      <img
                        src={c.image.url}
                        className="w-10 h-10 rounded object-cover"
                        alt={c.name}
                      />
                    )}
                    <span className="text-gray-800 text-sm">
                      {i + 1}. {c.name}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(i)}
                      className="text-blue-500 border p-1.5 rounded-md"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="text-red-500 border p-1.5 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {!loadingCategories && categories.length === 0 && (
                <p className="text-gray-500 text-sm">No categories yet.</p>
              )}
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              <Plus size={14} /> Add Category
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[480px] p-6 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-gray-800 font-medium text-sm">
                {editIndex !== null ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={resetModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-sm text-gray-700 mb-2">
              Category Name
            </label>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Beverages"
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />

            <label className="block text-sm text-gray-700 mt-4 mb-2">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="w-full text-sm"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                className="mt-3 w-32 h-24 object-cover rounded"
                alt="Preview"
              />
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={editIndex !== null ? handleSaveEdit : handleAddCategory}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-md text-sm hover:bg-green-700"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
