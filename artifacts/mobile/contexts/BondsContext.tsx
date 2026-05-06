import React, { createContext, useContext, useState } from "react";
import { ALL_BONDS, CURRENT_USER } from "@/constants/data";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type BondMode = "solicitar" | "reivindicar" | "conceder" | "cadastro";
export type BondStatus = "Ativo" | "Pendente" | "Concedido" | "Inativo";

export interface Bond {
  id: number;
  user: string;
  type: string;
  since: string;
  until: string | null;
  active: boolean;
  status: BondStatus;
  mode: BondMode;
  docUri?: string;
  recipientCpf?: string;
  recipientEmail?: string;
  recipientName?: string;
}

interface BondsContextValue {
  bonds: Bond[];
  addBond: (params: {
    type: string;
    mode: BondMode;
    docUri?: string;
    recipientName?: string;
    recipientCpf?: string;
    recipientEmail?: string;
  }) => number;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const SEED_BONDS: Bond[] = ALL_BONDS.map(b => ({
  ...b,
  status: b.active ? "Ativo" : "Inativo",
  mode: "cadastro",
}));

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

const BondsContext = createContext<BondsContextValue | null>(null);

let nextId = 200;

function todayLabel(): string {
  const now = new Date();
  return now.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "");
}

export function BondsProvider({ children }: { children: React.ReactNode }) {
  const [bonds, setBonds] = useState<Bond[]>(SEED_BONDS);

  const addBond = ({
    type, mode, docUri, recipientName, recipientCpf, recipientEmail,
  }: {
    type: string;
    mode: BondMode;
    docUri?: string;
    recipientName?: string;
    recipientCpf?: string;
    recipientEmail?: string;
  }): number => {
    const id = nextId++;
    const displayUser =
      mode === "conceder"
        ? (recipientName ?? "Destinatário")
        : CURRENT_USER.name;

    const newBond: Bond = {
      id,
      user: displayUser,
      type,
      since: todayLabel(),
      until: null,
      active: false,
      status: "Pendente",
      mode,
      docUri,
      recipientName,
      recipientCpf,
      recipientEmail,
    };

    setBonds(prev => [newBond, ...prev]);
    return id;
  };

  return (
    <BondsContext.Provider value={{ bonds, addBond }}>
      {children}
    </BondsContext.Provider>
  );
}

export function useBonds(): BondsContextValue {
  const ctx = useContext(BondsContext);
  if (!ctx) throw new Error("useBonds must be used inside BondsProvider");
  return ctx;
}
