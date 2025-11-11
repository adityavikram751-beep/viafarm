/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  Plus,
  X,
  PlusCircle,
  Search,
  Filter,
  Phone,
  Mail,
  Clock,
  Save,
} from "lucide-react";

/* ---------------- CONFIG ---------------- */
const BASE_API = "https://viafarm-1.onrender.com";
const CATEGORIES_BASE = `${BASE_API}/api/admin/manage-app/categories`;
const COUPONS_BASE = `${BASE_API}/api/admin/manage-app/coupons`;
const SUPPORT_BASE = `${BASE_API}/api/admin/manage-app/customer-support`;

/* Notifications endpoints (GET, PUT settings + POST send) */
const NOTIF_GET = `${BASE_API}/api/admin/settings/user-notifications`;
const NOTIF_PUT = `${BASE_API}/api/admin/settings/user-notifications`;
const NOTIF_POST = `${BASE_API}/api/admin/manage-app/notifications`;

/* Terms & Conditions endpoints */
const TERMS_BASE = `${BASE_API}/api/admin/manage-app/term-and-condition`;

/* About Us endpoint (GET + PUT) */
const ABOUT_BASE = `${BASE_API}/api/admin/manage-app/About-us`;

/* ---------------- TYPES ---------------- */
interface CategoryImage {
  url?: string;
  public_id?: string;
}
interface Category {
  _id: string;
  name: string;
  image?: CategoryImage | null;
  createdAt?: string;
  updatedAt?: string;
}

