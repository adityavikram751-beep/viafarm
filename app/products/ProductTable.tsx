/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  MoreVertical,
  Search,
  Filter,
  Plus,
  X,
  ChevronDown,
  Star,
  Pencil,
  PlusCircle,
  SlidersHorizontal,
} from "lucide-react";

// ----------------------------------------------------
// Configuration & Helper Functions
// ----------------------------------------------------

// Base API URL
const BASE_URL = "https://viafarm-1.onrender.com";
const API_LIST_URL = `${BASE_URL}/api/admin/products`;

// Helper function to map API data
const mapProductData = (item: any) => ({
  id: item._id,
  name: item.name,
  vendor: item.vendor?.name || "Unknown Vendor",
  date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "",
  category: item.category,
  rate: `₹ ${item.price}/${item.unit}`,
  images: item.images || [],
});

// ----------------------------------------------------
// ProductTable Component (Main Page)
// ----------------------------------------------------

export default function ProductTable() {
  const [productList, setProductList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFilter, setOpenFilter] = useState(false); 

  // States for Pagination Control
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // States for View Modal and Drawer
  const [viewProduct, setViewProduct] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [openNutritionDrawer, setOpenNutritionDrawer] = useState(false);
  const [productIdForDrawer, setProductIdForDrawer] = useState<string | null>(null);
  
  // 💡 NEW STATE: To hold product data specifically for the drawer, even if viewProduct is null
  const [drawerProductData, setDrawerProductData] = useState<any | null>(null); 

  // Refs
  const filterRef = useRef<HTMLDivElement | null>(null); 
  const actionMenuRef = useRef<HTMLDivElement | null>(null);


  // --- CORE LOGIC 1: INITIAL DATA FETCH (Unchanged) ---
  useEffect(() => {
    const fetchAllProducts = async () => {
      // ... (unchanged fetch logic)
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            setError("No authorization token found. Please ensure you are logged in.");
            return;
        }

        const url = `${API_LIST_URL}?limit=1000`; // Fetch all

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
            throw new Error(`HTTP Error ${res.status} while fetching all products.`);
        }

        const json = await res.json();
        const productsArray = Array.isArray(json.data) ? json.data : [];
        const mapped = productsArray.map(mapProductData);

        setProductList(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to fetch products");
        setProductList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // --- NEW LOGIC: Close Action Menu on Outside Click (Unchanged) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the action menu div
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        // Also ensure the click isn't on the MoreVertical button itself (which toggles the menu)
        const isMoreButton = (event.target as HTMLElement).closest('[data-action-button="true"]');
        if (!isMoreButton) {
            setOpenActionMenu(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- NEW LOGIC: Close Filter Dropdown on Outside Click (Unchanged) ---
  useEffect(() => {
    const handleFilterClickOutside = (event: MouseEvent) => {
        // Check if the click occurred outside the filter area (button + dropdown)
        if (openFilter && filterRef.current && !filterRef.current.contains(event.target as Node)) {
            setOpenFilter(false);
        }
    };

    document.addEventListener("mousedown", handleFilterClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleFilterClickOutside);
    };
  }, [openFilter]);


  // --- CORE LOGIC 2: Fetch and View product (Refreshes data) (Unchanged) ---
  const handleView = useCallback(async (id: string) => {
    // ... (unchanged view fetch logic)
    setViewError(null);
    setViewLoading(true);
    setOpenActionMenu(null);
    setProductIdForDrawer(id); 

    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authorization token found.");

        const res = await fetch(`${BASE_URL}/api/admin/products/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch product details: HTTP ${res.status}`);
        }

        const json = await res.json();
        const productData = json.data.product || {};

        const mappedProduct = {
            id: productData._id,
            name: productData.name,
            price: productData.price,
            unit: productData.unit,
            category: productData.category,
            description: productData.description || "No description provided.",
            rating: productData.rating,
            images: productData.images || [],
            // Ensure nutritionalValue is null if no nutrients are present
            nutritionalValue: productData.nutritionalValue && productData.nutritionalValue.nutrients?.length > 0 ? productData.nutritionalValue : null,
            vendor: {
                name: productData.vendor?.name || "Unknown Vendor",
                profilePicture: productData.vendor?.profilePicture || "/vendor.jpg",
                address: productData.vendor?.address,
            },
        };

        setViewProduct(mappedProduct);

    } catch (err: any) {
        setViewError(err.message || "Failed to load product details.");
    } finally {
        setViewLoading(false);
    }
  }, []);


  // ----------------------------------------------------
  // --- CORE LOGIC 3: DRAWER OPENING/CLOSING/SAVING LOGIC (MODIFIED) ---
  // ----------------------------------------------------
  const handleAddNutritionClick = () => {
    // 1. Set data for the drawer (passes product details, including the null nutritionalValue)
    setDrawerProductData(viewProduct); 
    // 2. Close the View Modal immediately
    setViewProduct(null); 
    // 3. Open the Drawer
    setOpenNutritionDrawer(true);
  }

  const handleEditNutritionClick = () => {
    // 1. Set data for the drawer (passes product details, including the *existing* nutritionalValue)
    setDrawerProductData(viewProduct); 
    // 2. Close the View Modal immediately
    setViewProduct(null); 
    // 3. Open the Drawer. 
    setOpenNutritionDrawer(true); 
  }

  const handleDrawerClose = (productId: string | null) => {
    setOpenNutritionDrawer(false);
    setDrawerProductData(null); // Clear drawer specific data
    
    if (productId) {
        // Clear view and re-fetch to update view modal with fresh data
        setViewProduct(null); 
        setTimeout(() => {
            handleView(productId); // This re-opens the View Modal with updated data
        }, 50); 
    }
    setProductIdForDrawer(null);
  }

  const handleDrawerSaved = (productId: string | null, savedData: any) => {
    setOpenNutritionDrawer(false);
    setDrawerProductData(null); // Clear drawer specific data
    
    if (productId) {
        // Clear view and re-fetch to update view modal with fresh data
        setViewProduct(null); 
        setTimeout(() => {
            handleView(productId); // This re-opens the View Modal with updated data
        }, 50); 
    }
  }
  
  // --- Filtering/Pagination Logic (Unchanged) ---
  const filteredProducts = useMemo(() => {
    let tempProducts = productList;
    const query = searchQuery.trim().toLowerCase();
    if (query) tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(query) || p.vendor.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    if (selectedCategory !== 'All') tempProducts = tempProducts.filter(p => p.category === selectedCategory);
    return tempProducts;
  }, [productList, searchQuery, selectedCategory]);
  
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  const categories = useMemo(() => ["All", ...Array.from(new Set(productList.map((p) => p.category))).filter(Boolean)], [productList]);

  // --- Delete Logic (Omitted for brevity) ---
  const handleDelete = async (id: string) => {
    // ... (Deletion logic)
  };


  return (
    <div className="bg-white shadow rounded-lg m-6 p-4">
      
      {/* Search + Filter UI (Unchanged) */}
      <div className="flex justify-between items-center p-4 border-b relative">
         <div className="flex items-center gap-2 px-4 py-2 w-72 border border-gray-300 bg-white rounded-xl shadow-sm">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search "
            className="ml-2 w-full bg-transparent outline-none text-sm"
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
            }}
          />
        </div>

        <div className="relative" ref={filterRef}>
          {/* 🔥 Filter Button (screenshot-style) */}
          <button
            onClick={() => setOpenFilter((prev) => !prev)}
            className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-150"
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            <span>Filters</span>
          </button>

          {/* Dynamic Filter Dropdown */}
          {openFilter && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setOpenFilter(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    selectedCategory === cat ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading/Error (Unchanged) */}
      {loading && <p className="text-center py-10 text-gray-500">Fetching all products initially...</p>}
      {error && <p className="text-center py-10 text-red-500">❌ Error: {error}</p>}

      {/* Table (Unchanged) */}
      {!loading && !error && (
        <>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Date Posted</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">No products found matching your criteria.</td>
                </tr>
              ) : (
                currentProducts.map((p) => (
                    <tr
                        key={p.id}
                        className="border-b hover:bg-gray-50 relative"
                        data-product-id={p.id}
                    >
                      <td className="px-4 py-3">{p.name}</td>
                      <td className="px-4 py-3">{p.vendor}</td>
                      <td className="px-4 py-3">{p.date}</td>
                      <td className="px-4 py-3">{p.category}</td>
                      <td className="px-4 py-3">{p.rate}</td>
                      <td className="px-4 py-3 text-right">
                        {/* Action Toggle Button: Added data-action-button="true" */}
                        <button
                          className="p-2 rounded-full hover:bg-gray-100"
                          onClick={() => setOpenActionMenu(openActionMenu === p.id ? null : p.id)}
                          data-action-button="true" 
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500 pointer-events-none" />
                        </button>
                        {openActionMenu === p.id && (
                          <div
                            // Ref is conditionally attached to the open menu
                            ref={actionMenuRef} 
                            className="absolute right-4 top-10 bg-white border rounded-lg shadow-md w-32 z-10"
                          >
                            <button
                              onClick={() => handleView(p.id)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                             View
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                               Delete Product 
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Client-Side Pagination (Unchanged) */}
          <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-600">
            <span>Total Products (Filtered): {totalProducts}</span>
            <span>
              Page {totalProducts === 0 ? 0 : currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || totalProducts === 0}
              >
                &lt;
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalProducts === 0}
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      )}

      {/* View Modal (z-50) (Unchanged) */}
      {viewProduct && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/50 z-50 pt-12 pb-12 overflow-auto">
          <div className="bg-white rounded-2xl border shadow-lg w-full max-w-3xl p-6 relative">
{/* Header and Close Button */}
<div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
  <h2 className="text-xl font-medium text-gray-800">
    {viewProduct?.category || "Product Details"}
  </h2>
  <button
    onClick={() => setViewProduct(null)}
    className="text-gray-500 hover:text-black"
  >
    <X className="w-6 h-6" />
  </button>
</div>

{/* Gap between divider and image */}
<div className="mt-5"></div>



            {/* Loading / Error States in Modal */}
            {viewLoading && (
                <p className="text-center py-10  text-gray-500">Loading product details...</p>
            )}
            {viewError && (
                <p className="text-center py-10 text-red-500">❌ Error loading details: {viewError}</p>
            )}

            {/* Product Details (Only if loaded) */}
            {!viewLoading && !viewError && (
              <>
                {/* TOP SECTION: Image, Name, Rating, Price (Omitted for brevity) */}
               <div className=" flex items-start gap-18">
  {/* Product Image */}
  <img
    src={viewProduct.images?.[0] || "/no-image.jpg"}
    alt={viewProduct.name}
    className="w-50 h-30 object-cover rounded-xl"
  />

  {/* Product Details */}
  <div className="flex-1 pt-5">
    {/* Product Name + Rating */}
    <div className="flex items-center gap-20">
      <h3 className="text-xl font-semibold text-gray-800">
        {viewProduct.name}
      </h3>

      {viewProduct.rating && (
        <div className="flex items-center gap-1  border border-gray-300 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span>{Number(viewProduct.rating).toFixed(1)}</span>
        </div>
      )}
    </div>

    {/* Vendor Name */}
    <p className="font-semibold text-gray-500 mt-2">
      by {viewProduct.vendor?.name || "Unknown Vendor"}
    </p>

    {/* Price Section */}
    <p className="mt-2 text-xl font-semibold text-gray-900">
      ₹ {viewProduct.price}
      <span className="text-8 text-gray-700 font-normal">
        /{viewProduct.unit}
      </span>
    </p>
  </div>
</div>


                {/* About product & Vendor (Omitted for brevity) */}
                <div className="mt-6">
                  <h3 className="font-bold mb-2">About the product</h3>
                  <p className="text-gray-600 text-sm">
                    {viewProduct.description || "No description provided."}
                  </p>
                </div>
                <div className="mt-6">
                  <h3 className="font-bold mb-3">About the vendor</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={viewProduct.vendor?.profilePicture || "/vendor.jpg"}
                      alt={viewProduct.vendor?.name || "Vendor"}
                      className="w-20 h-20 rounded-lg "
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{viewProduct.vendor?.name || "Unknown Vendor"}</p>
                      <p className="text-8 font-semibold text-gray-600">
                        {viewProduct?.vendor?.address ? `Location - ${[viewProduct.vendor.address.houseNumber, viewProduct.vendor.address.locality, viewProduct.vendor.address.city,].filter(Boolean).join(", ")}` : "Location not available."}
                      </p>
                    </div>
                  </div>
                </div>


                {/* Nutritional Value - Dynamic Display Card (Unchanged) */}
                <div className="mt-6">
                  {viewProduct.nutritionalValue ? (
                    // State 1: Nutritional Value Exists (Show Card with Edit Button)
                    <div className="border rounded-lg p-4 bg-gray-50">

                      {/* Title and Edit Button */}
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-lg">
                          Nutritional Value
                          <span className="text-gray-500 text-sm font-normal ml-1">
                            ({viewProduct.nutritionalValue.servingSize || "per serving"})
                          </span>
                        </h4>

                        <button
                          onClick={handleEditNutritionClick} 
                          className="p-1 rounded-md  text-blue-500  hover:text-blue-700 -mt-1 -mr-1"
                          title="Edit Nutrition"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Dynamic Display layout for all nutrients from API */}
                      <div className="mt-2 text-sm text-gray-700 grid grid-cols-1 gap-y-1">
                          
                          {/* Loop through all nutrients returned by the API */}
                          {viewProduct.nutritionalValue.nutrients.map((n: any, index: number) => (
                              <div key={index} className="flex justify-start gap-3">
                                  {/* Display Nutrient Name */}
                                  <span className="font-medium w-1/4 capitalize">
                                      {n.name}
                                  </span>
                                  <span className="font-medium">:</span>
                                  {/* Display Nutrient Amount */}
                                  <span className="flex-1">
                                      {n.amount || 'N/A'}
                                  </span>
                              </div>
                          ))}

                          {/* Additional Note */}
                          {viewProduct.nutritionalValue.additionalNote && (
                              <p className="mt-3 text-gray-600 text-sm">
                                  {viewProduct.nutritionalValue.additionalNote}
                              </p>
                          )}
                      </div>
                    </div>
                  ) : (
                    // State 2: Nutritional Value Does NOT Exist (Show "Add Nutritional Value" button)
                    <button
                      onClick={handleAddNutritionClick}
                      className="mt-4 w-full flex items-center gap-2 justify-start border rounded-lg p-3 bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-5 h-5 text-blue-600 border border-blue-600 rounded-full" />
                      <span className="text-blue-600 font-medium">Add Nutritional Value</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Nutrition Drawer (Centered modal) (z-60) (MODIFIED) */}
      {openNutritionDrawer && (
        <AddNutritionDrawer
          // Pass the specific drawerProductData which contains the data before viewProduct was cleared
          product={drawerProductData || { id: productIdForDrawer, nutritionalValue: null }}
          onClose={handleDrawerClose}
          onSaved={handleDrawerSaved} 
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// AddNutritionDrawer component (Unchanged)
// ----------------------------------------------------
function AddNutritionDrawer({
  product,
  onClose,
  onSaved,
}: {
  product: any;
  onClose: (productId: string | null) => void;
  onSaved: (productId: string | null, savedData: any) => void;
}) {
  const BASE_URL = "https://viafarm-1.onrender.com";
  const productId = product?.id;
  const API_UPDATE_URL = `${BASE_URL}/api/admin/products/${productId}/nutritional-value`; 

  const initialNutrition = product?.nutritionalValue;

  const initialServingText = initialNutrition?.servingSize || "";
  const [servingLabel, setServingLabel] = useState<string>(
    initialServingText || ""
  ); 

  const [nutrients, setNutrients] = useState<{ name: string; amount: string }[]>(
    initialNutrition?.nutrients?.length > 0
      ? initialNutrition.nutrients.map((n: any) => ({ name: n.name, amount: n.amount }))
      : [{ name: "", amount: "" }] // Always start with at least one row
  );
  
  const [additionalNote, setAdditionalNote] = useState<string>(
    initialNutrition?.additionalNote || ""
  );
  const [saving, setSaving] = useState(false);


  // Add row
  const addRow = () => setNutrients((prev) => [...prev, { name: "", amount: "" }]);
  
  // Remove row
  const removeRow = (idx: number) =>
    setNutrients((prev) => {
      const newNutrients = prev.filter((_, i) => i !== idx);
      // Ensure there is always at least one row, even if empty
      if (newNutrients.length === 0) {
        return [{ name: "", amount: "" }];
      }
      return newNutrients;
    });

  // Update row
  const updateRow = (idx: number, field: "name" | "amount", value: string) =>
    setNutrients((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));

  // Save (PUT API Call Integration)
  const handleSave = async () => {
    try {
      if (!productId) {
        throw new Error("Product ID is missing for saving nutritional value.");
      }
      setSaving(true);

      const servingValueToSend = servingLabel.trim() || undefined;

      // API Payload Structure Confirmed
      const payload = {
        servingSize: servingValueToSend,
        // Filter out completely empty rows before sending
        nutrients: nutrients.filter(
          (n) => n.name.trim() !== "" && n.amount.trim() !== ""
        ), 
        additionalNote,
      };

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found.");

      const res = await fetch(API_UPDATE_URL, {
        method: 'PUT', // CONFIRMED METHOD
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            throw new Error("Authentication failed (401/403).");
        }
        throw new Error(`Failed to save nutritional value: HTTP ${res.status}`);
      }

      const json = await res.json();
      // Pass the product ID and saved data back to the parent
      onSaved(productId, json.data); 

      alert(json.message || "✅ Nutritional value updated successfully.");

    } catch (err: any) {
      alert("Failed to save: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    // Backdrop (z-60)
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onClose(productId)} 
      />

      {/* Drawer Content */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-xl font-semibold">Nutritional Value</h3>
          <button onClick={() => onClose(productId)} className="text-gray-500 hover:text-black">
            <X className="w-6 h-6" />
          </button>
        </div>

      {/* 1. Serving Input */}
<div className="mt-4 flex items-center gap-4">
  <label className="text-base font-medium whitespace-nowrap">Serving</label>
  <div className="flex-1">
    <input
      type="text"
      value={servingLabel}
      onChange={(e) => setServingLabel(e.target.value)}
      placeholder="650 gms / 1 cup"
      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 placeholder:text-gray-400"
      style={{ width: "fit-content", minWidth: "150px" }}
    />
  </div>
</div>


        {/* 2. Nutrients Table Layout */}
        <div className="mt-4">
          <div className="border rounded-lg outline-1 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-gray-100 text-gray-600 font-medium text-sm">
              <div className="px-4 py-3 ">Nutrient</div>
              <div className="px-4 py-3">Amount</div>
            </div>

            {/* Nutrient Rows */}
            <div className="max-h-60 outline-1 overflow-y-auto">
              {nutrients.map((n, idx) => (
                <div key={idx} className="grid grid-cols-2 items-center border-t text-sm">
                  <div className="px-2 py-1 ">
                    <input
                      type="text"
                      value={n.name}
                      onChange={(e) => updateRow(idx, "name", e.target.value)}
                      placeholder="Calories"
                      className="w-full bg-transparent outline-none px-2 py-1"
                    />
                  </div>
                  <div className="px-2 py-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={n.amount}
                      onChange={(e) => updateRow(idx, "amount", e.target.value)}
                      placeholder="60 kcal"
                      className="w-full  outline-none px-2 py-1"
                    />
                    {/* Hataane ka button tabhi dikhao agar ek se zyada rows hain, ya agar current row mein data hai */}
                    {(nutrients.length > 1 || n.name || n.amount) && (
                        <button
                          onClick={() => removeRow(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <div className="p-6 border-t">
              <button
                onClick={addRow}
                className="text-blue-600 text-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Add More
              </button>
            </div>
          </div>
        </div>

        {/* 3. Additional Note */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Additional Note</label>
          <textarea
            rows={2}
            value={additionalNote}
            onChange={(e) => setAdditionalNote(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mt-1 text-sm outline-1"
            placeholder="--"
          />
        </div>

        {/* 4. Save Button (API call) */}
        <div className="mt-6 flex justify-center">
            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 text-white px-26 py-3 rounded-xl font-semibold"
            >
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
      </div>
    </div>
  );
}
