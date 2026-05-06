import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { R, S, F, I } from "@/components/shared";
import { INSPECTION_STEPS } from "@/constants/data";
import { useInspections } from "@/contexts/InspectionsContext";
import InspectionCamera from "@/components/InspectionCamera";
import {
  C, GREEN, GREEN_BG, GREEN_BORDER,
  PageHeader, PrimaryButton, Footer,
} from "@/components/flow-ui";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Screen = "inspection" | "pending";

// ─── SCREEN: INSPECTION ───────────────────────────────────────────────────────

function ScreenInspection({
  bondType, onBack, onFinish,
}: {
  bondType: string;
  onBack: () => void;
  onFinish: () => void;
}) {
  const { addInspection, completeStep, finishInspection } = useInspections();
  const inspectionIdRef = useRef<number | null>(null);

  const [photos, setPhotos]             = useState<Record<string, string>>({});
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  useEffect(() => {
    const motivo = (bondType === "Proprietário" || bondType === "Co-proprietário")
      ? "Transferência"
      : "Rotina";
    const id = addInspection(
      INSPECTION_STEPS.map(s => s.id),
      motivo,
      "Vistoria iniciada durante o cadastro de vínculo.",
    );
    inspectionIdRef.current = id;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const required     = INSPECTION_STEPS.filter(s => s.required);
  const doneRequired = required.filter(s => photos[s.id]).length;
  const canFinish    = doneRequired === required.length;

  const activeStep      = INSPECTION_STEPS.find(s => s.id === activeStepId) ?? null;
  const activeStepIndex = activeStep ? INSPECTION_STEPS.indexOf(activeStep) : 0;

  const openCamera  = useCallback((id: string) => setActiveStepId(id), []);
  const closeCamera = useCallback(() => setActiveStepId(null), []);

  const handleCapture = useCallback((uri: string) => {
    if (!activeStepId) return;
    setPhotos(prev => ({ ...prev, [activeStepId]: uri }));
    if (inspectionIdRef.current !== null) {
      completeStep(inspectionIdRef.current, activeStepId);
    }
    setActiveStepId(null);
  }, [activeStepId, completeStep]);

  const handleFinish = useCallback(() => {
    if (inspectionIdRef.current !== null) {
      finishInspection(inspectionIdRef.current);
    }
    onFinish();
  }, [finishInspection, onFinish]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: S.xl, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <PageHeader title="Vistoria" onBack={onBack} />
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
          Fotografe o veículo seguindo as etapas abaixo.
        </Text>

        {/* Progress bar */}
        <View style={{ marginBottom: S.xxl }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S.sm }}>
            <Text style={{ fontSize: F.sm, color: C.textSecondary }}>{doneRequired} de {required.length} fotos obrigatórias</Text>
            <Text style={{ fontSize: F.sm, fontWeight: "700" as const, color: C.textPrimary }}>{Math.round((doneRequired / required.length) * 100)}%</Text>
          </View>
          <View style={{ height: 4, backgroundColor: C.border, borderRadius: R.pill, overflow: "hidden" }}>
            <View style={{ height: "100%", width: `${(doneRequired / required.length) * 100}%` as any, backgroundColor: C.primary, borderRadius: R.pill }} />
          </View>
        </View>

        {/* Step list */}
        <View style={{ gap: S.sm }}>
          {INSPECTION_STEPS.map(step => {
            const isDone = !!photos[step.id];
            return (
              <View
                key={step.id}
                style={{ backgroundColor: C.surface, borderRadius: R.xl, overflow: "hidden", borderWidth: 1.5, borderColor: isDone ? GREEN_BORDER : "transparent" }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, padding: S.lg }}>
                  <TouchableOpacity
                    onPress={() => openCamera(step.id)}
                    activeOpacity={0.8}
                    style={{ width: 52, height: 52, borderRadius: R.md, overflow: "hidden", flexShrink: 0, backgroundColor: isDone ? "transparent" : C.iconBg, alignItems: "center", justifyContent: "center" }}
                  >
                    {isDone
                      ? <Image source={{ uri: photos[step.id] }} style={{ width: 52, height: 52 }} resizeMode="cover" />
                      : <Feather name="camera" size={I.xl} color={C.iconColor} />}
                  </TouchableOpacity>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: 3 }}>
                      <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>{step.label}</Text>
                      {!step.required && (
                        <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 1, paddingHorizontal: 6 }}>
                          <Text style={{ fontSize: F.xxs, fontWeight: "600" as const, color: C.textTertiary }}>OPCIONAL</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: F.sm * 1.4 }}>{step.instruction}</Text>
                  </View>

                  {isDone ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
                      <TouchableOpacity onPress={() => openCamera(step.id)} activeOpacity={0.7} style={{ padding: S.xs }}>
                        <Feather name="rotate-ccw" size={I.sm} color={C.textTertiary} />
                      </TouchableOpacity>
                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" }}>
                        <Feather name="check" size={I.xs} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => openCamera(step.id)}
                      activeOpacity={0.8}
                      style={{ flexDirection: "row", alignItems: "center", gap: S.xs, backgroundColor: C.primary, borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: S.md, flexShrink: 0 }}
                    >
                      <Feather name="camera" size={I.xs} color={C.primaryForeground} />
                      <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.primaryForeground }}>Fotografar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Footer>
        {!canFinish && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.sm }}>
            <Feather name="alert-circle" size={I.sm} color={C.textTertiary} />
            <Text style={{ fontSize: F.xs, color: C.textTertiary }}>
              {required.length - doneRequired} foto{required.length - doneRequired !== 1 ? "s" : ""} obrigatória{required.length - doneRequired !== 1 ? "s" : ""} restante{required.length - doneRequired !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
        <PrimaryButton
          label="Finalizar vistoria"
          onPress={handleFinish}
          disabled={!canFinish}
        />
      </Footer>

      {activeStep && (
        <InspectionCamera
          step={activeStep}
          stepIndex={activeStepIndex}
          totalSteps={INSPECTION_STEPS.length}
          onCapture={handleCapture}
          onClose={closeCamera}
        />
      )}
    </View>
  );
}