type ApiCoupon = {
  _id: string;
  code: string;
  discount: { value: number; type?: string } | number;
  appliesTo?: string[]; // e.g. ["All Products"]
  createdBy?: any;
  startDate?: string;
  expiryDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

/* ---------------- COMPONENT ---------------- */
export default function ManageApp() {
  // tabs - keep explicit ids to match earlier usage
  const tabs: { id: string; label: string }[] = [
    { id: "products", label: "Products" },
    { id: "coupons", label: "Coupons" },
    { id: "notifications", label: "Notifications" },
    { id: "customersupport", label: "Customer Support" },
    { id: "terms", label: "Terms & Conditions" },
    { id: "about", label: "About Us" },
  ];
  const [activeTab, setActiveTab] = useState<string>("products");

  /* Categories */
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Add modal - multiple blocks */
  type AddBlock = { id: string; name: string; file: File | null; preview: string | null };
  const emptyBlock = (): AddBlock => ({ id: String(Math.random()), name: "", file: null, preview: null });
  const [addBlocks, setAddBlocks] = useState<AddBlock[]>([emptyBlock()]);

  /* Edit modal - single */
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [formTotalUsage, setFormTotalUsage] = useState(""); // Kept for coupon creation

  /* Modal visibility */
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  /* Coupons */
  const [couponsRaw, setCouponsRaw] = useState<ApiCoupon[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [couponFilter, setCouponFilter] = useState<"all" | "active" | "expired">("all");
  const couponsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  /* Delete coupon modal states */
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);
  const [openDeleteCode, setOpenDeleteCode] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  /* ---------------- NOTIFICATIONS ---------------- */
  const [notifSettings, setNotifSettings] = useState({
    orderPlaced: false,
    orderCancelled: false,
    orderPickedUpDelivered: false,
    priceDrop: false,
  });
  const [notifLoading, setNotifLoading] = useState(false);

  /* form to send notification */
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifImageFile, setNotifImageFile] = useState<File | null>(null);
  const [notifImagePreview, setNotifImagePreview] = useState<string | null>(null);
  const [sendingNotif, setSendingNotif] = useState(false);

  /* create coupon modal handlers */
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [formCode, setFormCode] = useState("");
  const [formDiscount, setFormDiscount] = useState<number | "">("");
  const [formDiscountType, setFormDiscountType] = useState<"Percentage" | "Fixed">("Percentage");
  const [formMinOrder, setFormMinOrder] = useState<number | "">("");
  const [formUsageLimit, setFormUsageLimit] = useState<number | "">("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formAppliesTo, setFormAppliesTo] = useState<string>("All Products");
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  /* ---------------- TERMS & ABOUT ---------------- */
  const [termsContent, setTermsContent] = useState<string>("");
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsEditOpen, setTermsEditOpen] = useState(false);
  const [termsEditValue, setTermsEditValue] = useState<string>("");
  const [termsSaving, setTermsSaving] = useState(false);

  const [aboutContent, setAboutContent] = useState<string>("");
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutEditOpen, setAboutEditOpen] = useState(false);
  const [aboutEditValue, setAboutEditValue] = useState<string>("");
  const [aboutSaving, setAboutSaving] = useState(false);

  /* helper auth headers */
  const extractToken = (raw: string | null) => {
    if (!raw) return "";
    // sometimes token might be stored as JSON like '{"token":"..."}'
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.token) return String(parsed.token);
    } catch {
      // not JSON, continue
    }
    return raw;
  };

  const getAuthConfig = () => {
    let token = "";
    if (typeof window !== "undefined") {
      const ls = localStorage.getItem("token");
      const ss = sessionStorage.getItem("token");
      token = extractToken(ls) || extractToken(ss) || "";
    }
    // If token is empty, return an empty config (no Authorization header).
    // This avoids ReferenceError and allows the app to decide how to behave when unauthenticated.
    if (!token) return {};
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  /* ---------------- CUSTOMER SUPPORT (NEW) ---------------- */
  const [supportData, setSupportData] = useState<{ phone?: string; email?: string; operatingHours?: string } | null>(null);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [supportEditField, setSupportEditField] = useState<string | null>(null);
  const [supportTempValue, setSupportTempValue] = useState<string>("");

  const fetchSupport = async () => {
    try {
      setLoadingSupport(true);
      const res = await axios.get(SUPPORT_BASE, getAuthConfig());
      const data = res.data?.data ?? null;
      setSupportData(data);
    } catch (err) {
      console.error("fetchSupport", err);
    } finally {
      setLoadingSupport(false);
    }
  };

  const handleSupportEdit = (field: string, value: string) => {
    setSupportEditField(field);
    setSupportTempValue(value ?? "");
  };

  const handleSupportCancel = () => {
    setSupportEditField(null);
    setSupportTempValue("");
  };

  const handleSupportSave = async () => {
    if (!supportEditField) return;
    try {
      const payload = { ...supportData, [supportEditField]: supportTempValue };
      const res = await axios.put(SUPPORT_BASE, payload, getAuthConfig());
      const updated = res.data?.data ?? payload;
      setSupportData(updated);
      setSupportEditField(null);
      setSupportTempValue("");
      alert("Customer support updated.");
    } catch (err) {
      console.error("handleSupportSave", err);
      alert("Failed to update customer support.");
    }
  };

  const handleSupportDelete = async (field: string) => {
    try {
      const payload = { ...supportData, [field]: "" };
      const res = await axios.put(SUPPORT_BASE, payload, getAuthConfig());
      setSupportData(res.data?.data ?? payload);
      alert("Field cleared.");
    } catch (err) {
      console.error("handleSupportDelete", err);
      alert("Failed to clear field.");
    }
  };

  /* ---------------- FETCH & API LOGIC (existing) ---------------- */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(CATEGORIES_BASE, getAuthConfig());
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? res.data;
      const normalized: Category[] = (data || []).map((c: any) => ({
        _id: c._id ?? c.id ?? Math.random().toString(),
        name: c.name ?? "Unnamed",
        image: c.image ?? null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
      setCategories(normalized);
    } catch (err) {
      console.error("fetchCategories", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setCouponLoading(true);
      const res = await axios.get(COUPONS_BASE, getAuthConfig());
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? res.data;
      setCouponsRaw(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("fetchCoupons", err);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleNotifImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setNotifImageFile(f);
    setNotifImagePreview(f ? URL.createObjectURL(f) : null);
  };

  const fetchNotifSettings = async () => {
    try {
      setNotifLoading(true);
      const res = await axios.get(NOTIF_GET, getAuthConfig());
      const data = res.data?.data ?? {};
      setNotifSettings({
        orderPlaced: !!data.orderPlaced,
        orderCancelled: !!data.orderCancelled,
        orderPickedUpDelivered: !!data.orderPickedUpDelivered,
        priceDrop: !!data.priceDrop,
      });
    } catch (err) {
      console.error("fetchNotifSettings", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const updateNotifSetting = async (key: keyof typeof notifSettings) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    try {
      const payload = {
        orderPlaced: updated.orderPlaced,
        orderCancelled: updated.orderCancelled,
        orderPickedUpDelivered: updated.orderPickedUpDelivered,
        priceDrop: updated.priceDrop,
      };
      const res = await axios.put(NOTIF_PUT, payload, getAuthConfig());
      if (res.data?.success && res.data.data) {
        setNotifSettings({
          orderPlaced: !!res.data.data.orderPlaced,
          orderCancelled: !!res.data.data.orderCancelled,
          orderPickedUpDelivered: !!res.data.data.orderPickedUpDelivered,
          priceDrop: !!res.data.data.priceDrop,
        });
      }
    } catch (err) {
      console.error("updateNotifSetting", err);
      setNotifSettings((s) => ({ ...s, [key]: !updated[key] }));
      alert("Failed to update notification setting.");
    }
  };

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) return alert("Title and message are required.");
    try {
      setSendingNotif(true);
      const form = new FormData();
      form.append("title", notifTitle.trim());
      form.append("message", notifMessage.trim());
      if (notifImageFile) form.append("image", notifImageFile);

      await axios.post(NOTIF_POST, form, {
        ...getAuthConfig(),
        headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
      });

      alert("Notification sent.");
      setNotifTitle("");
      setNotifMessage("");
      setNotifImageFile(null);
      setNotifImagePreview(null);
    } catch (err) {
      console.error("sendNotification", err);
      alert("Failed to send notification.");
    } finally {
      setSendingNotif(false);
    }
  };

  /* ---------------- Terms & About API ---------------- */
  const fetchTerms = async () => {
    try {
      setTermsLoading(true);
      const res = await axios.get(TERMS_BASE, getAuthConfig());
      const data = res.data?.data ?? {};
      setTermsContent(data.content ?? "");
    } catch (err) {
      console.error("fetchTerms", err);
      setTermsContent("");
    } finally {
      setTermsLoading(false);
    }
  };

  const openTermsEditor = () => {
    setTermsEditValue(termsContent ?? "");
    setTermsEditOpen(true);
  };

  const saveTerms = async () => {
    try {
      setTermsSaving(true);
      const payload = { content: termsEditValue ?? "" };
      const res = await axios.put(TERMS_BASE, payload, getAuthConfig());
      if (res.data?.success) {
        const updated = res.data?.data ?? {};
        setTermsContent(updated.content ?? termsEditValue);
        setTermsEditOpen(false);
        alert("Terms & Conditions updated successfully.");
      } else {
        setTermsContent(termsEditValue);
        setTermsEditOpen(false);
        alert("Saved locally (server did not return success).");
      }
    } catch (err) {
      console.error("saveTerms", err);
      alert("Failed to save Terms & Conditions.");
    } finally {
      setTermsSaving(false);
    }
  };

  const fetchAbout = async () => {
    try {
      setAboutLoading(true);
      const res = await axios.get(ABOUT_BASE, getAuthConfig());
      const data = res.data?.data ?? res.data ?? {};
      // backend might return object with content
      setAboutContent(data.content ?? data?.content ?? "");
    } catch (err) {
      console.error("fetchAbout", err);
      setAboutContent("");
    } finally {
      setAboutLoading(false);
    }
  };

  const openAboutEditor = () => {
    setAboutEditValue(aboutContent ?? "");
    setAboutEditOpen(true);
  };

  const saveAbout = async () => {
    try {
      setAboutSaving(true);
      const payload = { content: aboutEditValue ?? "" };
      const res = await axios.put(ABOUT_BASE, payload, getAuthConfig());
      if (res.data?.success) {
        const updated = res.data?.data ?? {};
        setAboutContent(updated.content ?? aboutEditValue);
        setAboutEditOpen(false);
        alert("About Us updated successfully.");
      } else {
        setAboutContent(aboutEditValue);
        setAboutEditOpen(false);
        alert("Saved locally (server did not return success).");
      }
    } catch (err) {
      console.error("saveAbout", err);
      alert("Failed to save About Us.");
    } finally {
      setAboutSaving(false);
    }
  };

  /* ---------------- useEffect to load per-tab ---------------- */
  useEffect(() => {
    if (activeTab === "products") fetchCategories();
    if (activeTab === "coupons") fetchCoupons();
    if (activeTab === "notifications") fetchNotifSettings();
    if (activeTab === "customersupport") fetchSupport();
    if (activeTab === "terms") fetchTerms();
    if (activeTab === "about") fetchAbout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /* ---------------- MODAL / UI HANDLERS (kept for completeness) ---------------- */

  // Category Handlers
  const addNewBlock = () => setAddBlocks((s) => [...s, emptyBlock()]);
  const removeBlock = (id: string) => setAddBlocks((s) => s.filter((b) => b.id !== id));
  const updateBlockName = (id: string, v: string) => setAddBlocks((s) => s.map((b) => (b.id === id ? { ...b, name: v } : b)));
  const updateBlockFile = (id: string, f: File | null) =>
    setAddBlocks((s) =>
      s.map((b) =>
        b.id === id ? { ...b, file: f, preview: f ? URL.createObjectURL(f) : null } : b
      )
    );
  const openAddModal = () => {
    setIsEditMode(false);
    setAddBlocks([emptyBlock()]);
    setShowCategoryModal(true);
  };
  const openEditModal = (cat: Category) => {
    setIsEditMode(true);
    setEditId(cat._id);
    setEditName(cat.name);
    setEditFile(null);
    setEditPreview(cat.image?.url ?? null);
    setShowCategoryModal(true);
  };
  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setIsEditMode(false);
    setEditId(null);
    setEditName("");
    setEditFile(null);
    setEditPreview(null);
    setAddBlocks([emptyBlock()]);
    fetchCategories();
  };
  const handleAddFileChange = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    const f = e.target.files?.[0] ?? null;
    updateBlockFile(id, f);
  };
  const handleEditFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setEditFile(f);
    setEditPreview(f ? URL.createObjectURL(f) : null);
  };
  const handleSaveAdds = async () => {
    const nonEmpty = addBlocks.filter((b) => b.name.trim() !== "" || b.file);
    if (nonEmpty.length === 0) return alert("Please add at least one category (name or image).");
    for (const b of nonEmpty) {
      if (!b.name.trim()) return alert("Each category needs a name.");
    }
    try {
      setSaving(true);
      await Promise.all(
        nonEmpty.map(async (b) => {
          const form = new FormData();
          form.append("name", b.name.trim());
          if (b.file) form.append("image", b.file);
          await axios.post(CATEGORIES_BASE, form, {
            ...getAuthConfig(),
            headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
          });
        })
      );
      alert("Categories added successfully.");
      setAddBlocks([emptyBlock()]);
      fetchCategories();
    } catch (err) {
      console.error("save adds error", err);
      alert("Failed to add categories.");
    } finally {
      setSaving(false);
    }
  };
  const handleSaveEdit = async () => {
    if (!editId) return;
    if (!editName.trim()) return alert("Please enter category name.");
    try {
      setSaving(true);
      const form = new FormData();
      form.append("name", editName.trim());
      if (editFile) form.append("image", editFile);
      await axios.put(`${CATEGORIES_BASE}/${editId}`, form, {
        ...getAuthConfig(),
        headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
      });
      alert("Category updated.");
      closeCategoryModal();
      fetchCategories();
    } catch (err) {
      console.error("save edit error", err);
      alert("Failed to update category.");
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      setCategories((prev) => prev.filter((c) => c._id !== id));
      await axios.delete(`${CATEGORIES_BASE}/${id}`, getAuthConfig());
      alert("Category deleted successfully.");
      fetchCategories();
    } catch (err) {
      console.error("delete category", err);
      alert("Failed to delete category.");
      fetchCategories();
    }
  };

  // Coupon Handlers
  const mapToRow = (c: ApiCoupon) => {
    const d = (c.discount ?? { value: 0 }) as any;
    const discountValue = typeof d === "number" ? d : d.value ?? 0;
    const discountType = typeof d === "number" ? undefined : d.type;
    const expiryISO = c.expiryDate ?? c.updatedAt ?? c.createdAt ?? "";
    const validityLabel = expiryISO ? new Date(expiryISO).toLocaleDateString() : "-";
    const appliesTo = Array.isArray(c.appliesTo) ? c.appliesTo.join(", ") : (c.appliesTo as any) ?? "All Products";
    const createdByLabel = c.createdBy && typeof c.createdBy === "object" ? (c.createdBy.name ?? c.createdBy._id ?? String(c.createdBy)) : String(c.createdBy ?? "-");
    let status = (c.status ?? "").toString();
    if (!status) {
      if (!expiryISO) status = "Active";
      else status = new Date(expiryISO) > new Date() ? "Active" : "Expired";
    }
    return { _id: c._id, code: c.code, discountValue: Number(discountValue), discountType, appliesTo, createdByLabel, validityLabel, expiryISO, status };
  };
  const couponRows = couponsRaw.map(mapToRow);
  const filtered = couponRows.filter((r) => {
    const matchesFilter = couponFilter === "all" ? true : couponFilter === "active" ? r.status.toLowerCase() === "active" : r.status.toLowerCase() === "expired";
    const matchesSearch = r.code.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / couponsPerPage));
  const indexOfLast = currentPage * couponsPerPage;
  const indexOfFirst = indexOfLast - couponsPerPage;
  const currentCoupons = filtered.slice(indexOfFirst, indexOfLast);
  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const openAddCoupon = () => {
    setShowAddCoupon(true);
    setFormCode("");
    setFormDiscount("");
    setFormDiscountType("Percentage");
    setFormMinOrder("");
    setFormUsageLimit("");
    setFormStartDate("");
    setFormExpiryDate("");
    setFormAppliesTo("");
  };
  const closeAddCoupon = () => setShowAddCoupon(false);
  const handleCreateCoupon = async () => {
    if (!formCode.trim()) return alert("Coupon Code required");
    if (!formDiscount) return alert("Discount required");
    if (!formExpiryDate) return alert("Expiry Date required");
    try {
      setCreatingCoupon(true);
      const payload = {
        code: formCode.trim(),
        discount: { value: Number(formDiscount), type: formDiscountType, },
        minimumOrder: formMinOrder ? Number(formMinOrder) : 0,
        usageLimitPerUser: formUsageLimit ? Number(formUsageLimit) : 1,
        totalUsageLimit: formTotalUsage ? Number(formTotalUsage) : 50,
        startDate: new Date(formStartDate).toISOString(),
        expiryDate: new Date(formExpiryDate).toISOString(),
        appliesTo: formAppliesTo?.length ? formAppliesTo : ["All Products"],
        applicableProducts: [],
      };
      await axios.post(COUPONS_BASE, payload, {
        ...getAuthConfig(),
        headers: { ...getAuthConfig().headers, "Content-Type": "application/json" },
      });
      alert("Coupon created successfully.");
      closeAddCoupon();
      await fetchCoupons();
    } catch (err) {
      console.error("create coupon error", err);
      alert("Failed to create coupon.");
    } finally {
      setCreatingCoupon(false);
    }
  };
   const openDeleteModal = (id: string, code: string) => { setOpenDeleteId(id); setOpenDeleteCode(code); setDeleteReason(""); };
  const closeDeleteModal = () => { setOpenDeleteId(null); setOpenDeleteCode(null); setDeleteReason(""); };
  const confirmDeleteCoupon = async () => {
    if (!openDeleteId) return;
    if (!deleteReason.trim()) return alert("Please enter a reason.");
    try {
      await axios.delete(`${COUPONS_BASE}/${openDeleteId}`, { ...getAuthConfig(), data: { reason: deleteReason.trim() }, });
      setCouponsRaw((prev) => prev.filter((c) => c._id !== openDeleteId));
      closeDeleteModal();
      alert("Coupon deleted successfully.");
    } catch (err) {
      console.error("delete coupon error", err);
      alert("Failed to delete coupon.");
    }
  };
  const handleFilterSelect = (filterKey: "all" | "active" | "expired") => {
    setCouponFilter(filterKey);
    setCurrentPage(1);
    setShowFilterDropdown(false);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="flex bg-gray-100 h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-200 border-r border-gray-200 p-8 fixed h-full">
        <nav className="flex flex-col gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium transition ${activeTab === tab.id
                ? "bg-white shadow-sm text-gray-900"
                : "hover:bg-gray-200 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 px-10 py-6 overflow-y-auto">
        {/* PRODUCTS */}
        {activeTab === "products" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-6xl">
            <h2 className="text-gray-800 text-base font-medium mb-4">Manage Product Categories</h2>
            {loading && <div className="text-sm text-gray-500 mb-3">Loading categories...</div>}

            <div className="space-y-3 mb-10">
              {categories.map((cat, idx) => (
                <div key={cat._id} className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-800 text-sm">{idx + 1}. {cat.name}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="flex items-center justify-center w-9 h-9 rounded-md border border-red-200 bg-white hover:bg-red-50"
                      title="Delete"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 text-red-600"><Trash2 size={16} /></span>
                    </button>
                    <button
                      onClick={() => openEditModal(cat)}
                      className="flex items-center justify-center w-9 h-9 rounded-md border border-sky-100 bg-white hover:bg-sky-50"
                      title="Edit"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 text-sky-500"><Edit size={16} /></span>
                    </button>
                  </div>
                </div>
              ))}
              {!loading && categories.length === 0 && (
                <div className="text-sm text-gray-500">No categories yet.</div>
              )}
            </div>

            <button onClick={openAddModal} className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-[15px] font-medium">
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-sky-500"><Plus size={12} /></span>
              Add a category
            </button>
          </div>
        )}

        {/* COUPONS */}
        {activeTab === "coupons" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg px-3 py-2 w-72">
                  <Search className="text-gray-500 w-5 h-5 mr-2" />
                  <input type="text" placeholder="Search by code" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full outline-none text-gray-700" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 transition"
                  >
                    <Filter size={16} />
                    Filter
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'expired', label: 'Expired' }].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => handleFilterSelect(option.key as any)}
                          className={`block w-full text-left px-4 py-2 text-sm ${couponFilter === option.key ? 'bg-sky-100 text-sky-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          {option.label}
                          {couponFilter === option.key && <span className="ml-2">({option.label})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button onClick={openAddCoupon} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm flex items-center gap-2">
                  <Plus size={14} /> Add Coupon
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-700 font-semibold">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Applies to</th>
                    <th className="py-3 px-4">Created by</th>
                    <th className="py-3 px-4">Validity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {couponLoading ? (
                    <tr><td colSpan={7} className="p-4 text-sm text-gray-500">Loading coupons...</td></tr>
                  ) : currentCoupons.length === 0 ? (
                    <tr><td colSpan={7} className="p-4 text-sm text-gray-500">No coupons found.</td></tr>
                  ) : (
                    currentCoupons.map((c) => (
                      <tr key={c._id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">{c.code}</td>
                        <td className="py-3 px-4">{c.discountValue}{c.discountType ? ` (${c.discountType})` : (typeof c.discountValue === "number" ? "%" : "")}</td>
                        <td className="py-3 px-4">{c.appliesTo}</td>
                        <td className="py-3 px-4">{c.createdByLabel}</td>
                        <td className="py-3 px-4">{c.validityLabel}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.status.toLowerCase() === "active" ? "bg-green-100 text-green-700" : "bg-gray-300 text-gray-700"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => openDeleteModal(c._id, c.code)} className="text-red-500 border p-1.5 rounded-md">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
              <span>Results per page - {couponsPerPage}</span>
              <span>{currentPage} of {totalPages} pages</span>
              <div className="flex items-center space-x-2">
                <button onClick={handlePrev} disabled={currentPage === 1} className={`p-1 rounded-full border ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}><svg width="20" height="20" fill="none" stroke="currentColor"><path d="M12 5l-5 5 5 5" /></svg></button>
                <button onClick={handleNext} disabled={currentPage === totalPages} className={`p-1 rounded-full border ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}><svg width="20" height="20" fill="none" stroke="currentColor"><path d="M8 5l5 5-5 5" /></svg></button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- NOTIFICATIONS TAB (MODIFIED LAYOUT) ---------------- */}
        {activeTab === "notifications" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-6xl">
            <h2 className="text-gray-800 text-xl font-semibold mb-6">Manage User Notifications</h2>

            <div className="mb-8">
              {notifLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center justify-between py-2  last:border-b-0">
                    <div className="text-base font-medium text-gray-800">Order Placed</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifSettings.orderPlaced}
                        onChange={() => updateNotifSetting("orderPlaced")}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2  last:border-b-0">
                    <div className="text-base font-medium text-gray-800">Order Cancelled</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifSettings.orderCancelled}
                        onChange={() => updateNotifSetting("orderCancelled")}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2  last:border-b-0">
                    <div className="text-base font-medium text-gray-800">Order Picked up/Delivered</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifSettings.orderPickedUpDelivered}
                        onChange={() => updateNotifSetting("orderPickedUpDelivered")}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="text-base font-medium text-gray-800">Price Drop</div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifSettings.priceDrop}
                        onChange={() => updateNotifSetting("priceDrop")}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CUSTOMER SUPPORT */}
        {activeTab === "customersupport" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 w-full max-w-10xl">
            <h2 className="text-gray-900 text-lg font-semibold mb-5">Customer Support</h2>

            {loadingSupport ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-600" size={18} />
                    <span className="text-gray-900 text-[15px]">{supportData?.phone ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSupportDelete("phone")} className="p-1.5 rounded-md border border-red-300 text-red-500 hover:bg-red-50 transition"><Trash2 size={16} /></button>
                    <button onClick={() => handleSupportEdit("phone", supportData?.phone ?? "")} className="p-1.5 rounded-md border border-sky-300 text-sky-500 hover:bg-sky-50 transition"><Edit size={16} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-600" size={18} />
                    <span className="text-gray-900 text-[15px]">{supportData?.email ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSupportDelete("email")} className="p-1.5 rounded-md border border-red-300 text-red-500 hover:bg-red-50 transition"><Trash2 size={16} /></button>
                    <button onClick={() => handleSupportEdit("email", supportData?.email ?? "")} className="p-1.5 rounded-md border border-sky-300 text-sky-500 hover:bg-sky-50 transition"><Edit size={16} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <Clock className="text-gray-600" size={18} />
                    <span className="text-gray-900 text-[15px]">{supportData?.operatingHours ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSupportDelete("operatingHours")} className="p-1.5 rounded-md border border-red-300 text-red-500 hover:bg-red-50 transition"><Trash2 size={16} /></button>
                    <button onClick={() => handleSupportEdit("operatingHours", supportData?.operatingHours ?? "")} className="p-1.5 rounded-md border border-sky-300 text-sky-500 hover:bg-sky-50 transition"><Edit size={16} /></button>
                  </div>
                </div>
              </div>
            )}

            {/* support edit modal */}
            {supportEditField && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-[#f9f9f9] rounded-2xl shadow-xl w-full max-w-md relative p-6 border border-gray-200">
                  <button onClick={handleSupportCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"><X size={22} /></button>
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">Edit</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {supportEditField === "phone" ? "Phone Number" : supportEditField === "email" ? "Email" : "Operating Hours"}
                  </label>
                  <input type={supportEditField === "email" ? "email" : "text"} value={supportTempValue} onChange={(e) => setSupportTempValue(e.target.value)} placeholder="--" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[15px] bg-white focus:ring-1 focus:ring-green-500 focus:outline-none" />
                  <div className="flex justify-center mt-8">
                    <button onClick={handleSupportSave} className="bg-green-500 hover:bg-green-600 text-white text-[15px] px-10 py-2.5 rounded-md font-medium transition">Save</button>
                  </div>
                </div>
              </div>
            )}
          </div> 
        )}

        {/* TERMS card (big rounded + edit icon top-right) */}
        {activeTab === "terms" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full max-w-6xl relative">
            <h3 className="text-2xl font-medium text-gray-800 mb-6">Terms & Conditions</h3>

            {/* edit pen */}
            <button onClick={openTermsEditor} title="Edit terms" className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-md  bg-white hover:bg-sky-50">
              <Edit className="text-sky-500" size={18} />
            </button>

            <div className=" rounded-xl p-8 text-gray-700 text-base leading-7 max-w-full">
              {/* show numbered list if content contains newlines; keep whitespace */}
              <div className="whitespace-pre-line">
                {termsLoading ? "Loading..." : (termsContent && termsContent.trim() ? termsContent : "No content yet. Click the edit icon to add Terms & Conditions.")}
              </div>
            </div>

            {/* Terms Editor Modal (reuse modal style per screenshot) */}
            {termsEditOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold border-b- text-gray-900">Update Privacy Policy</h3>
                    <button onClick={() => setTermsEditOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                  </div>

                  <div className="bg-white   rounded-lg p-6 mb-6">
                    <textarea value={termsEditValue} onChange={(e) => setTermsEditValue(e.target.value)} rows={10} className="w-full h-48 border rounded-md p-4 text-gray-800 focus:outline-none resize-y" placeholder="Write or paste terms & conditions here..." />
                  </div>

                  <div className="flex justify-center">
                    <button onClick={saveTerms} disabled={termsSaving} className="bg-green-500 hover:bg-green-600 text-white px-10 py-3 rounded-xl text-lg font-medium shadow">
                      {termsSaving ? "Saving..." : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT card (same layout & modal style) */}
        {activeTab === "about" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full max-w-6xl relative">
            <h3 className="text-2xl font-medium text-gray-800 mb-6">About Us</h3>

            <button onClick={openAboutEditor} title="Edit about" className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-md  bg-white hover:bg-sky-50">
              <Edit className="text-sky-500" size={18} />
            </button>

            <div className=" rounded-xl p-8 text-gray-700 text-base leading-7 max-w-full">
              <div className="whitespace-pre-line">
                {aboutLoading ? "Loading..." : (aboutContent && aboutContent.trim() ? aboutContent : "No content yet. Click the edit icon to add About Us content.")}
              </div>
            </div>

            {aboutEditOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Update About Us</h3>
                    <button onClick={() => setAboutEditOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                  </div>

                  <div className="bg-white  rounded-lg p-6 mb-6">
                    <textarea value={aboutEditValue} onChange={(e) => setAboutEditValue(e.target.value)} rows={10} className="w-full h-48 border rounded-md p-4 text-gray-800 focus:outline-none resize-y" placeholder="Write or paste About Us content here..." />
                  </div>

                  <div className="flex justify-center">
                    <button onClick={saveAbout} disabled={aboutSaving} className="bg-green-500 hover:bg-green-600 text-white px-10 py-3 rounded-xl text-lg font-medium shadow">
                      {aboutSaving ? "Saving..." : "Update"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ---------------- MODALS (kept for completeness) ---------------- */}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-[720px] p-6 relative max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-gray-800 font-medium text-[18px]">{isEditMode ? "Edit a category" : "Add a category"}</h3>
              <button onClick={closeCategoryModal} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            {isEditMode ? (
              <>
                <div className="mb-5">
                  <label className="block text-gray-700 text-[15px] mb-2">Name of the category *</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="--" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-700 text-[15px] mb-2">Category Image *</label>
                  <div className="border border-gray-300 rounded-lg h-36 flex flex-col justify-center items-center text-center cursor-pointer" onClick={() => document.getElementById("editCategoryImageInput")?.click()}>
                    {editPreview ? <img src={editPreview} alt="preview" className="h-24 object-cover rounded-md" /> : <>
                      <div className="text-gray-400 mb-2"><PlusCircle size={32} /></div>
                      <p className="text-sm text-gray-500">Add a clear photo of the category</p>
                    </>}
                  </div>
                  <input id="editCategoryImageInput" type="file" accept="image/*" className="hidden" onChange={handleEditFileChange} />
                </div>
                <div className="flex justify-center">
                  <button onClick={handleSaveEdit} disabled={saving} className="bg-green-600 text-white px-12 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {addBlocks.map((b) => (
                    <div key={b.id} className="p-3 border rounded-md">
                      <div className="mb-3">
                        <label className="block text-gray-700 text-[15px] mb-2">Name of the category *</label>
                        <input type="text" value={b.name} onChange={(e) => updateBlockName(b.id, e.target.value)} placeholder="--" className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                      </div>
                      <div className="mb-2">
                        <label className="block text-gray-700 text-[15px] mb-2">Category Image *</label>
                        <div className="border border-gray-300 rounded-lg h-36 flex flex-col justify-center items-center text-center cursor-pointer" onClick={() => document.getElementById(`addImageInput-${b.id}`)?.click()}>
                          {b.preview ? <img src={b.preview} alt="preview" className="h-24 object-cover rounded-md" /> : <>
                            <div className="text-gray-400 mb-2"><PlusCircle size={32} /></div>
                            <p className="text-sm text-gray-500">Add a clear photo of the category</p>
                          </>}
                        </div>
                        <input id={`addImageInput-${b.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleAddFileChange(e, b.id)} />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div></div>
                        <div>
                          {addBlocks.length > 1 && (
                            <button onClick={() => removeBlock(b.id)} className="text-sm text-red-500 px-3 py-1 border rounded-md">Remove</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={addNewBlock} className="text-sky-600 flex items-center gap-2 text-sm font-medium hover:text-sky-700">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full border border-sky-500"><Plus size={12} /></span>
                    Add
                  </button>
                </div>
                <div className="flex justify-center">
                  <button onClick={handleSaveAdds} disabled={saving} className="bg-green-600 text-white px-12 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ADD COUPON MODAL */}
      {showAddCoupon && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[780px] p-7 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-gray-800 font-semibold text-[17px]">Create a Coupon</h3>
              <button onClick={closeAddCoupon} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-5 text-sm text-gray-700">
              <div>
                <label className="block mb-1 font-medium">Coupon Code <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} placeholder="-- " className="w-full border rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700">✨</span>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Discount <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="number" value={formDiscount as any} onChange={(e) => setFormDiscount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="-- " className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="relative">
                    <select value={formDiscountType} onChange={(e) => setFormDiscountType(e.target.value as any)} className="border rounded-lg p-2.5 focus:outline-none appearance-none pr-6 bg-white">
                      <option value="Percentage">%</option>
                      <option value="Fixed">₹</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Minimum Order</label>
                <input type="number" value={formMinOrder as any} onChange={(e) => setFormMinOrder(e.target.value === "" ? "" : Number(e.target.value))} placeholder="-- " className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Usage Limit / per person</label>
                <input type="number" value={formUsageLimit as any} onChange={(e) => setFormUsageLimit(e.target.value === "" ? "" : Number(e.target.value))} placeholder="-- " className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Start Date <span className="text-red-500">*</span></label>
                <input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Expiry Date <span className="text-red-500">*</span></label>
                <input type="date" value={formExpiryDate} onChange={(e) => setFormExpiryDate(e.target.value)} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Applicable on <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formAppliesTo} onChange={(e) => setFormAppliesTo(e.target.value)} className="w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white">
                    <option value="All Products">--</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button onClick={handleCreateCoupon} disabled={creatingCoupon} className="bg-green-600 text-white px-12 py-3 rounded-xl hover:bg-green-700 text-[15px] font-medium transition disabled:bg-green-300 w-full max-w-sm">
                {creatingCoupon ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE COUPON MODAL */}
      {openDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-xl font-medium text-gray-800">Delete a coupon</h3>
              <button onClick={closeDeleteModal} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="mb-8 mt-5">
              <label htmlFor="deleteReason" className="block text-gray-700 text-sm font-medium mb-2">Write your reason to delete the coupon</label>
              <textarea id="deleteReason" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"></textarea>
            </div>
            <div className="flex justify-center">
              <button onClick={confirmDeleteCoupon} disabled={!deleteReason.trim()} className="bg-green-600 text-white px-10 py-3 rounded-xl hover:bg-green-700 text-[15px] font-medium transition disabled:bg-green-300 w-full max-w-xs">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
