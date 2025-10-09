"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

interface Buyer {
  name: string;
  location: string;
  contact: string;
  totalOrders: number;
}

export default function BuyersPanel() {
  const [buyers, setBuyers] = useState<Buyer[]>(
    Array.from({ length: 36 }, () => ({
      name: "Rajesh Kumar",
      location: "Nawada, Delhi",
      contact: "9999999999",
      totalOrders: 20,
    }))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  const rowsPerPage = 12;
  const totalPages = Math.ceil(buyers.length / rowsPerPage);
  const paginatedBuyers = buyers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDelete = (index: number) => {
    const globalIndex = (currentPage - 1) * rowsPerPage + index;
    setBuyers((prev) => prev.filter((_, i) => i !== globalIndex));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md relative">
      {/* ---------- Header Section ---------- */}
      <div className="flex justify-between items-center mb-4">
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-64">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        {/* Filter */}
        <button className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* ---------- Buyers Table ---------- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Contact No.</th>
              <th className="text-left p-3">Total Orders</th>
              <th className="text-center p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBuyers.map((buyer, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition-colors relative"
              >
                <td className="p-3">{buyer.name}</td>
                <td className="p-3">{buyer.location}</td>
                <td className="p-3">{buyer.contact}</td>
                <td className="p-3">{buyer.totalOrders}</td>

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
                          setSelectedBuyer(buyer);
                          setOpenMenu(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        View 
                      </button>
                      <button
                        onClick={() => handleDelete(i)}
                        className="block w-full text-left px-4 py-2 bg-white hover:bg-gray-100"
                      >
                        Delete Buyer
                      </button>
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ---------- Buyer Detail Modal ---------- */}
      {selectedBuyer && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedBuyer(null)}
          />
          <div className="fixed top-1/2 left-1/2 bg-white rounded-xl shadow-2xl w-[650px] p-6 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-gray-800 font-semibold text-lg">
                {selectedBuyer.name}
              </h2>
              <button
                onClick={() => setSelectedBuyer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <Image
                src="/buyer user/buyeruser.png"
                alt="Buyer"
                width={230}
                height={150}
                className="rounded-xl object-cover"
              />
              <div>
                <h3 className="text-gray-800 font-semibold text-md">
                  {selectedBuyer.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-semibold">Location -</span>{" "}
                  {selectedBuyer.location}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-semibold">Contact No. -</span>{" "}
                  {selectedBuyer.contact}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-semibold">Total Orders -</span>{" "}
                  {selectedBuyer.totalOrders}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800">Orders</h4>
                <div className="flex items-center gap-1 border rounded-md px-2 py-1 text-sm text-gray-600">
                  Fruits
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start border border-yellow-300 rounded-xl p-3 bg-white shadow-sm mb-3"
                >
                  <Image
                    src="/mango/mango.png"
                    alt="Mango"
                    width={120}
                    height={100}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800">Mango</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Category:</strong> Fruit
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Variety:</strong> Chausa
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Price:</strong> ₹ 1200/10kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
