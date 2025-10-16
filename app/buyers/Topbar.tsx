'use client';

import React from 'react';
import Image from 'next/image';

const Topbar = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed top-0 left-65 w-[81.4%] flex justify-between items-center px-4 py-4 bg-gray-100  z-50">
      {/* Left: Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800">Buyers</h1>

      {/* Right: Date, Notification, Avatar */}
      <div className="flex items-center gap-5">
        {/* Current Date */}
        <span className="text-gray-700 text-sm font-medium">{currentDate}</span>

        {/* Notification Icon */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:shadow-md transition">
          <Image src="/icon/icon.png" alt="Notifications" width={36} height={36} />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 shadow-sm">
          <Image
            src="/about/about.jpg"
            alt="User"
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
