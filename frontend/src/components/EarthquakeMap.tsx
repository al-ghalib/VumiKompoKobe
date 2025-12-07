"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import type L from "leaflet";
import { useTheme } from "@/context/ThemeContext";
import { usePrediction } from "@/context/PredictionContext";
import { Search, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

// Leaflet will be dynamically imported on client-side only
let leaflet: typeof L | null = null;
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet");
  leaflet = L;
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface Earthquake {
  id: string;
  geometry: { coordinates: [number, number, number] };
  properties: { mag: number; place: string; time: number; url: string };
}

const EarthquakeMap = () => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { theme } = useTheme();
  const { prediction: countryPrediction } = usePrediction();

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/earthquakes/recent`);
        setEarthquakes(response.data.features);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch earthquake data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarthquakes();
  }, []);

  const filteredQuakes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return earthquakes
      .filter((quake) => quake.properties.place.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [earthquakes, searchQuery]);

  const handleSelectQuake = (quake: Earthquake) => {
    setSelectedQuake(quake);
    setSearchQuery(quake.properties.place);
    setShowDropdown(false);
    const map = (window as any).leafletMap;
    if (map) {
      const [lon, lat] = quake.geometry.coordinates;
      map.flyTo([lat, lon], 10, { duration: 1.5 });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedQuake(null);
    setShowDropdown(false);
  };

  const createCustomIcon = (magnitude: number, isSelected: boolean = false) => {
    if (!leaflet) return undefined;
    const size = isSelected ? Math.max(30, magnitude * 8) : Math.max(20, magnitude * 6);
    const color = magnitude > 6.5 ? "#dc2626" : magnitude > 5.5 ? "#f97316" : magnitude > 4.5 ? "#eab308" : "#3b82f6";
    const svgIcon = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="${isSelected ? 3 : 2}" opacity="${isSelected ? 1 : 0.8}"/>
        <circle cx="12" cy="12" r="5" fill="${color}" stroke="#fff" stroke-width="1" opacity="0.6"/>
        ${isSelected ? '<circle cx="12" cy="12" r="10" fill="none" stroke="#fff" stroke-width="2" opacity="0.5"><animate attributeName="r" from="10" to="20" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.5" to="0" dur="1s" repeatCount="indefinite"/></circle>' : ''}
      </svg>
    `;
    return leaflet.divIcon({
      html: svgIcon,
      className: "custom-quake-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const getMagnitudeColor = (mag: number) => {
    if (mag > 6) return 'text-red-500';
    if (mag > 5) return 'text-orange-500';
    return 'text-yellow-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
        ম্যাপ লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {lastUpdated && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-slate-600 dark:text-gray-400 font-hind">
            🔄 সর্বশেষ আপডেট: {lastUpdated.toLocaleTimeString("bn-BD", { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
      <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 z-[1000] md:w-80">
        <div className="relative">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="অবস্থান খুঁজুন..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="flex-1 px-3 py-3 text-sm bg-transparent text-slate-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none font-hind"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {showDropdown && filteredQuakes.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {filteredQuakes.map((quake) => (
                <button
                  key={quake.id}
                  onClick={() => handleSelectQuake(quake)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-gray-100 font-hind truncate">
                    {quake.properties.place}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${getMagnitudeColor(quake.properties.mag)}`}>
                      মাত্রা: {quake.properties.mag}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(quake.properties.time).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={[30, 100]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
        ref={(map: any) => { if (map) (window as any).leafletMap = map; }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={theme === "dark" ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
        />
        {earthquakes.map((quake) => (
          <Marker
            key={quake.id}
            position={[quake.geometry.coordinates[1], quake.geometry.coordinates[0]]}
            icon={createCustomIcon(quake.properties.mag, selectedQuake?.id === quake.id)}
          >
            <Popup maxWidth={280} className="glass-popup">
              <div className="p-2 space-y-2 font-hind">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">মাত্রা</span>
                  <span className={`text-lg font-bold ${getMagnitudeColor(quake.properties.mag)}`}>
                    {quake.properties.mag}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
                    {quake.properties.place}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(quake.properties.time).toLocaleString("bn-BD", {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <a
                  href={quake.properties.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  বিস্তারিত দেখুন
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {countryPrediction && countryPrediction.center_lat && countryPrediction.center_lon && (
          <>
            <Circle
              center={[countryPrediction.center_lat, countryPrediction.center_lon]}
              radius={150000}
              pathOptions={{
                color: countryPrediction.risk_color === "red" ? "#dc2626" : countryPrediction.risk_color === "orange" ? "#f97316" : "#eab308",
                fillColor: countryPrediction.risk_color === "red" ? "#dc2626" : countryPrediction.risk_color === "orange" ? "#f97316" : "#eab308",
                fillOpacity: 0.15,
                weight: 3,
                dashArray: "10, 5",
              }}
            >
              <Popup>
                <div className="p-3 space-y-2 font-hind min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold text-base text-gray-800 dark:text-gray-100">
                      {countryPrediction.country}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded text-sm font-bold text-center ${
                    countryPrediction.risk_color === "red" ? "bg-red-100 text-red-700" :
                    countryPrediction.risk_color === "orange" ? "bg-orange-100 text-orange-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {countryPrediction.risk_level}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    📍 {countryPrediction.predicted_area}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {countryPrediction.recent_activity}
                  </p>
                </div>
              </Popup>
            </Circle>
            <Circle
              center={[countryPrediction.center_lat, countryPrediction.center_lon]}
              radius={100000}
              pathOptions={{
                color: countryPrediction.risk_color === "red" ? "#dc2626" : countryPrediction.risk_color === "orange" ? "#f97316" : "#eab308",
                fillColor: countryPrediction.risk_color === "red" ? "#dc2626" : countryPrediction.risk_color === "orange" ? "#f97316" : "#eab308",
                fillOpacity: 0.25,
                weight: 2,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default EarthquakeMap;
