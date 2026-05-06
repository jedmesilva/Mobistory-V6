import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Alert, Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, R, S, F, I } from "@/constants/theme";
import { INSPECTION_STEPS } from "@/constants/data";
import { useInspections } from "@/contexts/InspectionsContext";
import InspectionCamera from "@/components/InspectionCamera";

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

// ─── PROGRESS CARD ───────────────────────────────────────────────────────────

function ProgressCard({ done, total }: { done: number; total: number }) {
  const pct    = total > 0 ? done / total : 0;
  const finish = done === total;
  return (
    <View style={{ marginHorizontal: S.xl, marginBottom: S.lg, backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S.sm }}>
        <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>Progresso</Text>
        <Text style={{ fontSize: F.sm, fontWeight: "700" as const, color: C.textPrimary }}>{done}/{total} partes</Text>
      </View>
      <View style={{ height: 6, backgroundColor: C.iconBg, borderRadius: R.pill, overflow: "hidden" }}>
        <View style={{
          height: 6,
          width: `${pct * 100}%` as any,
          backgroundColor: finish ? C.success : C.textPrimary,
          borderRadius: R.pill,
        }} />
      </View>
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

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────

export default function InspectionRunScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inspections, completeStep, finishInspection } = useInspections();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const inspection = inspections.find(i => i.id === Number(id));

  const [photos, setPhotos]             = useState<Record<string, string>>({});
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  if (!inspection) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <Feather name="alert-circle" size={I.xxxl} color={C.textTertiary} />
        <Text style={{ fontSize: F.base, color: C.textTertiary, marginTop: S.md }}>Vistoria não encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginTop: S.lg }}>
          <Text style={{ fontSize: F.base, color: C.textPrimary, fontWeight: "600" as const }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const plannedIds: string[] = (inspection as any).plannedParts ?? INSPECTION_STEPS.map(s => s.id);
  const steps = INSPECTION_STEPS.filter(s => plannedIds.includes(s.id));

  const required     = steps.filter(s => s.required);
  const doneRequired = required.filter(s => !!photos[s.id]).length;
  const canFinish    = doneRequired === required.length && doneRequired > 0;

  const activeStep      = steps.find(s => s.id === activeStepId) ?? null;
  const activeStepIndex = activeStep ? steps.indexOf(activeStep) : 0;

  const openCamera  = useCallback((sid: string) => setActiveStepId(sid), []);
  const closeCamera = useCallback(() => setActiveStepId(null), []);

  const handleCapture = useCallback((uri: string) => {
    if (!activeStepId) return;
    setPhotos(prev => ({ ...prev, [activeStepId]: uri }));
    completeStep(Number(id), activeStepId);
    setActiveStepId(null);
  }, [activeStepId, id, completeStep]);

  const handleRetake = useCallback((sid: string) => {
    setPhotos(prev => { const n = { ...prev }; delete n[sid]; return n; });
    setTimeout(() => setActiveStepId(sid), 100);
  }, []);

  const handleFinish = () => {
    Alert.alert(
      "Finalizar vistoria",
      "Deseja concluir esta vistoria? As etapas fotografadas serão registradas.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Concluir", onPress: () => { finishInspection(Number(id)); router.back(); } },
      ]
    );
  };

  // Format datetime label
  const datetime = inspection.requestedAt
    + (inspection.completedTime ? ` · ${inspection.completedTime}` : "");

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + S.sm, paddingBottom: bottomPad + 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary }}>Vistoria</Text>
        </View>

        {/* ── Context card ── */}
        <ContextCard
          type={inspection.type}
          status="Pendente"
          datetime={datetime}
          requestedBy={inspection.requester}
          description={inspection.descricao}
        />

        {/* ── Progress card ── */}
        <ProgressCard done={doneRequired} total={required.length} />

        {/* ── Steps list ── */}
        <View style={{ paddingHorizontal: S.xl }}>
          <SectionLabel title="Partes do veículo" right={`${doneRequired}/${steps.length}`} />
          <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden" }}>
            {steps.map((step, idx) => {
              const isDone = !!photos[step.id];
              return (
                <View
                  key={step.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: S.md,
                    padding: S.lg,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: C.border,
                  }}
                >
                  {/* Thumbnail / placeholder */}
                  <TouchableOpacity
                    onPress={() => openCamera(step.id)}
                    activeOpacity={0.8}
                    style={{
                      width: 52, height: 52,
                      borderRadius: R.md,
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: isDone ? "transparent" : C.iconBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isDone
                      ? <Image source={{ uri: photos[step.id] }} style={{ width: 52, height: 52 }} resizeMode="cover" />
                      : <Feather name="camera" size={I.xl} color={C.iconColor} />
                    }
                  </TouchableOpacity>

                  {/* Label + instruction */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: 3 }}>
                      <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>
                        {step.label}
                      </Text>
                      {!step.required && (
                        <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 1, paddingHorizontal: S.xs }}>
                          <Text style={{ fontSize: F.xxs, fontWeight: "600" as const, color: C.textTertiary }}>OPCIONAL</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: F.sm * 1.4 }}>
                      {step.instruction}
                    </Text>
                  </View>

                  {/* Action */}
                  {isDone ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, flexShrink: 0 }}>
                      <TouchableOpacity
                        onPress={() => handleRetake(step.id)}
                        activeOpacity={0.7}
                        style={{ padding: S.xs }}
                      >
                        <Feather name="rotate-ccw" size={I.md} color={C.textTertiary} />
                      </TouchableOpacity>
                      <View style={{
                        width: 26, height: 26, borderRadius: 13,
                        backgroundColor: C.success,
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Feather name="check" size={I.xs} color="#fff" strokeWidth={3 as any} />
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => openCamera(step.id)}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: S.xs,
                        backgroundColor: C.textPrimary,
                        borderRadius: R.pill,
                        paddingVertical: 7, paddingHorizontal: S.md,
                        flexShrink: 0,
                      }}
                    >
                      <Feather name="camera" size={I.xs} color={C.textInverse} />
                      <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.textInverse }}>
                        Fotografar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: C.background,
        paddingHorizontal: S.xl,
        paddingBottom: bottomPad + S.lg,
        paddingTop: S.md,
      }}>
        <TouchableOpacity
          onPress={canFinish ? handleFinish : undefined}
          activeOpacity={canFinish ? 0.85 : 1}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            backgroundColor: canFinish ? C.success : C.iconBg,
            borderRadius: R.xxl,
            paddingVertical: S.lg,
          }}
        >
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: canFinish ? "#fff" : C.textTertiary }}>
            {canFinish ? "Finalizar vistoria" : `Aguardando fotos · ${doneRequired}/${required.length}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Camera modal ── */}
      {activeStep && (
        <InspectionCamera
          step={activeStep}
          stepIndex={activeStepIndex}
          totalSteps={steps.length}
          onCapture={handleCapture}
          onClose={closeCamera}
        />
      )}
    </View>
  );
}
