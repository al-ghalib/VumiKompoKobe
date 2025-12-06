"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";

const VisitorCounter = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const incrementVisitor = async () => {
      try {
        const namespace = "vumikompokobe";
        const key = "visitors";
        const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
        const data = await response.json();
        setCount(data.value);
      } catch (error) {
        const storedCount = localStorage.getItem("visitorCount");
        const newCount = storedCount ? parseInt(storedCount) + 1 : 1;
        localStorage.setItem("visitorCount", newCount.toString());
        setCount(newCount);
      }
    };
    incrementVisitor();
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-500 font-hind">
      <Users className="w-3.5 h-3.5" />
      <span>{count.toLocaleString("bn-BD")} জন ভিজিটর</span>
    </div>
  );
};

export default VisitorCounter;
