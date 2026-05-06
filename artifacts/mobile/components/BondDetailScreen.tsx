import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, R, S, F, I, BackButton, TimelineItem, getActivityIcon } from "@/components/shared";
import { BOND_TYPES } from "@/constants/data";
import { useBonds, Bond, BondMode, BondStatus } from "@/contexts/BondsContext";

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BondStatus, { bg: string; text: string; icon: React.ComponentProps<typeof Feather>["name"] }> = {
  Ativo:     { bg: C.successBg,  text: C.success,      icon: "check-circle" },
  Pendente:  { bg: "#FFFBEB",    text: "#B45309",       icon: "clock"        },
  Inativo:   { bg: C.iconBg,     text: C.textTertiary,  icon: "minus-circle" },
  Concedido: { bg: "#EFF6FF",    text: "#1D4ED8",       icon: "user-check"   },
};

function StatusBadge({ status }: { status: BondStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pendente;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, backgroundColor: cfg.bg, borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: S.sm }}>
      <Feather name={cfg.icon} size={10} color={cfg.text} />
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: cfg.text }}>{status}</Text>
    </View>
  );
}

// ─── MODE LABEL ───────────────────────────────────────────────────────────────

const MODE_LABEL: Record<BondMode, string> = {
  solicitar: "Solicitado",
  reivindicar: "Reivindicado",
  conceder: "Concedido",
  cadastro: "Cadastrado",
};

// ─── EVENT GENERATOR ─────────────────────────────────────────────────────────

type BondEvent = {
  id: number;
  icon: React.ComponentProps<typeof Feather>["name"];
  iconColor: string;
  label: string;
  desc: string;
  datetime: string;
  by?: string;
};

function generateEvents(bond: Bond): BondEvent[] {
  const events: BondEvent[] = [];
  const base = bond.since;

  // ── Event 1: Initial action ────────────────────────────────────────────────
  if (bond.mode === "conceder") {
    events.push({
      id: 1,
      icon: "user-check",
      iconColor: C.primary,
      label: "Vínculo concedido",
      desc: `${bond.user} concedeu o vínculo como ${bond.type}`,
      datetime: `${base} · 09:00`,
      by: bond.user,
    });
    events.push({
      id: 2,
      icon: "send",
      iconColor: C.textSecondary,
      label: "Convite enviado",
      desc: `Convite enviado para ${bond.recipientEmail ?? bond.recipientName ?? "destinatário"}`,
      datetime: `${base} · 09:02`,
      by: "Sistema Mobistory",
    });
  } else {
    const actionLabel = bond.mode === "reivindicar" ? "Reivindicação enviada" : "Solicitação enviada";
    const actionDesc  = bond.mode === "reivindicar"
      ? `${bond.user} reivindicou o vínculo como ${bond.type}`
      : `${bond.user} solicitou o vínculo como ${bond.type}`;
    events.push({
      id: 1,
      icon: "clock",
      iconColor: "#B45309",
      label: actionLabel,
      desc: actionDesc,
      datetime: `${base} · 09:00`,
      by: bond.user,
    });
  }

  // ── Event 2: Under analysis ────────────────────────────────────────────────
  if (bond.status !== "Inativo") {
    events.push({
      id: events.length + 1,
      icon: "search",
      iconColor: C.textSecondary,
      label: "Em análise",
      desc: "Documentação e dados em processo de verificação pelo sistema",
      datetime: `${base} · 09:15`,
      by: "Sistema Mobistory",
    });
  }

  // ── Active bond: approved + verified ──────────────────────────────────────
  if (bond.status === "Ativo") {
    events.push({
      id: events.length + 1,
      icon: "check",
      iconColor: C.success,
      label: "Vínculo aprovado",
      desc: "O vínculo foi aprovado pelo sistema Mobistory",
      datetime: `${base} · 09:30`,
      by: "Sistema Mobistory",
    });
    events.push({
      id: events.length + 1,
      icon: "shield",
      iconColor: C.success,
      label: "Vínculo verificado",
      desc: "Identidade e documentação foram confirmadas",
      datetime: `${base} · 14:32`,
      by: "Sistema Mobistory",
    });
  }

  // ── Inactive bond: approved then closed ───────────────────────────────────
  if (bond.status === "Inativo") {
    events.push({
      id: events.length + 1,
      icon: "search",
      iconColor: C.textSecondary,
      label: "Em análise",
      desc: "Documentação e dados verificados pelo sistema",
      datetime: `${base} · 09:15`,
      by: "Sistema Mobistory",
    });
    events.push({
      id: events.length + 1,
      icon: "check",
      iconColor: C.success,
      label: "Vínculo aprovado",
      desc: "O vínculo foi aprovado e ativado",
      datetime: `${base} · 09:30`,
      by: "Sistema Mobistory",
    });
    events.push({
      id: events.length + 1,
      icon: "x-circle",
      iconColor: C.destructive,
      label: "Vínculo encerrado",
      desc: bond.until ? `Vínculo encerrado em ${bond.until}` : "O vínculo foi encerrado",
      datetime: `${bond.until ?? base} · 00:00`,
      by: "Sistema Mobistory",
    });
  }

  return events;
}

