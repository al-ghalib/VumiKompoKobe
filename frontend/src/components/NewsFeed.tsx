"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  published: string;
}

const NewsFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/news");
        setNews(response.data.news || []);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="space-y-3 h-64 overflow-y-auto pr-2">
      {loading ? (
        <div className="flex justify-center items-center h-full text-slate-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : news.length > 0 ? (
        news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 mb-3 glass-card rounded-xl hover:bg-white/40 dark:hover:bg-gray-700/60 transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <p className="text-sm font-semibold text-slate-800 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 font-hind line-clamp-2 leading-relaxed">
              {item.title}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-700 dark:text-gray-400 font-medium bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {new Date(item.published).toDateString()}
              </span>
              <span className="text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                পড়ুন &rarr;
              </span>
            </div>
          </a>
        ))
      ) : (
        <p className="text-sm text-slate-600 dark:text-gray-400 text-center py-4 italic glass-card rounded-lg">
          কোন সংবাদ পাওয়া যায়নি।
        </p>
      )}
    </div>
  );
};

export default NewsFeed;
