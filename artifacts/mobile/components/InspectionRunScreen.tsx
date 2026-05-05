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

const TYPE_CONFIG: Record<string, { bg: string; text: string; icon: React.ComponentProps<typeof Feather>["name"] }> = {
  "Rotina":               { bg: "#F3F4F6", text: "#6B7280", icon: "refresh-cw" },
  "Transferência":        { bg: "#EFF6FF", text: "#2563EB", icon: "repeat" },
  "Abertura de sinistro": { bg: "#FFF7ED", text: "#C2410C", icon: "alert-triangle" },
  "Manutenção":           { bg: "#F0FDF4", text: "#16A34A", icon: "tool" },
  "Acidente":             { bg: "#FEF2F2", text: "#DC2626", icon: "alert-octagon" },
  "Auditoria":            { bg: "#FDF4FF", text: "#9333EA", icon: "shield" },
};

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
  const totalPhotos  = Object.keys(photos).length;
  const canFinish    = doneRequired === required.length && totalPhotos > 0;

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

  const progress = required.length > 0 ? doneRequired / required.length : 0;
  const typeCfg  = TYPE_CONFIG[inspection.type] ?? { bg: C.iconBg, text: C.iconColor, icon: "file-text" as const };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + S.sm, paddingBottom: bottomPad + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header nav ── */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: S.xl, marginBottom: S.xl }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{ paddingVertical: S.sm, paddingRight: S.md, paddingLeft: 0, marginLeft: -S.xs }}
          >
            <Feather name="arrow-left" size={I.xl} color={C.textSecondary} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: F.lg, fontWeight: "700" as const, color: C.textPrimary }}>
            Em andamento
          </Text>
        </View>

        {/* ── Hero card ── */}
        <View style={{ marginHorizontal: S.xl, backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md }}>

          {/* Badges: tipo + status */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.lg }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: typeCfg.bg, borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: S.md }}>
              <Feather name={typeCfg.icon} size={11} color={typeCfg.text} />
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: typeCfg.text }}>{inspection.type}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FEF9C3", borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: S.md }}>
              <Feather name="clock" size={11} color="#CA8A04" />
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: "#CA8A04" }}>Pendente</Text>
            </View>
          </View>

          {/* Data */}
          <Text style={{ fontSize: 28, fontWeight: "800" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: 4 }}>
            {inspection.requestedAt}
          </Text>
          <Text style={{ fontSize: F.sm, color: C.textTertiary, marginBottom: inspection.km && inspection.km !== "—" ? S.xs : 0 }}>
            Solicitado por {inspection.requester}
          </Text>
          {inspection.km && inspection.km !== "—" ? (
            <Text style={{ fontSize: F.sm, color: C.textTertiary }}>{inspection.km}</Text>
          ) : null}

          {/* Prazo */}
          {inspection.deadline ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: S.sm }}>
              <Feather name="alert-circle" size={I.sm} color="#C2410C" />
              <Text style={{ fontSize: F.sm, fontWeight: "500" as const, color: "#C2410C" }}>{inspection.deadline}</Text>
            </View>
          ) : null}

          {/* Descrição / motivo */}
          {inspection.descricao ? (
            <View style={{ marginTop: S.lg, paddingTop: S.lg, borderTopWidth: 1, borderTopColor: C.border }}>
              <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.textTertiary, letterSpacing: 1.2, textTransform: "uppercase" as const, marginBottom: S.xs }}>
                Motivo
              </Text>
              <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: 20 }}>
                {inspection.descricao}
              </Text>
            </View>
          ) : null}

          {/* Barra de progresso */}
          <View style={{ marginTop: S.lg }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: S.xs }}>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const }}>
                {doneRequired} de {required.length} fotos obrigatórias
              </Text>
              <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: progress === 1 ? "#16A34A" : C.textPrimary }}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={{ height: 4, backgroundColor: C.border, borderRadius: R.pill, overflow: "hidden" }}>
              <View style={{
                height: 4,
                width: `${progress * 100}%` as any,
                backgroundColor: progress === 1 ? "#16A34A" : "#CA8A04",
                borderRadius: R.pill,
              }} />
            </View>
          </View>
        </View>

        {/* ── Lista de etapas ── */}
        <View style={{ paddingHorizontal: S.xl }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
            <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.textTertiary, letterSpacing: 1.2, textTransform: "uppercase" as const }}>
              Partes do veículo · {totalPhotos}/{steps.length}
            </Text>
            {doneRequired > 0 && (
              <Text style={{ fontSize: F.xs, color: "#16A34A", fontWeight: "600" as const }}>
                {doneRequired} registradas
              </Text>
            )}
          </View>

          <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden" }}>
            {steps.map((step, idx) => {
              const isDone = !!photos[step.id];
              const isLast = idx === steps.length - 1;

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
                    backgroundColor: isDone ? "#F0FDF4" : C.surface,
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
                      backgroundColor: isDone ? "transparent" : C.background,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isDone ? (
                      <Image source={{ uri: photos[step.id] }} style={{ width: 52, height: 52 }} resizeMode="cover" />
                    ) : (
                      <Feather name="camera" size={I.xl} color={C.textTertiary} />
                    )}
                  </TouchableOpacity>

                  {/* Label + instrução */}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: 3 }}>
                      <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: isDone ? "#16A34A" : C.textPrimary }}>
                        {step.label}
                      </Text>
                      {!step.required && (
                        <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 1, paddingHorizontal: S.xs }}>
                          <Text style={{ fontSize: F.xxs, fontWeight: "600" as const, color: C.textTertiary }}>Opcional</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: F.xs, color: isDone ? "#16A34A" : C.textTertiary, lineHeight: F.xs * 1.5 }}>
                      {isDone ? "Foto registrada" : step.instruction}
                    </Text>
                  </View>

                  {/* Ação / status */}
                  {isDone ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, flexShrink: 0 }}>
                      <TouchableOpacity
                        onPress={() => openCamera(step.id)}
                        activeOpacity={0.7}
                        style={{
                          width: 30, height: 30, borderRadius: 15,
                          backgroundColor: C.surface,
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Feather name="rotate-ccw" size={I.sm} color={C.textTertiary} />
                      </TouchableOpacity>
                      <View style={{
                        width: 28, height: 28, borderRadius: 14,
                        backgroundColor: "#16A34A",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Feather name="check" size={I.sm} color="#fff" />
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
                      <Feather name="camera" size={I.xs} color={C.surface} />
                      <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.surface }}>
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

      {/* ── Footer fixo ── */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: C.background,
        borderTopWidth: 1, borderTopColor: C.border,
        paddingHorizontal: S.xl,
        paddingBottom: bottomPad + S.lg,
        paddingTop: S.lg,
      }}>
        {!canFinish && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: S.sm }}>
            <Feather name="clock" size={I.sm} color={C.textTertiary} />
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
            backgroundColor: canFinish ? "#16A34A" : C.iconBg,
            borderRadius: R.xxl,
            paddingVertical: S.lg,
          }}
        >
          <Feather name="check-circle" size={I.lg} color={canFinish ? "#fff" : C.textTertiary} />
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: canFinish ? "#fff" : C.textTertiary }}>
            {canFinish ? "Finalizar vistoria" : `Aguardando fotos · ${doneRequired}/${required.length}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Câmera ── */}
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
