/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Image from "next/image";

interface Banner {
  id: number;
  src: string;
  title?: string;
}

const initialHomeScreenBanners: Banner[] = [
  { id: 1, src: "/HomeScreenbannar/grown.png", title: "Grow with care, free from harm" },
  { id: 2, src: "/HomeScreenbannar/harvested.png", title: "Harvested with care, straight from nature" },
  { id: 3, src: "/HomeScreenbannar/supporting.png", title: "Supporting farmers, savoring freshness" },
];

const initialHomeScreen: Banner[] = [
  { id: 4, src: "/Homescreen/product.png", title: "Products with best deals" },
  { id: 5, src: "/Homescreen/connect.png", title: "Connect with Farmers" },
];

export default function ManageBanners() {
  const [homeScreenBanners, setHomeScreenBanners] = useState(initialHomeScreenBanners);
  const [homeScreen, setHomeScreen] = useState(initialHomeScreen);

  const handleDelete = (id: number, type: "banner" | "home") => {
    if (type === "banner") {
      setHomeScreenBanners(homeScreenBanners.filter((b) => b.id !== id));
    } else {
      setHomeScreen(homeScreen.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Manage Banners</h2>

      {/* { Home Screen Banner } */}
      <div>
        <h3 className="text-sm font-medium mb-3">Home Screen Banner</h3>
        <div className="flex gap-4 flex-wrap">
          {homeScreenBanners.map((banner) => (
            <div
              key={banner.id}
              className="relative w-60 h-30 rounded-lg overflow-hidden shadow border"
            >
              <img
                src={banner.src}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(banner.id, "banner")}
                className="absolute bottom-2 left-2 bg-white border px-3 py-1 rounded text-sm shadow hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
          + Add Images
        </button>
      </div>

      {/* { Home Screen Sections } */}
      <div>
        <h3 className="text-sm font-medium mb-3">Home Screen</h3>
        <div className="flex gap-4 flex-wrap">
          {homeScreen.map((banner) => (
            <div
              key={banner.id}
              className="relative w-60 h-30 rounded-lg overflow-hidden shadow border"
            >
              <img
                src={banner.src}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(banner.id, "home")}
                className="absolute bottom-2 left-2 bg-white border px-3 py-1 rounded text-sm shadow hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
          + Add Images
        </button>
      </div>
    </div>
  );
}
