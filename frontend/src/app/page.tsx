"use client";

import { useState } from "react";
import EarthquakeMap from "@/components/EarthquakeMap";
import Sidebar from "@/components/Sidebar";
import { Menu, X, Map } from "lucide-react";

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeView, setActiveView] = useState<"map" | "sidebar">("map");

  return (
    <main className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <h1 className="text-xl font-baloo font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600">
          ভূমিকম্প কবে?
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView("map")}
            className={`p-2 rounded-lg transition-colors ${activeView === "map" ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
          >
            <Map className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveView("sidebar")}
            className={`p-2 rounded-lg transition-colors ${activeView === "sidebar" ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <aside className={`${activeView === "sidebar" ? "flex" : "hidden"} md:flex w-full md:w-96 lg:w-[450px] flex-shrink-0 h-[calc(100vh-64px)] md:h-full`}>
        <Sidebar />
      </aside>

      <div className={`${activeView === "map" ? "flex" : "hidden"} md:flex flex-grow relative h-[calc(100vh-64px)] md:h-full`}>
        <EarthquakeMap />
      </div>
    </main>
  );
}
