"use client";

import { useState } from "react";
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

export default function ManagePanel() {
  const [activeTab, setActiveTab] = useState("products");

  const [categories, setCategories] = useState([
    "Fruits",
    "Vegetables",
    "Plants",
    "Seeds",
    "Handicrafts",
  ]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editCouponIndex, setEditCouponIndex] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const couponsPerPage = 12;
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );

  const [coupons, setCoupons] = useState(
    Array(12)
      .fill(0)
      .map((_, i) => ({
        code: `CC00${i + 1}`,
        discount: "20%",
        applies: "All Products",
        validity: "30/09/2025",
        status: "Active",
      }))
  );

  // --- Customer Support state (NEW) ---
  const [supportItems, setSupportItems] = useState([
    {
      id: 1,
      type: "phone",
      label: "+91 9999999999",
      icon: "phone",
    },
    {
      id: 2,
      type: "email",
      label: "abcd@gmail.com",
      icon: "mail",
    },
    {
      id: 3,
      type: "time",
      label: "10:00 AM - 8:00 PM",
      icon: "clock",
    },
  ]);
  const [editSupportIndex, setEditSupportIndex] = useState<number | null>(
    null
  );
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportValue, setSupportValue] = useState("");

  // === About & Terms state (NEW) ===
  // About text (single block)
  const [aboutText, setAboutText] = useState(
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
  );

  // Terms — array of bullet/numbered items (matches screenshot style)
  const [termsList, setTermsList] = useState<string[]>([
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    "Dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  ]);

  // Edit modal for About/Terms
  const [showDocModal, setShowDocModal] = useState(false);
  const [docEditType, setDocEditType] = useState<"about" | "terms" | null>(
    null
  );
  const [editTermIndex, setEditTermIndex] = useState<number | null>(null);
  const [docValue, setDocValue] = useState("");

  // Filter / pagination for coupons
  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.applies.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / couponsPerPage));
  const indexOfLast = currentPage * couponsPerPage;
  const indexOfFirst = indexOfLast - couponsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext =
    () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Category handlers
  const handleAddCategory = () => {
    if (newCategory.trim() === "") return;
    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
    setShowModal(false);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setNewCategory(categories[index]);
    setShowModal(true);
  };

  const handleSaveEdit = () => {
    if (editIndex !== null && newCategory.trim() !== "") {
      const updated = [...categories];
      updated[editIndex] = newCategory.trim();
      setCategories(updated);
      setEditIndex(null);
      setNewCategory("");
      setShowModal(false);
    }
  };

  const handleDelete = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  // Coupon handlers
  const handleEditCoupon = (index: number) => {
    setEditCouponIndex(index);
    setShowCouponModal(true);
    setOpenDropdownIndex(null);
  };

  const handleDeleteCoupon = (index: number) => {
    setCoupons(coupons.filter((_, i) => i !== index));
    setOpenDropdownIndex(null);
    setCurrentPage(1);
  };

  const handleSaveCoupon = () => {
    setShowCouponModal(false);
    setEditCouponIndex(null);
  };

  // --- Customer support handlers (NEW) ---
  const handleEditSupport = (index: number) => {
    setEditSupportIndex(index);
    setSupportValue(supportItems[index].label);
    setShowSupportModal(true);
  };

  const handleDeleteSupport = (index: number) => {
    setSupportItems(supportItems.filter((_, i) => i !== index));
  };

  const handleSaveSupport = () => {
    if (editSupportIndex !== null) {
      const updated = [...supportItems];
      updated[editSupportIndex] = {
        ...updated[editSupportIndex],
        label: supportValue.trim() === "" ? updated[editSupportIndex].label : supportValue,
      };
      setSupportItems(updated);
    }
    setEditSupportIndex(null);
    setShowSupportModal(false);
    setSupportValue("");
  };

  // === About/Terms handlers (NEW) ===
  const openEditAbout = () => {
    setDocEditType("about");
    setDocValue(aboutText);
    setEditTermIndex(null);
    setShowDocModal(true);
  };

  const openEditTerm = (index: number) => {
    setDocEditType("terms");
    setEditTermIndex(index);
    setDocValue(termsList[index]);
    setShowDocModal(true);
  };

  const handleSaveDoc = () => {
    if (docEditType === "about") {
      setAboutText(docValue);
    } else if (docEditType === "terms") {
      if (editTermIndex !== null) {
        const updated = [...termsList];
        updated[editTermIndex] = docValue;
        setTermsList(updated);
      }
    }
    setDocEditType(null);
    setEditTermIndex(null);
    setDocValue("");
    setShowDocModal(false);
  };

  const handleAddTerm = () => {
    setTermsList([...termsList, "New term..."]);
  };

  const handleDeleteTerm = (index: number) => {
    setTermsList(termsList.filter((_, i) => i !== index));
  };

  return (
    <div className="flex bg-[#f9fafb] min-h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f3f4f6] border-r border-gray-200 p-5 fixed h-full">
        <nav className="flex flex-col gap-4">
          {[
            "Products",
            "Coupons",
            "Notifications",
            "Customer Support",
            "Terms & Conditions",
            "About Us",
          ].map((tab) => (
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

      {/* Main Panel */}
      <main className="flex-1 ml-64 px-10 py-6 overflow-y-auto">
        {/* Product Section */}
        {activeTab === "products" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-4xl">
            <h2 className="text-gray-800 text-base font-medium mb-4">
              Manage Product Categories
            </h2>
            <div className="space-y-3 mb-10">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-gray-300 pb-4"
                >
                  <span className="text-gray-700 text-[15px]">
                    {index + 1}. {category}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-600 border border-red-300 rounded-md p-1.5"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-sky-500 border-sky-300 rounded-md p-1.5"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setShowModal(true);
                setEditIndex(null);
                setNewCategory("");
              }}
              className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-[15px] font-medium"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-sky-500">
                <Plus size={12} />
              </span>
              Add a category
            </button>
          </div>
        )}

        {/* Coupon Section */}
        {activeTab === "coupons" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-5xl relative">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => {
                  setShowCouponModal(true);
                  setEditCouponIndex(null);
                }}
                className="border-green-500 border hover:border-2 text-green-500 font-medium px-5 py-2 rounded-lg shadow"
              >
                + Create a Coupon
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border rounded-lg px-3 py-2 w-72">
                  <Search className="text-gray-500 w-5 h-5 mr-2" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full outline-none text-gray-700"
                  />
                </div>
                <button className="flex items-center border px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600">
                  <Filter className="w-4 h-4 mr-1" /> Filters
                </button>
              </div>
            </div>

            {/* Coupon Table */}
            <table className="min-w-full border rounded-xl overflow-hidden relative">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-700 font-semibold">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Applies to</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCoupons.map((coupon, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{coupon.code}</td>
                    <td className="py-3 px-4">{coupon.discount}</td>
                    <td className="py-3 px-4">{coupon.applies}</td>
                    <td className="py-3 px-4">{coupon.validity}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          coupon.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 relative">
                      <button
                        onClick={() =>
                          setOpenDropdownIndex(
                            openDropdownIndex === index ? null : index
                          )
                        }
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical className="text-gray-500 w-5 h-5" />
                      </button>

                      {openDropdownIndex === index && (
                        <div className="absolute right-6 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => handleEditCoupon(index)}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => handleDeleteCoupon(index)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
              <span>Results per page - {couponsPerPage}</span>
              <span>
                {currentPage} of {totalPages} pages
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`p-1 rounded-full border ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor">
                    <path d="M12 5l-5 5 5 5" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-full border ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor">
                    <path d="M8 5l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeTab === "notifications" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-4xl max-w-4xl">
            <h2 className="text-gray-800 text-base font-medium mb-6">
              Manage User Notifications
            </h2>

            <div className="space-y-6 text-gray-700 text-sm">
              {[
                "Order Placed",
                "Order Cancelled",
                "Order Picked up/Delivered",
                "Price Drop",
              ].map((label, index) => (
                <div
                  key={index}
                  className="flex  pl-4 grid grid-cols-3 gap-40 items-center pb-3"
                >
                  <div className="col-span-2">{label}</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all"></div>
                    <div className="absolute left-[2px] top-[2px] bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Support Section */}
        {activeTab === "customersupport" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-4xl">
            <h2 className="text-gray-800 text-base font-medium mb-4">
              Customer Support
            </h2>

            <div className="space-y-4 text-gray-700 text-sm">
              {supportItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7">
                      {item.type === "phone" && <Phone className="w-5 h-5 text-gray-500" />}
                      {item.type === "email" && <Mail className="w-5 h-5 text-gray-500" />}
                      {item.type === "time" && <Clock className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="text-gray-700">{item.label}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteSupport(idx)}
                      className="border border-red-200 p-1.5 rounded text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => handleEditSupport(idx)}
                      className="border border-sky-100 p-1.5 rounded text-sky-500"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* empty space like screenshot */}
              <div className="h-28" />
            </div>
          </div>
        )}

        {/* Terms & Conditions Section (NEW) */}
        {activeTab === "terms&conditions" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-5xl relative">
            <h2 className="text-gray-800 text-base font-medium mb-4 flex items-center justify-between">
              <span>Terms &amp; Conditions</span>
              <button
                onClick={() => {
                  // open edit for first term by default (or open generic modal to edit whole list)
                  // We'll open a simple add/edit UI via icon — open doc modal for 'terms' without index to allow adding
                  setDocEditType("terms");
                  setDocValue("");
                  setEditTermIndex(null);
                  setShowDocModal(true);
                }}
                className="text-sky-500 p-1"
                title="Edit terms"
              >
                <Edit size={18} />
              </button>
            </h2>

            <div className="text-gray-700 text-sm">
              <ol className="list-decimal pl-6 space-y-6">
                {termsList.map((t, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-1">{t}</div>
                    <div className="flex gap-2">
                      {/* <button
                        onClick={() => openEditTerm(i)}
                        className="border border-sky-100 p-1.5 rounded text-sky-500"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button> */}
                      {/* <button
                        onClick={() => handleDeleteTerm(i)}
                        className="border border-red-200 p-1.5 rounded text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button> */}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6">
                {/* <button
                  onClick={handleAddTerm}
                  className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-[15px] font-medium"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full border border-sky-500">
                    <Plus size={12} />
                  </span>
                  Add a term
                </button> */}
              </div>
            </div>
          </div>
        )}

        {/* About Us Section (NEW) */}
        {activeTab === "aboutus" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-5xl relative">
            <h2 className="text-gray-800 text-base font-medium mb-4 flex items-center justify-between">
              <span>About Us</span>
              <button
                onClick={openEditAbout}
                className="text-sky-500 p-1"
                title="Edit about"
              >
                <Edit size={18} />
              </button>
            </h2>

            <div className="text-gray-700 text-sm">
              <p>{aboutText}</p>
            </div>
          </div>
        )}
      </main>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-gray-800 font-medium text-[15px]">
                {editIndex !== null ? "Edit category" : "Add a category"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <label className="block text-sm text-gray-700 mb-2">
              Name of the category *
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="--"
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <button
              onClick={() => setNewCategory("")}
              className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm mt-3"
            >
              <Plus size={14} /> Add
            </button>

            <div className="mt-6 flex justify-center">
              <button
                onClick={editIndex !== null ? handleSaveEdit : handleAddCategory}
                className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[550px] p-6 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-gray-800 font-medium text-[15px]">
                {editCouponIndex !== null ? "Edit Coupon" : "Create a Coupon"}
              </h3>
              <button
                onClick={() => {
                  setShowCouponModal(false);
                  setEditCouponIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <label className="block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="--"
                  value={
                    editCouponIndex !== null
                      ? coupons[editCouponIndex].code
                      : ""
                  }
                  onChange={(e) => {
                    if (editCouponIndex !== null) {
                      const updated = [...coupons];
                      updated[editCouponIndex].code = e.target.value;
                      setCoupons(updated);
                    }
                  }}
                  className="w-full border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block mb-1">Discount *</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="--"
                    value={
                      editCouponIndex !== null
                        ? coupons[editCouponIndex].discount.replace(/[^0-9]/g, "")
                        : ""
                    }
                    onChange={(e) => {
                      if (editCouponIndex !== null) {
                        const updated = [...coupons];
                        updated[editCouponIndex].discount =
                          e.target.value + "%";
                        setCoupons(updated);
                      }
                    }}
                    className="w-full border rounded-md p-2"
                  />
                  <select className="border rounded p-2">
                    <option>%</option>
                    <option>₹</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Minimum Order</label>
                <input type="text" placeholder="--" className="w-full border rounded-md p-2" />
              </div>

              <div>
                <label className="block mb-1">Usage Limit/per person</label>
                <input type="text" placeholder="--" className="w-full border rounded-md p-2" />
              </div>

              <div>
                <label className="block mb-1">Start Date *</label>
                <input type="date" className="w-full border rounded-md p-2" />
              </div>

              <div>
                <label className="block mb-1">End Date *</label>
                <input type="date" className="w-full border rounded-md p-2" />
              </div>

              <div className="col-span-2">
                <label className="block mb-1">Applies To *</label>
                <select className="border rounded-md p-2 w-full">
                  <option>All Products</option>
                  <option>Specific Category</option>
                  <option>Specific Product</option>
                </select>
              </div>

              <div className="col-span-2 flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleSaveCoupon}
                  className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Support Edit Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[500px] p-6 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-gray-800 font-medium text-[15px]">Edit</h3>
              <button
                onClick={() => {
                  setShowSupportModal(false);
                  setEditSupportIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-700">
              {editSupportIndex !== null && supportItems[editSupportIndex].type === "phone" && (
                <>
                  <label className="block mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={supportValue}
                    onChange={(e) => setSupportValue(e.target.value)}
                    className="w-full border rounded-md p-3 text-sm"
                    placeholder="--"
                  />
                </>
              )}

              {editSupportIndex !== null && supportItems[editSupportIndex].type === "email" && (
                <>
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    value={supportValue}
                    onChange={(e) => setSupportValue(e.target.value)}
                    className="w-full border rounded-md p-3 text-sm"
                    placeholder="--"
                  />
                </>
              )}

              {editSupportIndex !== null && supportItems[editSupportIndex].type === "time" && (
                <>
                  <label className="block mb-2">Working Hours</label>
                  <input
                    type="text"
                    value={supportValue}
                    onChange={(e) => setSupportValue(e.target.value)}
                    className="w-full border rounded-md p-3 text-sm"
                    placeholder="e.g. 10:00 AM - 8:00 PM"
                  />
                </>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSaveSupport}
                className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About / Terms Edit Modal (NEW) */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[600px] p-6 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h3 className="text-gray-800 font-medium text-[15px]">
                {docEditType === "about" ? "Update Privacy Policy " : editTermIndex !== null ? "Edit Term" : "Update Privacy Policy"}
              </h3>
              <button
                onClick={() => {
                  setShowDocModal(false);
                  setDocEditType(null);
                  setEditTermIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-700">
              {docEditType === "about" && (
                <>
                  {/* <label className="block mb-2">About Us</label> */}
                  <textarea
                    value={docValue}
                    onChange={(e) => setDocValue(e.target.value)}
                    className="w-full border rounded-md p-3 text-sm min-h-[120px]"
                    placeholder="About text..."
                  />
                </>
              )}

              {docEditType === "terms" && (
                <>
                  {/* <label className="block mb-2">
                    {editTermIndex !== null ? `Term ${editTermIndex + 1}` : "New Term / Edit Terms"}
                  </label> */}
                  <textarea
                    value={docValue}
                    onChange={(e) => setDocValue(e.target.value)}
                    className="w-full border rounded-md p-3 text-sm min-h-[120px]"
                    placeholder=" "
                  />
                </>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  // If the modal was opened for terms add (editTermIndex null and docValue not empty),
                  // treat Save same as handleSaveDoc which handles both about and terms edit.
                  handleSaveDoc();
                }}
                className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700  px-14 py-2 text-sm font-medium"
              >
                Update
              </button>
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
