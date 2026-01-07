import React, { createContext, useContext, useState, ReactNode } from "react";
import { ApiQuota } from "../types";

interface QuotaContextType {
  quota: ApiQuota | null;
  setQuota: (quota: ApiQuota | null) => void;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export const QuotaProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [quota, setQuota] = useState<ApiQuota | null>(null);

  const handleSetQuota = (newQuota: ApiQuota | null) => {
    console.log("Setting quota:", newQuota);
    setQuota(newQuota);
  };

  return (
    <QuotaContext.Provider value={{ quota, setQuota: handleSetQuota }}>
      {children}
    </QuotaContext.Provider>
  );
};

export const useQuota = () => {
  const context = useContext(QuotaContext);
  if (!context) {
    throw new Error("useQuota must be used within a QuotaProvider");
  }
  return context;
};