// ─── SCREEN: PENDING ──────────────────────────────────────────────────────────

function ScreenPending({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: S.xl, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + S.xl }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: GREEN_BG, borderWidth: 1.5, borderColor: GREEN_BORDER, alignItems: "center", justifyContent: "center", marginBottom: S.xl }}>
        <Feather name="check" size={32} color={GREEN} />
      </View>
      <Text style={{ fontSize: F.xxxl, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.sm, textAlign: "center" }}>
        Solicitação enviada!
      </Text>
      <Text style={{ fontSize: F.base, color: C.textSecondary, lineHeight: F.base * 1.6, marginBottom: S.xxxl, maxWidth: 300, textAlign: "center" }}>
        Seus documentos estão em análise. Você será notificado assim que o vínculo for confirmado.
      </Text>
      <TouchableOpacity
        onPress={onClose}
        activeOpacity={0.85}
        style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.primary, borderRadius: R.xxl, paddingVertical: S.lg }}
      >
        <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.primaryForeground }}>Concluir</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ROOT FLOW COMPONENT ──────────────────────────────────────────────────────

export default function AddInspectionFlow() {
  const router = useRouter();
  const { bondType } = useLocalSearchParams<{ bondType?: string }>();
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState<Screen>("inspection");

  const handleClose = useCallback(() => {
    // Replace current screen and pop back to main tabs, clearing the add flow stack
    router.replace("/(tabs)");
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: C.background, paddingTop: screen === "pending" ? 0 : (typeof insets.top === "number" ? insets.top : 0) }}>
      {screen === "inspection" && (
        <ScreenInspection
          bondType={bondType ?? ""}
          onBack={() => router.back()}
          onFinish={() => setScreen("pending")}
        />
      )}
      {screen === "pending" && (
        <ScreenPending onClose={handleClose} />
      )}
    </View>
  );
}
