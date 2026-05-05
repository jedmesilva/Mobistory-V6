import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Alert, Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { INSPECTION_STEPS } from "@/constants/data";
import { useInspections } from "@/contexts/InspectionsContext";
import InspectionCamera from "@/components/InspectionCamera";
import { R, S, F, I } from "@/components/shared";

const C = colors.light;

const GREEN        = "#16A34A";
const GREEN_BG     = "#F0FDF4";
const GREEN_BORDER = "#BBF7D0";

export default function InspectionRunScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { inspections, completeStep, finishInspection } = useInspections();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const inspection = inspections.find(i => i.id === Number(id));

  const [photos, setPhotos]         = useState<Record<string, string>>({});
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

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

  const required     = steps.filter(s => s.required);
  const doneRequired = required.filter(s => !!photos[s.id]).length;
  const totalPhotos  = Object.keys(photos).length;
  const canFinish    = doneRequired === required.length && totalPhotos > 0;

  const activeStep      = steps.find(s => s.id === activeStepId) ?? null;
  const activeStepIndex = activeStep ? steps.indexOf(activeStep) : 0;

  const openCamera  = useCallback((id: string) => setActiveStepId(id), []);
  const closeCamera = useCallback(() => setActiveStepId(null), []);

  const handleCapture = useCallback((uri: string) => {
    if (!activeStepId) return;
    setPhotos(prev => ({ ...prev, [activeStepId]: uri }));
    completeStep(Number(id), activeStepId);
    setActiveStepId(null);
  }, [activeStepId, id, completeStep]);

  const handleFinish = () => {
    Alert.alert(
      "Finalizar vistoria",
      "Deseja concluir esta vistoria? As etapas fotografadas serão registradas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Concluir",
          onPress: () => { finishInspection(Number(id)); router.back(); },
        },
      ]
    );
  };

  const progressPercent = required.length > 0
    ? Math.round((doneRequired / required.length) * 100)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPad + S.lg,
          paddingBottom: bottomPad + 120,
          padding: S.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* BACK */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{ marginBottom: S.xl, padding: S.xs, alignSelf: "flex-start" }}
        >
          <Feather name="arrow-left" size={I.lg} color="#374151" />
        </TouchableOpacity>

        {/* HEADER */}
        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xs }}>
          Vistoria
        </Text>
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, lineHeight: F.base * 1.5 }}>
          {inspection.type} · {inspection.requester} · {inspection.km}
        </Text>

        {/* PROGRESSO */}
        <View style={{ marginBottom: S.xxl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S.sm }}>
            <Text style={{ fontSize: F.sm, color: C.textSecondary }}>
              {doneRequired} de {required.length} fotos obrigatórias
            </Text>
            <Text style={{ fontSize: F.sm, fontWeight: "700" as const, color: C.textPrimary }}>
              {progressPercent}%
            </Text>
          </View>
          <View style={{ height: 4, backgroundColor: C.border, borderRadius: R.pill, overflow: "hidden" }}>
            <View style={{
              height: "100%",
              width: `${progressPercent}%` as any,
              backgroundColor: C.primary,
              borderRadius: R.pill,
            }} />
          </View>
        </View>

        {/* STEP CARDS */}
        <View style={{ gap: S.sm }}>
          {steps.map(step => {
            const isDone = !!photos[step.id];
            return (
              <View
                key={step.id}
                style={{
                  backgroundColor: C.surface,
                  borderRadius: R.xl,
                  overflow: "hidden",
                  borderWidth: 1.5,
                  borderColor: isDone ? GREEN_BORDER : "transparent",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, padding: S.lg }}>
                  {/* Thumbnail / placeholder */}
                  <TouchableOpacity
                    onPress={() => openCamera(step.id)}
                    activeOpacity={0.8}
                    style={{
                      width: 52, height: 52, borderRadius: R.md,
                      overflow: "hidden", flexShrink: 0,
                      backgroundColor: isDone ? "transparent" : C.iconBg,
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isDone
                      ? <Image source={{ uri: photos[step.id] }} style={{ width: 52, height: 52 }} resizeMode="cover" />
                      : <Feather name="camera" size={I.xl} color={C.iconColor} />
                    }
                  </TouchableOpacity>

                  {/* Labels */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: 3 }}>
                      <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>
                        {step.label}
                      </Text>
                      {!step.required && (
                        <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 1, paddingHorizontal: 6 }}>
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
                    <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
                      <TouchableOpacity
                        onPress={() => openCamera(step.id)}
                        activeOpacity={0.7}
                        style={{ padding: S.xs }}
                      >
                        <Feather name="rotate-ccw" size={I.sm} color={C.textTertiary} />
                      </TouchableOpacity>
                      <View style={{
                        width: 24, height: 24, borderRadius: 12,
                        backgroundColor: GREEN,
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Feather name="check" size={I.xs} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => openCamera(step.id)}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: S.xs,
                        backgroundColor: C.primary,
                        borderRadius: R.pill,
                        paddingVertical: 6, paddingHorizontal: S.md,
                        flexShrink: 0,
                      }}
                    >
                      <Feather name="camera" size={I.xs} color={C.primaryForeground} />
                      <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.primaryForeground }}>
                        Fotografar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: C.background,
        borderTopWidth: 1, borderTopColor: C.border,
        paddingTop: S.md, paddingHorizontal: S.xl,
        paddingBottom: bottomPad + S.sm,
      }}>
        {!canFinish && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.sm }}>
            <Feather name="alert-circle" size={I.sm} color={C.textTertiary} />
            <Text style={{ fontSize: F.xs, color: C.textTertiary }}>
              {required.length - doneRequired} foto{required.length - doneRequired !== 1 ? "s" : ""} obrigatória{required.length - doneRequired !== 1 ? "s" : ""} restante{required.length - doneRequired !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
        <TouchableOpacity
          onPress={canFinish ? handleFinish : undefined}
          activeOpacity={canFinish ? 0.85 : 1}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: S.sm,
            backgroundColor: canFinish ? C.textPrimary : C.iconBg,
            borderRadius: R.xxl,
            paddingVertical: S.lg,
          }}
        >
          <Feather name="check-circle" size={I.lg} color={canFinish ? C.surface : C.textTertiary} />
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: canFinish ? C.surface : C.textTertiary }}>
            Finalizar vistoria
          </Text>
        </TouchableOpacity>
      </View>

      {/* CÂMERA */}
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
