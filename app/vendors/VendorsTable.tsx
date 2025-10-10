"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  List,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import axios from "axios";

export default function Vendors() {
  const [mode, setMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 6;

  const BASE_URL = "https://393rb0pp-5000.inc1.devtunnels.ms";

  // ✅ Fetch all vendors
  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/admin/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) setVendors(res.data.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // ✅ Fetch vendor details
  const handleViewVendor = async (vendorId) => {
    setLoading(true);
    setSelectedVendor(vendorId);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/admin/vendor/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) setVendorDetails(res.data.data);
    } catch (err) {
      console.error("Error fetching vendor details:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Block / Unblock Vendor
  const handleToggleStatus = async (vendorId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `${BASE_URL}/api/admin/vendors/${vendorId}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        alert(res.data.message);
        // Update UI instantly
        setVendors((prev) =>
          prev.map((v) =>
            v._id === vendorId
              ? { ...v, status: res.data.data.status }
              : v
          )
        );
      }
    } catch (err) {
      console.error("Error updating vendor status:", err);
      alert("Failed to update vendor status.");
    }
  };

  const closeModal = () => {
    setSelectedVendor(null);
    setVendorDetails(null);
  };

  const totalPages = Math.ceil(vendors.length / rowsPerPage);
  const paginatedVendors = vendors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-white p-4 rounded-xl shadow-md relative">
      {/* ---------- Top Section ---------- */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-64">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
            <button
              onClick={() => setMode("list")}
              className={`flex items-center justify-center w-9 h-9 ${
                mode === "list"
                  ? "bg-[#6B3D1C] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMode("alert")}
              className={`flex items-center justify-center w-9 h-9 ${
                mode === "alert"
                  ? "bg-[#6B3D1C] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>

          <button className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* ---------- Table Section ---------- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left p-3">Profile</th>
              <th className="text-left p-3">Vendor’s Name</th>
              <th className="text-left p-3">Contact No.</th>
              <th className="text-left p-3">Status</th>
              <th className="text-center p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVendors.map((vendor) => (
              <tr
                key={vendor._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">
                  <img
                    src={
                      vendor.profilePicture ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt={vendor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </td>
                <td className="p-3">{vendor.name}</td>
                <td className="p-3">{vendor.mobileNumber}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      vendor.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {vendor.status}
                  </span>
                </td>
                <td className="flex justify-center gap-2 p-3">
                  <button
                    onClick={() => handleViewVendor(vendor._id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleToggleStatus(vendor._id)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      vendor.status === "Blocked"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white`}
                  >
                    {vendor.status === "Blocked" ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- Pagination ---------- */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>Results per page - {rowsPerPage}</span>
        <span>
          {currentPage} of {totalPages} pages
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ---------- Vendor Details Modal ---------- */}
      {vendorDetails && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
          <div className="fixed top-1/2 left-1/2 bg-white rounded-xl shadow-2xl w-[700px] max-h-[90vh] overflow-y-auto p-6 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-gray-800 font-semibold text-lg">
                {vendorDetails.vendor.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <img
                src={
                  vendorDetails.vendor.profilePicture ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="Vendor"
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex flex-col gap-1 text-sm text-gray-700">
                <p>
                  <strong>Mobile:</strong> {vendorDetails.vendor.mobileNumber}
                </p>
                <p>
                  <strong>Status:</strong> {vendorDetails.vendor.status}
                </p>
                <p>
                  <strong>City:</strong> {vendorDetails.vendor.address?.city}
                </p>
                <p>
                  <strong>District:</strong>{" "}
                  {vendorDetails.vendor.address?.district}
                </p>
                <p>
                  <strong>Pin Code:</strong>{" "}
                  {vendorDetails.vendor.address?.pinCode}
                </p>
                <p>
                  <strong>About:</strong>{" "}
                  {vendorDetails.vendor.vendorDetails?.about}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Listed Products
              </h3>
              {vendorDetails.listedProducts.length > 0 ? (
                vendorDetails.listedProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-start gap-3 border border-yellow-300 rounded-lg p-3 mb-3 bg-gray-50"
                  >
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 text-sm text-gray-700">
                      <p className="font-semibold">{p.name}</p>
                      <p>Category: {p.category}</p>
                      <p>Variety: {p.variety}</p>
                      <p>Price: ₹ {p.price}</p>
                      <p>Status: {p.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No products listed yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
