import React, { createContext, useContext, useState } from "react";
import { ALL_INSPECTIONS } from "@/constants/data";

type Inspection = typeof ALL_INSPECTIONS[number];

interface InspectionsContextValue {
  inspections: Inspection[];
  addInspection: (parts: string[], type: string) => void;
}

const InspectionsContext = createContext<InspectionsContextValue | null>(null);

let nextId = 100;

function todayLabel(): string {
  return new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
}

function nowTimeLabel(): string {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function InspectionsProvider({ children }: { children: React.ReactNode }) {
  const [inspections, setInspections] = useState<Inspection[]>(ALL_INSPECTIONS);

  const addInspection = (parts: string[], type: string) => {
    const newInspection: Inspection = {
      id: nextId++,
      date: todayLabel(),
      time: nowTimeLabel(),
      type,
      km: "—",
      parts: [],
      totalParts: parts.length,
      status: "Pendente",
      requester: "Usuário",
      deadline: "Vence em 7 dias",
    };
    setInspections(prev => [newInspection, ...prev]);
  };

  return (
    <InspectionsContext.Provider value={{ inspections, addInspection }}>
      {children}
    </InspectionsContext.Provider>
  );
}

export function useInspections(): InspectionsContextValue {
  const ctx = useContext(InspectionsContext);
  if (!ctx) throw new Error("useInspections must be used inside InspectionsProvider");
  return ctx;
}