// ─── INFO ROW ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: S.md }}>
      <Text style={{ fontSize: F.sm, color: C.textTertiary, fontWeight: "500" as const }}>{label}</Text>
      <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary, textAlign: "right", flexShrink: 1 }}>{value}</Text>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function BondDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bonds } = useBonds();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const bond = bonds.find(b => String(b.id) === id);

  if (!bond) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", gap: S.md }}>
        <Feather name="alert-circle" size={I.xxxl} color={C.textTertiary} />
        <Text style={{ fontSize: F.base, color: C.textTertiary }}>Vínculo não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={{ fontSize: F.base, color: C.textPrimary, fontWeight: "600" as const }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bondLabel = BOND_TYPES.find(b => b.id === bond.type)?.label ?? bond.type;
  const events    = generateEvents(bond);

  const handleShare = async () => {
    try {
      await Share.share({ message: `Vínculo Mobistory · ${bondLabel} · ${bond.user}` });
    } catch (_) {}
  };

  const handleExport = () => {
    Alert.alert("Exportar vínculo", "Escolha o formato", [
      { text: "CSV", onPress: () => {} },
      { text: "PDF", onPress: () => {} },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleDesvincular = () => {
    Alert.alert(
      "Encerrar vínculo",
      "Deseja encerrar este vínculo? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Encerrar", style: "destructive", onPress: () => router.back() },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: topPad + S.lg, paddingBottom: bottomPad + S.xxxl + 20 }}
      >
        {/* ── HEADER ── */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
          <BackButton onPress={() => router.back()} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
            <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="share-2" size={I.xxl} color={C.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="download" size={I.xxl} color={C.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── TITLE ── */}
        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xxl }}>
          {bondLabel}
        </Text>

        {/* ── BOND CARD ── */}
        <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md }}>
          {/* Icon + status */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.lg }}>
            <View style={{ width: 48, height: 48, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Feather name="user" size={I.xxl} color={C.iconColor} />
            </View>
            <StatusBadge status={bond.status} />
          </View>

          {/* Person */}
          <Text style={{ fontSize: F.xxxl, fontWeight: "700" as const, color: C.textPrimary }}>{bond.user}</Text>
          <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: S.xs, marginBottom: S.lg }}>
            {MODE_LABEL[bond.mode]} · {bond.type}
          </Text>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: C.border, marginBottom: S.lg }} />

          {/* Info rows */}
          <View style={{ gap: S.md }}>
            <InfoRow label="Iniciado por" value={bond.user} />
            <InfoRow label="Desde" value={bond.since} />
            {bond.until && <InfoRow label="Encerrado em" value={bond.until} />}
            {bond.status === "Ativo" && <InfoRow label="Verificado por" value="Sistema Mobistory" />}
            {bond.mode === "conceder" && bond.recipientName && (
              <InfoRow label="Destinatário" value={bond.recipientName} />
            )}
            {bond.mode === "conceder" && bond.recipientEmail && (
              <InfoRow label="E-mail" value={bond.recipientEmail} />
            )}
            {bond.mode === "conceder" && bond.recipientCpf && (
              <InfoRow label="CPF" value={bond.recipientCpf} />
            )}
          </View>
        </View>

        {/* ── ACTION BUTTONS ── */}
        <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xxl }}>
          <TouchableOpacity
            onPress={handleExport}
            activeOpacity={0.7}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: S.md }}
          >
            <Feather name="download" size={I.lg} color={C.textSecondary} />
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>Exportar</Text>
          </TouchableOpacity>

          {bond.status === "Ativo" && (
            <TouchableOpacity
              onPress={handleDesvincular}
              activeOpacity={0.7}
              style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: "#FEF2F2", borderRadius: R.xl, paddingVertical: S.md }}
            >
              <Feather name="user-x" size={I.lg} color={C.destructive} />
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.destructive }}>Encerrar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── TIMELINE ── */}
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.lg }}>
          Histórico do vínculo
        </Text>

        <View>
          {events.map((ev, idx) => (
            <View key={ev.id}>
              <TimelineItem
                iconName={ev.icon}
                iconColor={ev.iconColor}
                label={ev.label}
                desc={ev.desc}
                date={ev.by ? `${ev.datetime} · ${ev.by}` : ev.datetime}
                isLast={idx === events.length - 1}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
