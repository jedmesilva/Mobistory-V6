import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { C, R, S, F, I } from "@/constants/theme";
import { INSPECTION_STEPS } from "@/constants/data";
import { useInspections } from "@/contexts/InspectionsContext";

// ─── STATUS BADGE ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; text: string; icon: React.ComponentProps<typeof Feather>["name"] }> = {
  "Aprovada":  { bg: "#F0FDF4", text: "#15803D", icon: "check-circle" },
  "Pendente":  { bg: "#FFFBEB", text: "#B45309", icon: "clock" },
  "Reprovada": { bg: "#EFF6FF", text: "#1D4ED8", icon: "refresh-cw" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE["Pendente"];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, backgroundColor: cfg.bg, borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: S.sm }}>
      <Feather name={cfg.icon} size={10} color={cfg.text} />
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: cfg.text }}>{status}</Text>
    </View>
  );
}

// ─── CONTEXT CARD ────────────────────────────────────────────────────────────

function ContextCard({ type, status, datetime, requestedBy, description }: {
  type: string; status: string; datetime: string; requestedBy: string; description?: string | null;
}) {
  return (
    <View style={{ marginHorizontal: S.xl, marginBottom: S.lg, backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: S.md, marginBottom: S.sm }}>
        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, lineHeight: F.hero * 1.1, flex: 1 }}>
          {type}
        </Text>
        <StatusBadge status={status} />
      </View>
      <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: S.xs }}>{datetime}</Text>
      <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: description ? S.lg : 0 }}>
        Solicitado por {requestedBy}
      </Text>
      {description ? (
        <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: F.sm * 1.5 }}>{description}</Text>
      ) : null}
    </View>
  );
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────

function SectionLabel({ title, right }: { title: string; right?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>
        {title}
      </Text>
      {right ? (
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary }}>{right}</Text>
      ) : null}
    </View>
  );
}

// ─── DATA ROW ────────────────────────────────────────────────────────────────

function DataRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingVertical: 13,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: C.border,
    }}>
      <Text style={{ fontSize: F.base, color: C.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary, maxWidth: "60%" as any, textAlign: "right" as const }}>
        {value}
      </Text>
    </View>
  );
}

// ─── PART LABELS ─────────────────────────────────────────────────────────────

const PART_LABELS: Record<string, string> = {
  frente:    "Frente",
  traseira:  "Traseira",
  lateral_e: "Lateral esquerda",
  lateral_d: "Lateral direita",
  painel:    "Painel",
  placa:     "Placa",
  chassi:    "Chassi físico",
};

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function InspectionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inspections } = useInspections();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const inspection = inspections.find(i => i.id === Number(id));

  if (!inspection) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <Feather name="alert-circle" size={I.xxxl} color={C.textTertiary} />
        <Text style={{ fontSize: F.base, color: C.textTertiary, marginTop: S.md }}>Vistoria não encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginTop: S.lg }}>
          <Text style={{ fontSize: F.base, color: C.textPrimary, fontWeight: "600" as const }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPending = inspection.status === "Pendente";

  const allParts = (inspection.plannedParts ?? INSPECTION_STEPS.map(s => s.id)).map(partId => ({
    id: partId,
    label: PART_LABELS[partId] ?? partId,
    done: inspection.parts.includes(partId),
  }));

  const doneParts  = allParts.filter(p => p.done).length;
  const totalParts = allParts.length;

  // Build datetime label
  const datetime = inspection.completedAt
    ? `${inspection.completedAt}${inspection.completedTime ? ` · ${inspection.completedTime}` : ""}`
    : inspection.requestedAt;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + S.sm, paddingBottom: bottomPad + (isPending ? 100 : S.xxxl) }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, paddingHorizontal: S.xl, marginBottom: S.xl }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{ paddingVertical: S.sm, paddingRight: S.md, paddingLeft: 0, marginLeft: -S.xs }}
          >
            <Feather name="arrow-left" size={I.lg} color={C.textSecondary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary }} numberOfLines={1}>
            Vistoria
          </Text>
        </View>

        {/* ── Context card ── */}
        <ContextCard
          type={inspection.type}
          status={inspection.status}
          datetime={datetime}
          requestedBy={inspection.requester}
          description={inspection.descricao}
        />

        <View style={{ paddingHorizontal: S.xl }}>

          {/* ── Solicitação ── */}
          <SectionLabel title="Solicitação" />
          <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, paddingHorizontal: S.lg, marginBottom: S.lg }}>
            <DataRow label="Solicitante"         value={inspection.requester} />
            <DataRow label="Data de solicitação" value={inspection.requestedAt} />
            {inspection.deadline ? (
              <DataRow label="Prazo" value={inspection.deadline} last />
            ) : (
              <DataRow label="Partes previstas" value={`${totalParts} ${totalParts === 1 ? "parte" : "partes"}`} last />
            )}
          </View>

          {/* ── Realização (apenas finalizadas) ── */}
          {!isPending && inspection.completedAt ? (
            <>
              <SectionLabel title="Realização" />
              <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, paddingHorizontal: S.lg, marginBottom: S.lg }}>
                <DataRow
                  label="Data e hora"
                  value={`${inspection.completedAt}${inspection.completedTime ? ` · ${inspection.completedTime}` : ""}`}
                  last
                />
              </View>
            </>
          ) : null}

          {/* ── Partes do veículo ── */}
          <SectionLabel title="Partes do veículo" right={`${doneParts}/${totalParts}`} />
          <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden" }}>
            {allParts.map((part, idx) => (
              <View
                key={part.id}
                style={{
                  flexDirection: "row", alignItems: "center", gap: S.md,
                  padding: S.lg,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: C.border,
                }}
              >
                {/* Status icon */}
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: part.done ? C.successBg : C.background,
                  alignItems: "center", justifyContent: "center",
                  borderWidth: part.done ? 0 : 1,
                  borderColor: C.border,
                  flexShrink: 0,
                }}>
                  <Feather
                    name={part.done ? "check" : "minus"}
                    size={I.sm}
                    color={part.done ? C.success : C.textTertiary}
                  />
                </View>

                {/* Label */}
                <Text style={{
                  flex: 1,
                  fontSize: F.base, fontWeight: "600" as const,
                  color: part.done ? C.textPrimary : C.textTertiary,
                }}>
                  {part.label}
                </Text>

                {/* Status text */}
                {part.done ? (
                  <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.success }}>
                    Registrado
                  </Text>
                ) : isPending ? (
                  <Text style={{ fontSize: F.sm, color: C.textTertiary }}>
                    Pendente
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* ── CTA fixo (pendentes) ── */}
      {isPending && (
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: C.background,
          paddingHorizontal: S.xl,
          paddingBottom: bottomPad + S.lg,
          paddingTop: S.md,
        }}>
          <TouchableOpacity
            onPress={() => router.push(`/inspection-run?id=${inspection.id}` as any)}
            activeOpacity={0.85}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "center",
              gap: S.sm,
              backgroundColor: C.textPrimary,
              borderRadius: R.xxl,
              paddingVertical: S.lg,
            }}
          >
            <Feather name="camera" size={I.lg} color={C.surface} />
            <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.surface }}>
              {inspection.parts.length > 0 ? "Continuar vistoria" : "Iniciar vistoria"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
