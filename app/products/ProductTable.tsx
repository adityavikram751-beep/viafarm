/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { MoreVertical, Search, Filter } from "lucide-react";
import Image from "next/image";

const initialProducts = Array.from({ length: 36 }, () => ({
  id: crypto.randomUUID(),
  name: "Mango",
  vendor: "Ashok Sharma",
  date: "02/02/2024",
  category: "Fruit",
  rate: "₹ 1200/10kg",
  variety: "Chausa",
  vendorLocation: "480/2, Vinod Nagar, Delhi",
  vendorAvatar: "/castomer/castomer.png",
  productImage: "/mango/mango.png",
  rating: 9.2,
  nutrition: [],
  nutritionNote: "",
}));

export default function ProductTable() {
  const [productList, setProductList] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewProduct, setViewProduct] = useState<any | null>(null);
  const [openNutritionEdit, setOpenNutritionEdit] = useState(false);
  const [nutritionForm, setNutritionForm] = useState<
    { label: string; value: string }[]
  >([]);
  const [nutritionNote, setNutritionNote] = useState("");
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(productList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = productList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDelete = (id: string) => {
    setProductList(productList.filter((item) => item.id !== id));
    setOpenActionMenu(null);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden m-6 p-4">
      {/* Search & Filter Bar */}
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

      {/* Table */}
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3">Product Name</th>
            <th className="px-4 py-3">Vendors Name</th>
            <th className="px-4 py-3">Date Posted</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Rate</th>
            <th className="px-4 py-3">Action</th>
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
              <td className="px-4 py-3 relative">
                {/* 3 dot button */}
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() =>
                    setOpenActionMenu(openActionMenu === p.id ? null : p.id)
                  }
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {/* Action Menu (View/Delete dropdown) */}
                {openActionMenu === p.id && (
                  <div className="absolute right-4 top-10 bg-white border rounded-lg shadow-md w-32 z-10">
                    <button
                      onClick={() => {
                        setViewProduct(p); // View Modal open
                        setNutritionForm(p.nutrition || []);
                        setNutritionNote(p.nutritionNote || "");
                        setOpenActionMenu(null);
                      }}
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

      {/* Pagination Footer */}
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

      {/* View Product Modal */}
      {viewProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setViewProduct(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {/* Product Info */}
            <div className="flex gap-4">
              <Image
                src={viewProduct.productImage}
                alt={viewProduct.name}
                width={100}
                height={100}
                className="w-42 h-28 rounded-lg object-cover"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{viewProduct.name}</h2>
                  <span className="flex items-center gap-1 bg-gray-100 border px-2 py-0.5 rounded-full text-xs font-medium">
                    ⭐ {viewProduct.rating}
                  </span>
                </div>
                <p className="text-gray-600">Variety : {viewProduct.variety}</p>
                <p className="text-gray-600">Category : {viewProduct.category}</p>
                <p className="text-lg font-bold mt-1">{viewProduct.rate}</p>
              </div>
            </div>

            {/* About Product */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800">About the product</h3>
              <p className="text-sm text-gray-600 mt-1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            {/* About Vendor */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800">About the vendor</h3>
              <div className="flex items-center gap-3 mt-2 bg-gray-50 p-3 rounded-lg">
                <Image
                  src={viewProduct.vendorAvatar}
                  alt={viewProduct.vendor}
                  width={50}
                  height={50}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{viewProduct.vendor}</p>
                    <span className="flex items-center gap-1 bg-gray-100 border px-2 py-0.5 rounded-full text-xs font-medium">
                       
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Location –</span>{" "}
                    {viewProduct.vendorLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="mt-4 bg-gray-50 p-4 rounded-xl">
              {nutritionForm.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">
                      Nutritional Value{" "}
                      <span className="text-xs text-gray-500">
                        (per 1 cup / 165 gms)
                      </span>
                    </h3>
                    <button
                      onClick={() => setOpenNutritionEdit(true)}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      ✎ Edit
                    </button>
                  </div>
                  {nutritionForm.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      <span className="font-medium">{item.label}</span> :{" "}
                      {item.value}
                    </p>
                  ))}
                  <p className="mt-2 text-xs text-gray-500">{nutritionNote}</p>
                </>
              ) : (
                <button
                  onClick={() => {
                    setNutritionForm([{ label: "", value: "" }]);
                    setOpenNutritionEdit(true);
                  }}
                  className="flex items-center gap-2 text-blue-500 text-sm mt-2"
                >
                  ➕ Add Nutritional Value
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Edit Modal */}
      {openNutritionEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h2 className="text-lg font-semibold">Nutritional Value</h2>
              <button
                onClick={() => setOpenNutritionEdit(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-3">
              Serving{" "}
              <span className="ml-2 font-medium text-gray-700">
                650 gms / 1 cup
              </span>
            </p>

            <div className="border rounded-lg overflow-hidden mb-3">
              <div className="grid grid-cols-2 bg-gray-100 text-sm font-medium text-gray-700 px-3 py-2">
                <span>Nutrient</span>
                <span>Amount</span>
              </div>
              {nutritionForm.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 border-t px-3 py-2 text-sm text-gray-800"
                >
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const newForm = [...nutritionForm];
                      newForm[idx].label = e.target.value;
                      setNutritionForm(newForm);
                    }}
                    placeholder="Nutrient"
                    className="bg-transparent outline-none w-full"
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => {
                      const newForm = [...nutritionForm];
                      newForm[idx].value = e.target.value;
                      setNutritionForm(newForm);
                    }}
                    placeholder="Amount"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                setNutritionForm([...nutritionForm, { label: "", value: "" }])
              }
              className="flex items-center gap-1 text-blue-600 text-sm mb-4"
            >
              ➕ Add More
            </button>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">
                Additional Note
              </label>
              <input
                type="text"
                value={nutritionNote}
                onChange={(e) => setNutritionNote(e.target.value)}
                placeholder="--"
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm outline-none"
              />
            </div>

            <button
              onClick={() => {
                alert("Nutrition Updated ✅");
                setOpenNutritionEdit(false);
              }}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
