import { Newspaper } from "lucide-react";
import PredictionAndRefs from "./PredictionAndRefs";
import NewsFeed from "./NewsFeed";
import { ThemeToggle } from "./ThemeToggle";
import VisitorCounter from "./VisitorCounter";

const Sidebar = () => {
  return (
    <div className="h-full flex flex-col p-6 lg:p-8 space-y-8 overflow-y-auto border-r border-gray-200 dark:border-gray-700 glass transition-colors duration-300">
      <header className="hidden md:flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-baloo font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600 leading-tight pb-1 pt-1">
            ভূমিকম্প কবে?
          </h1>
          <p className="text-sm lg:text-base text-slate-700 dark:text-gray-300 font-hind font-medium mt-5">
            এশিয়ার ভূমিকম্প তথ্য ও পূর্বাভাস
          </p>
        </div>
      </header>

      <div className="flex-grow space-y-6">
        <PredictionAndRefs />

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold font-hind text-slate-900 dark:text-gray-100">সাম্প্রতিক সংবাদ</h2>
          </div>
          <NewsFeed />
        </section>
      </div>
      
      <footer className="pt-4 border-t border-gray-200 dark:border-gray-700/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-500 font-hind">
            <span>Data: USGS</span>
            <span className="mx-1">•</span>
            <span>Built by</span>
            <a
              href="https://www.linkedin.com/in/abdullah-al-ghalib/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Abdullah Al Ghalib
            </a>
          </div>
          <ThemeToggle />
        </div>
        <VisitorCounter />
      </footer>
    </div>
  );
};

export default Sidebar;

