"use client";

import { useToast } from "@/hooks/use-toast";
import { IAuthUser } from "@/lib";
import { TranslateResult } from "@a2t/shared-types";
import React, { useContext, createContext, useState } from "react";

interface AppContext {
  user: IAuthUser | null | undefined;
  setUser: (user: IAuthUser | null) => void;
  setError: (message: string) => void;
  resetError: () => void;
  selectedTranslation: TranslateResult | null;
  setSelectedTranslation: (item: TranslateResult) => void;
}

const AppContext = createContext<AppContext>({
  user: null,
  setUser: (user) => {},
  setError: (message) => {},
  resetError: () => {},
  selectedTranslation: null,
  setSelectedTranslation: (item: TranslateResult) => {},
});

function useInitialApp(): AppContext {
  const [selectedTranslation, setSelectedTranslation] =
    useState<TranslateResult | null>(null);
  const [user, setUser] = useState<IAuthUser | null | undefined>(undefined);
  const { toast, dismiss } = useToast();
  return {
    user,
    setUser,
    setError: (message) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
    resetError: () => {
      dismiss();
    },
    selectedTranslation,
    setSelectedTranslation,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initialValue = useInitialApp();
  return (
    <AppContext.Provider value={initialValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
