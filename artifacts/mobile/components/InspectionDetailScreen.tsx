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

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: React.ComponentProps<typeof Feather>["name"] }> = {
  Aprovada:  { bg: "#DCFCE7", text: "#16A34A", icon: "check-circle" },
  Pendente:  { bg: "#FEF9C3", text: "#CA8A04", icon: "clock" },
  Reprovada: { bg: "#FEF2F2", text: "#DC2626", icon: "x-circle" },
};

const TYPE_CONFIG: Record<string, { bg: string; text: string; icon: React.ComponentProps<typeof Feather>["name"] }> = {
  "Rotina":               { bg: "#F3F4F6", text: "#6B7280", icon: "refresh-cw" },
  "Transferência":        { bg: "#EFF6FF", text: "#2563EB", icon: "repeat" },
  "Abertura de sinistro": { bg: "#FFF7ED", text: "#C2410C", icon: "alert-triangle" },
  "Manutenção":           { bg: "#F0FDF4", text: "#16A34A", icon: "tool" },
  "Acidente":             { bg: "#FEF2F2", text: "#DC2626", icon: "alert-octagon" },
  "Auditoria":            { bg: "#FDF4FF", text: "#9333EA", icon: "shield" },
};

const PART_LABELS: Record<string, string> = {
  frente:    "Frente",
  traseira:  "Traseira",
  lateral_e: "Lateral esquerda",
  lateral_d: "Lateral direita",
  painel:    "Painel",
  placa:     "Placa",
  chassi:    "Chassi físico",
};

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={{
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingVertical: 13,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: C.border,
    }}>
      <Text style={{ fontSize: F.sm, color: C.textTertiary, flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary, flexShrink: 0, maxWidth: "60%" as any, textAlign: "right" as const }}>{value}</Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.xs, marginBottom: S.md }}>
      <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.textTertiary, letterSpacing: 1.2, textTransform: "uppercase" as const, marginBottom: S.xs }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

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
  const statusCfg = STATUS_CONFIG[inspection.status] ?? STATUS_CONFIG.Pendente;
  const typeCfg   = TYPE_CONFIG[inspection.type] ?? { bg: C.iconBg, text: C.iconColor, icon: "file-text" as const };

  const allParts = (inspection.plannedParts ?? INSPECTION_STEPS.map(s => s.id)).map(id => ({
    id,
    label: PART_LABELS[id] ?? id,
    done: inspection.parts.includes(id),
  }));

  const doneParts  = allParts.filter(p => p.done).length;
  const totalParts = allParts.length;
  const progress   = totalParts > 0 ? doneParts / totalParts : 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topPad + S.sm, paddingBottom: bottomPad + (isPending ? 100 : S.xxxl) }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header nav ── */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: S.xl, marginBottom: S.xl }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ paddingVertical: S.sm, paddingRight: S.md, paddingLeft: 0, marginLeft: -S.xs }}>
            <Feather name="arrow-left" size={I.xl} color={C.textSecondary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: F.lg, fontWeight: "700" as const, color: C.textPrimary }} numberOfLines={1}>
            Vistoria
          </Text>
        </View>

        {/* ── Hero card ── */}
        <View style={{ marginHorizontal: S.xl, backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md }}>

          {/* Type + Status badges */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.lg }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: typeCfg.bg, borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: S.md }}>
              <Feather name={typeCfg.icon} size={11} color={typeCfg.text} />
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: typeCfg.text }}>{inspection.type}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: statusCfg.bg, borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: S.md }}>
              <Feather name={statusCfg.icon} size={11} color={statusCfg.text} />
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: statusCfg.text }}>{inspection.status}</Text>
            </View>
          </View>

          {/* Main date */}
          <Text style={{ fontSize: 28, fontWeight: "800" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: 4 }}>
            {inspection.completedAt ?? inspection.requestedAt}
          </Text>
          {inspection.completedTime ? (
            <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xs }}>
              {inspection.completedTime}
            </Text>
          ) : null}

          <Text style={{ fontSize: F.sm, color: C.textTertiary, marginBottom: inspection.deadline ? S.sm : 0 }}>
            Solicitado por {inspection.requester}
          </Text>

          {inspection.deadline ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: S.xs }}>
              <Feather name="clock" size={I.sm} color="#CA8A04" />
              <Text style={{ fontSize: F.sm, fontWeight: "500" as const, color: "#CA8A04" }}>{inspection.deadline}</Text>
            </View>
          ) : null}

          {/* Progress bar — pendentes */}
          {isPending && totalParts > 0 && (
            <View style={{ marginTop: S.lg }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: S.xs }}>
                <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const }}>Progresso</Text>
                <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "600" as const }}>{doneParts}/{totalParts} partes</Text>
              </View>
              <View style={{ height: 4, backgroundColor: C.border, borderRadius: R.pill, overflow: "hidden" }}>
                <View style={{ height: 4, width: `${progress * 100}%` as any, backgroundColor: progress === 1 ? C.success : "#CA8A04", borderRadius: R.pill }} />
              </View>
            </View>
          )}

          {/* Descrição */}
          {inspection.descricao ? (
            <View style={{ marginTop: S.lg, paddingTop: S.lg, borderTopWidth: 1, borderTopColor: C.border }}>
              <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: 20 }}>{inspection.descricao}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Solicitação ── */}
        <View style={{ paddingHorizontal: S.xl }}>
          <SectionCard title="Solicitação">
            <InfoRow label="Solicitante"       value={inspection.requester} />
            <InfoRow label="Data de solicitação" value={inspection.requestedAt} />
            {inspection.deadline ? (
              <InfoRow label="Prazo" value={inspection.deadline} last />
            ) : (
              <InfoRow label="Partes previstas" value={`${totalParts} ${totalParts === 1 ? "parte" : "partes"}`} last />
            )}
          </SectionCard>

          {/* ── Realização (apenas finalizadas) ── */}
          {!isPending && inspection.completedAt ? (
            <SectionCard title="Realização">
              <InfoRow label="Data"    value={inspection.completedAt} />
              {inspection.completedTime ? (
                <InfoRow label="Horário" value={inspection.completedTime} />
              ) : null}
              {inspection.km && inspection.km !== "—" ? (
                <InfoRow label="KM no ato" value={inspection.km} last />
              ) : (
                <InfoRow label="Partes registradas" value={`${doneParts} de ${totalParts}`} last />
              )}
            </SectionCard>
          ) : null}

          {/* ── Partes do veículo ── */}
          <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.sm }}>
            <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.textTertiary, letterSpacing: 1.2, textTransform: "uppercase" as const, marginBottom: S.sm }}>
              Partes do veículo · {doneParts}/{totalParts}
            </Text>

            {allParts.map((part, idx) => (
              <View
                key={part.id}
                style={{
                  flexDirection: "row", alignItems: "center", gap: S.md,
                  paddingVertical: 12,
                  borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: C.border,
                }}
              >
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: part.done ? "#DCFCE7" : C.background,
                  alignItems: "center", justifyContent: "center",
                  borderWidth: part.done ? 0 : 1, borderColor: C.border,
                }}>
                  <Feather
                    name={part.done ? "check" : "minus"}
                    size={13}
                    color={part.done ? "#16A34A" : C.textTertiary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: F.base, fontWeight: "500" as const,
                    color: part.done ? C.textPrimary : C.textTertiary,
                  }}>
                    {part.label}
                  </Text>
                  {!part.done && isPending ? (
                    <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 1 }}>Aguardando registro</Text>
                  ) : null}
                </View>
                {part.done && (
                  <Text style={{ fontSize: F.xs, color: C.success, fontWeight: "600" as const }}>Registrado</Text>
                )}
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
          paddingHorizontal: S.xl, paddingBottom: bottomPad + S.lg, paddingTop: S.lg,
          borderTopWidth: 1, borderTopColor: C.border,
        }}>
          <TouchableOpacity
            onPress={() => router.push(`/inspection-run?id=${inspection.id}` as any)}
            activeOpacity={0.85}
            style={{
              backgroundColor: C.textPrimary, borderRadius: R.xxl,
              paddingVertical: S.lg,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm,
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
