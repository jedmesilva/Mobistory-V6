import React, { createContext, useContext, useState } from "react";
import { ALL_INSPECTIONS, CURRENT_USER } from "@/constants/data";

export type Inspection = typeof ALL_INSPECTIONS[number] & {
  plannedParts?: string[];
  descricao?: string;
};

interface InspectionsContextValue {
  inspections: Inspection[];
  addInspection: (plannedParts: string[], motivo: string, descricao: string) => number;
  completeStep: (id: number, partId: string) => void;
  finishInspection: (id: number) => void;
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

  const addInspection = (plannedParts: string[], motivo: string, descricao: string): number => {
    const id = nextId++;
    const newInspection: Inspection = {
      id,
      date: todayLabel(),
      time: nowTimeLabel(),
      type: motivo,
      descricao,
      km: "—",
      parts: [],
      totalParts: plannedParts.length,
      status: "Pendente",
      requester: CURRENT_USER.name,
      deadline: "Vence em 7 dias",
      plannedParts,
    };
    setInspections(prev => [newInspection, ...prev]);
    return id;
  };

  const completeStep = (id: number, partId: string) => {
    setInspections(prev =>
      prev.map(insp =>
        insp.id === id && !insp.parts.includes(partId)
          ? { ...insp, parts: [...insp.parts, partId] }
          : insp
      )
    );
  };

  const finishInspection = (id: number) => {
    setInspections(prev =>
      prev.map(insp =>
        insp.id === id
          ? { ...insp, status: "Aprovada", deadline: null, time: nowTimeLabel() }
          : insp
      )
    );
  };

  return (
    <InspectionsContext.Provider value={{ inspections, addInspection, completeStep, finishInspection }}>
      {children}
    </InspectionsContext.Provider>
  );
}

export function useInspections(): InspectionsContextValue {
  const ctx = useContext(InspectionsContext);
  if (!ctx) throw new Error("useInspections must be used inside InspectionsProvider");
  return ctx;
}
