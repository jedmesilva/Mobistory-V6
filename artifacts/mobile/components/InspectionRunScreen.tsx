import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { INSPECTION_STEPS } from "@/constants/data";
import { useInspections } from "@/contexts/InspectionsContext";
import InspectionCamera from "@/components/InspectionCamera";
import { R, S, F, I } from "@/components/shared";

const C = colors.light;

const PART_LABELS: Record<string, string> = {
  frente:    "Frente",
  traseira:  "Traseira",
  lateral_e: "Lateral esq.",
  lateral_d: "Lateral dir.",
  painel:    "Painel",
  placa:     "Placa",
  chassi:    "Chassi físico",
};

export default function InspectionRunScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inspections, completeStep, finishInspection } = useInspections();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const inspection = inspections.find(i => i.id === Number(id));

  const [cameraStepIndex, setCameraStepIndex] = useState<number | null>(null);

  if (!inspection) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: C.textSecondary, fontSize: F.base }}>Vistoria não encontrada.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: S.lg }}>
          <Text style={{ color: C.textPrimary, fontWeight: "600" as const }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const plannedIds: string[] = (inspection as any).plannedParts ?? INSPECTION_STEPS.map(s => s.id);
  const steps = INSPECTION_STEPS.filter(s => plannedIds.includes(s.id));
  const doneSet = new Set(inspection.parts);
  const remaining = steps.filter(s => !doneSet.has(s.id));
  const done = steps.filter(s => doneSet.has(s.id));
  const totalSteps = steps.length;
  const doneCount  = done.length;
  const progress   = totalSteps > 0 ? doneCount / totalSteps : 0;

  const currentStepObj = cameraStepIndex !== null ? steps[cameraStepIndex] : null;
  const currentStepIdx = cameraStepIndex !== null ? cameraStepIndex : 0;

  const handleOpenCamera = (idx: number) => {
    setCameraStepIndex(idx);
  };

  const handleCapture = useCallback((uri: string) => {
    if (cameraStepIndex === null) return;
    const stepId = steps[cameraStepIndex].id;
    completeStep(Number(id), stepId);
    setCameraStepIndex(null);
  }, [cameraStepIndex, steps, id, completeStep]);

  const handleCloseCamera = useCallback(() => {
    setCameraStepIndex(null);
  }, []);

  const handleFinish = () => {
    Alert.alert(
      "Finalizar vistoria",
      "Todas as etapas obrigatórias foram fotografadas. Deseja concluir esta vistoria?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Concluir",
          onPress: () => {
            finishInspection(Number(id));
            router.back();
          },
        },
      ]
    );
  };

  const allDone = remaining.length === 0;
  const requiredRemaining = remaining.filter(s => s.required);
  const canFinish = requiredRemaining.length === 0 && doneCount > 0;

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.background }}
        contentContainerStyle={{ paddingTop: topPad + S.lg, paddingBottom: bottomPad + S.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={{ paddingHorizontal: S.xl }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: S.lg }}>
            <Feather name="arrow-left" size={I.md} color={C.textSecondary} />
            <Text style={{ fontSize: F.sm, color: C.textSecondary }}>Voltar</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.xs }}>
            Vistoria em andamento
          </Text>
          <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xs }}>
            {inspection.type}
          </Text>
          <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: S.xl }}>
            Solicitado por {inspection.requester} · {inspection.km}
          </Text>

          {/* PROGRESS BAR */}
          <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.xxl }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.md }}>
              <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>
                Progresso
              </Text>
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>
                {doneCount}/{totalSteps} etapas
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: C.border, borderRadius: R.pill, overflow: "hidden" }}>
              <View style={{
                height: 6,
                width: `${progress * 100}%`,
                backgroundColor: allDone ? "#16A34A" : C.textPrimary,
                borderRadius: R.pill,
              }} />
            </View>
            {allDone && (
              <Text style={{ fontSize: F.sm, color: "#16A34A", fontWeight: "600" as const, marginTop: S.sm }}>
                Todas as etapas concluídas!
              </Text>
            )}
          </View>
        </View>

        {/* REMAINING STEPS */}
        {remaining.length > 0 && (
          <View style={{ paddingHorizontal: S.xl, marginBottom: S.xxl }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.sm }}>
              Pendentes · {remaining.length}
            </Text>
            <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden" }}>
              {remaining.map((step, idx) => {
                const globalIdx = steps.indexOf(step);
                const isLast = idx === remaining.length - 1;
                return (
                  <TouchableOpacity
                    key={step.id}
                    onPress={() => handleOpenCamera(globalIdx)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row", alignItems: "center",
                      paddingVertical: S.md, paddingHorizontal: S.xl,
                      borderBottomWidth: isLast ? 0 : 1, borderBottomColor: C.border,
                    }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: C.background,
                      alignItems: "center", justifyContent: "center",
                      marginRight: S.md,
                    }}>
                      <Feather name="camera" size={I.md} color={C.textTertiary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
                        <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>
                          {PART_LABELS[step.id] ?? step.label}
                        </Text>
                        {step.required && (
                          <View style={{ backgroundColor: "#EFF6FF", borderRadius: R.pill, paddingVertical: 1, paddingHorizontal: S.xs }}>
                            <Text style={{ fontSize: F.xxs, fontWeight: "600" as const, color: "#2563EB" }}>Obrigatório</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: 2 }}>{step.instruction}</Text>
                    </View>
                    <Feather name="chevron-right" size={I.md} color={C.textTertiary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* DONE STEPS */}
        {done.length > 0 && (
          <View style={{ paddingHorizontal: S.xl }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.sm }}>
              Concluídas · {done.length}
            </Text>
            <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden" }}>
              {done.map((step, idx) => {
                const isLast = idx === done.length - 1;
                return (
                  <View
                    key={step.id}
                    style={{
                      flexDirection: "row", alignItems: "center",
                      paddingVertical: S.md, paddingHorizontal: S.xl,
                      borderBottomWidth: isLast ? 0 : 1, borderBottomColor: C.border,
                    }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: "#DCFCE7",
                      alignItems: "center", justifyContent: "center",
                      marginRight: S.md,
                    }}>
                      <Feather name="check" size={I.md} color="#16A34A" />
                    </View>
                    <Text style={{ fontSize: F.base, fontWeight: "500" as const, color: C.textSecondary, flex: 1 }}>
                      {PART_LABELS[step.id] ?? step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM CTA */}
      {canFinish && (
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: C.background,
          paddingHorizontal: S.xl,
          paddingTop: S.md,
          paddingBottom: bottomPad + S.md,
          borderTopWidth: 1,
          borderTopColor: C.border,
        }}>
          <TouchableOpacity
            onPress={handleFinish}
            activeOpacity={0.85}
            style={{
              backgroundColor: C.textPrimary, borderRadius: R.xxl,
              paddingVertical: S.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm,
            }}
          >
            <Feather name="check-circle" size={I.lg} color={C.surface} />
            <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.surface }}>
              Concluir vistoria
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CAMERA MODAL */}
      {currentStepObj && (
        <InspectionCamera
          step={currentStepObj}
          stepIndex={currentStepIdx}
          totalSteps={totalSteps}
          onCapture={handleCapture}
          onClose={handleCloseCamera}
        />
      )}
    </>
  );
}
