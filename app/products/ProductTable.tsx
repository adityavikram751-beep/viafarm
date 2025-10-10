/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Search, Filter, Plus, X } from "lucide-react";

export default function ProductTable() {
  const [productList, setProductList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<any | null>({});
  const [viewLoading, setViewLoading] = useState(false);
  const [openNutritionModal, setOpenNutritionModal] = useState(false);
  const [nutritionData, setNutritionData] = useState({
    servingSize: "",
    nutrients: [{ name: "", amount: "" }],
    additionalNote: "",
  });
  const [saving, setSaving] = useState(false);

  const itemsPerPage = 12;
  const BASE_URL = "https://393rb0pp-5000.inc1.devtunnels.ms";
  const API_URL = `${BASE_URL}/api/admin/products`;

  // ✅ Fetch All Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found.");

        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const json = await res.json();

        const productsArray =
          Array.isArray(json.data?.products) || Array.isArray(json.data)
            ? json.data.products || json.data
            : [];

        const mapped = productsArray.map((item: any) => ({
          id: item._id,
          name: item.name,
          vendor: item.vendor?.name || "Unknown Vendor",
          date: new Date(item.createdAt).toLocaleDateString("en-IN"),
          category: item.category,
          rate: `₹ ${item.price}/${item.unit}`,
        }));

        setProductList(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ View single product
  const handleView = async (id: string) => {
    try {
      setViewLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found.");

      const res = await fetch(`${API_URL}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();

      setViewProduct(json.data?.product || json.data);
      console.log("sanjayyyyyyyyyy", viewProduct)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setViewLoading(false);
    }
  };

  // ✅ Save nutritional value
  const handleSaveNutrition = async () => {
    if (!viewProduct?._id) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found.");

      const res = await fetch(
        `${API_URL}/${viewProduct._id}/nutritional-value`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nutritionData),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");

      alert("✅ Nutritional value saved successfully!");
      setViewProduct((prev: any) => ({
        ...prev,
        nutritionalValue: json.data,
      }));
      setOpenNutritionModal(false);
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(productList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = productList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Delete handler (UI only)
  const handleDelete = (id: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== id));
    setOpenActionMenu(null);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden m-6 p-4">
      {/* ✅ Search Bar */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center w-1/3 bg-gray-100 px-3 py-2 rounded-lg">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="ml-2 w-full bg-transparent outline-none text-sm"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* ✅ Loading/Error */}
      {loading && (
        <p className="text-center py-10 text-gray-500">Fetching products...</p>
      )}
      {error && (
        <p className="text-center py-10 text-red-500">
          ❌ Error: {error}
        </p>
      )}

      {/* ✅ Product Table */}
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
              {currentProducts.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 relative">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.vendor}</td>
                  <td className="px-4 py-3">{p.date}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.rate}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100"
                      onClick={() =>
                        setOpenActionMenu(openActionMenu === p.id ? null : p.id)
                      }
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {openActionMenu === p.id && (
                      <div className="absolute right-4 top-10 bg-white border rounded-lg shadow-md w-32 z-10">
                        <button
                          onClick={() => handleView(p.id)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-3 text-sm text-gray-600">
            <span>Results per page: {itemsPerPage}</span>
            <span>
              {currentPage} of {totalPages} pages
            </span>
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      )}

      {/* ✅ Product View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setViewProduct(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {viewLoading ? (
              <p className="text-center text-gray-500">Loading details...</p>
            ) : (
              <>
                <div className="flex gap-4">
                  <img
                    src={viewProduct.images?.[0]}
                    alt={viewProduct.name}
                    className="w-40 h-40 object-cover rounded-lg border"
                  />
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">
                      {viewProduct.name}
                    </h2>
                    <p className="text-gray-600 mb-1">
                      <b>Vendor:</b> {viewProduct.vendor?.name}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <b>Category:</b> {viewProduct.category}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <b>Rate:</b> ₹{viewProduct.price}/{viewProduct.unit}
                    </p>
                  </div>
                </div>
          <div>
            <h2>About Of Product</h2>
                <h1>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Omnis aspernatur, iusto sapiente et dignissimos, blanditiis rerum beatae perferendis cupiditate doloremque delectus, officiis amet? Autem aliquam earum, laborum officia rerum beatae.</h1>

            <h2>{viewProduct?.vendor?.name}</h2>
<img
                    src={viewProduct.vendor?.profilePicture}
                    alt={viewProduct.name}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />


          </div>
                

                {/* Nutrition Section */}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">
                      Nutritional Value
                    </h3>
                    <button
                      onClick={() => {
                        setOpenNutritionModal(true);
                        setNutritionData({
                          servingSize:
                            viewProduct.nutritionalValue?.servingSize || "",
                          nutrients:
                            viewProduct.nutritionalValue?.nutrients || [
                              { name: "", amount: "" },
                            ],
                          additionalNote:
                            viewProduct.nutritionalValue?.additionalNote || "",
                        });
                      }}
                      className="flex items-center gap-1 text-blue-600 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add / Edit
                    </button>
                  </div>

                  {viewProduct.nutritionalValue ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        Serving Size:{" "}
                        {viewProduct.nutritionalValue.servingSize}
                      </p>
                      {viewProduct.nutritionalValue.nutrients?.map(
                        (n: any) => (
                          <p key={n._id} className="text-sm text-gray-700">
                            {n.name}: {n.amount}
                          </p>
                        )
                      )}
                      {viewProduct.nutritionalValue.additionalNote && (
                        <p className="text-xs text-gray-500 mt-2">
                          <b>Note:</b>{" "}
                          {viewProduct.nutritionalValue.additionalNote}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No nutritional info available.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ✅ Nutrition Modal */}
      {openNutritionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] relative">
            <button
              onClick={() => setOpenNutritionModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4">
             Nutritional Value
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium"></label>
                <input
                  type="text"
                  value={nutritionData.servingSize}
                  onChange={(e) =>
                    setNutritionData({
                      ...nutritionData,
                      servingSize: e.target.value,
                    })
                  }
                  placeholder="e.g. 100g"
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Serving </label> bord
                {nutritionData.nutrients.map((n, i) => (
                  <div key={i} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={n.name}
                      onChange={(e) => {
                        const updated = [...nutritionData.nutrients];
                        updated[i].name = e.target.value;
                        setNutritionData({
                          ...nutritionData,
                          nutrients: updated,
                        });
                      }}
                      className="border rounded-lg px-2 py-1 text-sm w-1/2 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Amount"
                      value={n.amount}
                      onChange={(e) => {
                        const updated = [...nutritionData.nutrients];
                        updated[i].amount = e.target.value;
                        setNutritionData({
                          ...nutritionData,
                          nutrients: updated,
                        });
                      }}
                      className="border rounded-lg px-2 py-1 text-sm w-1/2 outline-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    setNutritionData({
                      ...nutritionData,
                      nutrients: [
                        ...nutritionData.nutrients,
                        { name: "", amount: "" },
                      ],
                    })
                  }
                  className="text-blue-600 text-sm mt-2"
                >
                  + Add Nutrient
                </button>
              </div>

              <div>
                <label className="text-sm font-medium">Additional Note</label>
                <textarea
                  rows={2}
                  value={nutritionData.additionalNote}
                  onChange={(e) =>
                    setNutritionData({
                      ...nutritionData,
                      additionalNote: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none"
                  placeholder="e.g. Best served fresh..."
                />
              </div>
            </div>

            <button
              onClick={handleSaveNutrition}
              disabled={saving}
              className="w-full mt-5 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium"
            >
              {saving ? "Saving..." : "Save Nutritional Value"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
