"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PredictionData {
  country: string;
  prediction: string;
  predicted_area: string;
  center_lat: number;
  center_lon: number;
  risk_level: string;
  risk_color: string;
  recent_activity: string;
}

interface PredictionContextType {
  prediction: PredictionData | null;
  setPrediction: (data: PredictionData | null) => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error("usePrediction must be used within PredictionProvider");
  }
  return context;
};

export const PredictionProvider = ({ children }: { children: ReactNode }) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);

  return (
    <PredictionContext.Provider value={{ prediction, setPrediction }}>
      {children}
    </PredictionContext.Provider>
  );
};
