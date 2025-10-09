"use client";

import { useState } from "react";
import { Search, Filter, Eye, X } from "lucide-react";

interface Order {
  id: string;
  buyer: string;
  vendor: string;
  status: "In Process" | "Completed" | "Cancelled";
  item: string;
  quantity: string;
  price: string;
  deliveryStatus: string;
}

export default function BuyerOrdersPanel() {
  const ordersData: Order[] = Array.from({ length: 36 }, (_, i) => ({
    id: `Order#12345`,
    buyer: "Sanchit Sharma",
    vendor: "Ashok Sharma",
    status:
      i % 7 === 0
        ? "In Process"
        : i % 5 === 0
        ? "Cancelled"
        : "Completed",
    item: "Mango (Chausa)",
    quantity: "10kg",
    price: "$1200",
    deliveryStatus: "Delivery",
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;
  const totalPages = Math.ceil(ordersData.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedOrders = ordersData.slice(startIndex, startIndex + perPage);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Process":
        return "bg-yellow-400";
      case "Completed":
        return "bg-green-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm w-full relative">
      {/* ---------- Header ---------- */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-64">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <button className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* ---------- Orders Table ---------- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left p-3">Order Id</th>
              <th className="text-left p-3">Buyer</th>
              <th className="text-left p-3">Vendor</th>
              <th className="text-left p-3">Status</th>
              <th className="text-center p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.buyer}</td>
                <td className="p-3">{order.vendor}</td>
                <td className="p-3 flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  ></span>
                  {order.status}
                </td>
                <td className="text-center">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 hover:bg-gray-200 rounded-full"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- Footer Pagination ---------- */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <p>Results per page - {perPage}</p>
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-gray-100 disabled:opacity-50"
          >
            {">"}
          </button>
        </div>
      </div>

      {/* ---------- Popup ---------- */}
      {selectedOrder && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 z-[9999]">
          <div className="bg-white rounded-lg w-[360px] px-5 py-4 shadow-xl relative">
            {/* Header: Order ID + Cross */}
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-[14px] font-semibold text-gray-800">
                {selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Section */}
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <span className="font-medium w-[70px]">Buyer</span>
                  <span>:</span>
                  <span>{selectedOrder.buyer}</span>
                </div>
                <span className="bg-green-700 text-white text-[11px] px-3 py-[2px] rounded-full h-fit">
                  {selectedOrder.deliveryStatus}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-[70px]">Item</span>
                <span>:</span>
                <span>{selectedOrder.item}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-[70px]">Quantity</span>
                <span>:</span>
                <span>{selectedOrder.quantity}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-[70px]">Price</span>
                <span>:</span>
                <span>{selectedOrder.price}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-[70px]">Status</span>
                <span>:</span>
                <span>{selectedOrder.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
