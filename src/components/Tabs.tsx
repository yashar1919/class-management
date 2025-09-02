"use client";
import { useState } from "react";

export default function Tabs({ children }: { children: React.ReactNode[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 0 ? "bg-teal-600 text-white" : "bg-gray-300 text-gray-400"
          }`}
          onClick={() => setActiveTab(0)}
        >
          Class Management
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 1 ? "bg-teal-500 text-white" : "bg-gray-300 text-gray-400"
          }`}
          onClick={() => setActiveTab(1)}
        >
          Students Info
        </button>
      </div>
      <div>{children[activeTab]}</div>
    </div>
  );
}
