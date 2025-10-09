"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  List,
  AlertTriangle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

interface Vendor {
  name: string;
  location: string;
  contact: string;
  status: "Active" | "Inactive" | "Blocked" | "Rejected";
  reason?: string;
}

export default function Vendors() {
  const [mode, setMode] = useState<"list" | "alert">("list");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectVendorIndex, setRejectVendorIndex] = useState<number | null>(
    null
  );

  const rowsPerPage = 12;

  const [vendors, setVendors] = useState<Vendor[]>(
    Array.from({ length: 36 }, (_, i) => ({
      name: "Ashok Sharma",
      location: "480/2, Vinod Nagar, Delhi",
      contact: "9999999999",
      status:
        i === 2
          ? "Blocked"
          : i === 4
          ? "Inactive"
          : "Active",
    }))
  );

  const totalPages = Math.ceil(vendors.length / rowsPerPage);
  const paginatedVendors = vendors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleToggleBlock = (index: number) => {
    const globalIndex = (currentPage - 1) * rowsPerPage + index;
    setVendors((prev) =>
      prev.map((v, i) =>
        i === globalIndex
          ? {
              ...v,
              status: v.status === "Blocked" ? "Active" : "Blocked",
            }
          : v
      )
    );
    setOpenMenu(null);
  };

  const handleDelete = (index: number) => {
    const globalIndex = (currentPage - 1) * rowsPerPage + index;
    setVendors((prev) => prev.filter((_, i) => i !== globalIndex));
  };

  const handleRejectVendor = () => {
    if (rejectVendorIndex !== null) {
      const globalIndex =
        (currentPage - 1) * rowsPerPage + rejectVendorIndex;
      setVendors((prev) =>
        prev.map((v, i) =>
          i === globalIndex
            ? { ...v, status: "Rejected", reason: rejectReason }
            : v
        )
      );
      setShowRejectModal(false);
      setRejectReason("");
      setRejectVendorIndex(null);
    }
  };

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
              onClick={() => {
                setMode("list");
                setCurrentPage(1);
              }}
              className={`flex items-center justify-center w-9 h-9 transition-colors ${
                mode === "list"
                  ? "bg-[#6B3D1C] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setMode("alert");
                setCurrentPage(1);
              }}
              className={`flex items-center justify-center w-9 h-9 transition-colors ${
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
              <th className="text-left p-3">Vendor’s Name</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Contact No.</th>
              {mode === "list" && <th className="text-left p-3">Status</th>}
              <th className="text-center p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVendors.map((vendor, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition-colors relative"
              >
                <td className="p-3">{vendor.name}</td>
                <td className="p-3">{vendor.location}</td>
                <td className="p-3">{vendor.contact}</td>

                {mode === "list" && (
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vendor.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : vendor.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-700"
                          : vendor.status === "Rejected"
                          ? "bg-red-200 text-red-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {vendor.status}
                    </span>

                    {vendor.status === "Rejected" && vendor.reason && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        Reason: {vendor.reason}
                      </p>
                    )}
                  </td>
                )}

                <td className="text-center relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === i ? null : i)}
                    className="p-2 hover:bg-gray-200 rounded-full"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>

                  {openMenu === i && (
                    <div className="absolute right-8 top-8 bg-white shadow-lg rounded-lg text-sm w-40 py-2 z-50 border">
                      <button
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setOpenMenu(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        View
                      </button>

                      {mode === "list" ? (
                        <>
                          <button
                            onClick={() => handleToggleBlock(i)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            {vendor.status === "Blocked"
                              ? "Unblock User"
                              : "Block User"}
                          </button>
                          <button
                            onClick={() => handleDelete(i)}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                          >
                            Delete User
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Approve Vendor
                          </button>
                          <button
                            onClick={() => {
                              setRejectVendorIndex(i);
                              setShowRejectModal(true);
                              setOpenMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                          >
                            Reject Vendor
                          </button>
                        </>
                      )}
                    </div>
                  )}
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
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ---------- Reject Vendor Modal ---------- */}
      {showRejectModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 bg-white rounded-xl shadow-xl w-[330px] p-5 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h2 className="text-gray-800 font-semibold text-sm">
                Reason for rejection
              </h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-2">
              Write your reason to reject the vendor
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full border rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-green-500 resize-none"
            />
            <button
              onClick={handleRejectVendor}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </>
      )}

      {/* ---------- Full Vendor Detail Modal ---------- */}
      {selectedVendor && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedVendor(null)}
          />
          <div className="fixed top-1/2 left-1/2 bg-white rounded-xl shadow-2xl w-[650px] p-6 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-gray-800 font-semibold text-lg">
                {selectedVendor.name}
              </h2>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <Image
                src="/castomer/castomer.png"
                alt="castomer"
                width={120}
                height={120}
                className="rounded-xl object-cover"
              />
              <div>
                <h3 className="text-gray-800 font-semibold text-md">
                  {selectedVendor.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-semibold">Location -</span>{" "}
                  {selectedVendor.location}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-semibold">Contact No. -</span>{" "}
                  {selectedVendor.contact}
                </p>

                <span
                  className={`inline-block text-xs font-medium px-3 py-1 rounded-full mt-2 ${
                    selectedVendor.status === "Blocked"
                      ? "bg-red-100 text-red-700"
                      : selectedVendor.status === "Inactive"
                      ? "bg-yellow-100 text-yellow-700"
                      : selectedVendor.status === "Rejected"
                      ? "bg-red-200 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedVendor.status}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-1">
                About the Vendor
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">
                  Listed Products
                </h4>
                <div className="flex items-center gap-1 border rounded-md px-2 py-1 text-sm text-gray-600">
                  Fruits
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="flex gap-3 items-start border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition">
                <Image
                  src="/mango/mango.png"
                  alt="Mango"
                  width={200}
                  height={200}
                  className="rounded-lg object-full"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h5 className="font-semibold text-gray-800">Mango</h5>
                    <span className="text-green-700 bg-green-100 text-xs px-3 py-1 rounded-full">
                      In Stock
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Category:</strong> Fruit
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Variety:</strong> Chausa
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Price:</strong> ₹ 1200/10kg
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Uploaded on 30/09/2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
