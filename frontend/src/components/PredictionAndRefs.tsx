"use client";

import { useState } from "react";
import axios from "axios";
import { Sparkles, AlertTriangle, ExternalLink, Globe, MapPin, Search } from "lucide-react";
import { usePrediction } from "@/context/PredictionContext";

const PredictionAndRefs = () => {
  const [prediction, setPrediction] = useState<any>(null);
  const [countryPrediction, setCountryPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [countryLoading, setCountryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [countryInput, setCountryInput] = useState("");
  const { setPrediction: setSharedPrediction } = usePrediction();

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/predict");
      setPrediction(response.data);
    } catch (err) {
      setError("পূর্বাভাস আনতে সমস্যা হয়েছে। ব্যাকএন্ড চলছে কিনা দেখুন।");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryPredict = async () => {
    if (!countryInput.trim()) {
      setCountryError("দেশের নাম লিখুন");
      return;
    }
    
    setCountryLoading(true);
    setCountryError(null);
    setCountryPrediction(null);
    setSharedPrediction(null);
    
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/predict/country?country=${encodeURIComponent(countryInput)}`);
      
      if (response.data.error) {
        setCountryError(response.data.error);
      } else {
        setCountryPrediction(response.data);
        setSharedPrediction(response.data);
        
        const map = (window as any).leafletMap;
        if (map && response.data.center_lat && response.data.center_lon) {
          map.flyTo([response.data.center_lat, response.data.center_lon], 7, { duration: 1.5 });
        }
      }
    } catch (err) {
      setCountryError("পূর্বাভাস আনতে সমস্যা হয়েছে। ব্যাকএন্ড চলছে কিনা দেখুন।");
      console.error(err);
    } finally {
      setCountryLoading(false);
    }
  };

  const getRiskColor = (color: string) => {
    switch (color) {
      case "red": return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300";
      case "orange": return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300";
      default: return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300";
    }
  };

  return (
    <>
      {/* Country-Specific Prediction Card */}
      <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold font-hind text-slate-900 dark:text-gray-100">
              দেশভিত্তিক পূর্বাভাস
            </h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="দেশের নাম লিখুন (যেমন: Japan, Indonesia)"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCountryPredict()}
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-slate-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 font-hind text-sm"
            />
            <button
              onClick={handleCountryPredict}
              disabled={countryLoading}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
            >
              {countryLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </span>
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>

          {countryError && (
            <div className="p-3 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm font-hind flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {countryError}
            </div>
          )}

          {countryPrediction && (
            <div className="space-y-3">
              {/* Risk Level Badge */}
              <div className={`p-3 rounded-lg border ${getRiskColor(countryPrediction.risk_color)}`}>
                <p className="text-lg font-bold font-hind">
                  🎯 {countryPrediction.country}: {countryPrediction.risk_level}
                </p>
                <p className="text-sm font-hind mt-1">{countryPrediction.prediction}</p>
              </div>

              {/* Predicted Location */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 font-hind">
                  📍 সম্ভাব্য অঞ্চল: {countryPrediction.predicted_area}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-hind">
                  {countryPrediction.recent_activity}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-hind">গড় মাত্রা</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-gray-100">{countryPrediction.avg_magnitude}</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-hind">সর্বোচ্চ মাত্রা</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-gray-100">{countryPrediction.max_magnitude}</p>
                </div>
              </div>

              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-yellow-700 dark:text-yellow-400 font-hind leading-tight">{countryPrediction.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* General Prediction Card */}
      <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold font-hind text-slate-900 dark:text-gray-100">
              সমগ্র এশিয়ার পূর্বাভাস
            </h2>
          </div>
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                 বিশ্লেষণ করা হচ্ছে...
              </span>
            ) : "পূর্বাভাস দেখুন"}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm font-hind flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {prediction && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-white/40 to-white/10 dark:from-gray-800/40 dark:to-gray-800/10 border border-white/20 shadow-inner space-y-3">
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400 font-hind">
                {prediction.prediction}
              </p>
              
              {prediction.predicted_area && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 font-hind">
                    📍 সম্ভাব্য অঞ্চল: {prediction.predicted_area}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-hind">
                    {prediction.area_activity}
                  </p>
                </div>
              )}
              
              <p className="text-xs text-slate-600 dark:text-gray-400 font-hind">
                সর্বশেষ {prediction.data_points_used} টি রেকর্ড করা কম্পনের উপর ভিত্তি করে।
              </p>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-yellow-700 dark:text-yellow-400 font-hind leading-tight">{prediction.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* References Card */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold font-hind text-slate-900 dark:text-gray-100">তথ্য ও রেফারেন্স</h2>
        </div>
        <ul className="space-y-3 text-sm font-hind">
          <li>
            <a
              href="https://earthquake.usgs.gov/fdsnws/event/1/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4 group-hover:stroke-2" />
              USGS ভূমিকম্প API
            </a>
          </li>
          <li>
            <a
              href="https://earthquake.usgs.gov/earthquakes/map/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4 group-hover:stroke-2" />
              USGS ইন্টারেক্টিভ ম্যাপ
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default PredictionAndRefs;
