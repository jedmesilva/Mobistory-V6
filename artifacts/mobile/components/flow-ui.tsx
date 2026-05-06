import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  Platform, ActivityIndicator, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import CaptureCamera from "@/components/CaptureCamera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { R, S, F, I } from "@/components/shared";

export const C = colors.light;
export type FeatherName = React.ComponentProps<typeof Feather>["name"];

export const AI_ACCENT        = "#6366F1";
export const AI_ACCENT_BG     = "#EEF2FF";
export const AI_ACCENT_BORDER = "#C7D2FE";
export const GREEN            = "#16A34A";
export const GREEN_BG         = "#F0FDF4";
export const GREEN_BORDER     = "#BBF7D0";
export const GREEN_TEXT       = "#15803D";
export const ERROR_BG         = "#FEF2F2";
export const ERROR_BORDER     = "#FECACA";
export const ERROR_TEXT       = "#B91C1C";

export const API_BASE =
  Platform.OS === "web" && typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "http://localhost:80/api";

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────

export function PageHeader({
  title, onBack, right,
}: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <View style={{ marginBottom: S.sm }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.lg }}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ padding: S.xs }}>
          <Feather name="arrow-left" size={I.lg} color="#374151" />
        </TouchableOpacity>
        {right ?? <View style={{ width: I.lg }} />}
      </View>
      <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, lineHeight: F.hero * 1.1 }}>
        {title}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label, onPress, disabled = false,
}: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={{
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: S.sm, backgroundColor: disabled ? C.iconBg : C.primary,
        borderRadius: R.xxl, paddingVertical: S.lg,
      }}
    >
      <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: disabled ? C.textTertiary : C.primaryForeground }}>
        {label}
      </Text>
      {!disabled && <Feather name="chevron-right" size={I.lg} color={C.primaryForeground} />}
    </TouchableOpacity>
  );
}

export function Footer({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border,
      paddingTop: S.md, paddingHorizontal: S.xl,
      paddingBottom: (Platform.OS === "web" ? 24 : insets.bottom) + S.sm,
    }}>
      {children}
    </View>
  );
}

export function AiError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "flex-start", gap: S.sm,
      backgroundColor: ERROR_BG, borderWidth: 1, borderColor: ERROR_BORDER,
      borderRadius: R.xl, padding: S.md, marginBottom: S.lg,
    }}>
      <Text style={{ flex: 1, fontSize: F.sm, color: ERROR_TEXT, lineHeight: F.sm * 1.4 }}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} style={{ padding: 2 }}>
        <Feather name="x" size={I.sm} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}

export function ListRow({
  label, selected, onSelect, isLast = false, iconName,
}: { label: string; selected?: string | null; onSelect: (v: string) => void; isLast?: boolean; iconName?: FeatherName }) {
  const isSel = selected === label;
  return (
    <TouchableOpacity
      onPress={() => onSelect(label)}
      activeOpacity={0.7}
      style={{
        flexDirection: "row", alignItems: "center", gap: S.md,
        paddingVertical: S.md,
        borderBottomWidth: isLast ? 0 : 1, borderBottomColor: C.border,
      }}
    >
      {iconName && (
        <View style={{
          width: 40, height: 40, borderRadius: R.md,
          backgroundColor: isSel ? C.primary : C.iconBg,
          alignItems: "center", justifyContent: "center",
        }}>
          <Feather name={iconName} size={I.lg} color={isSel ? C.primaryForeground : C.iconColor} />
        </View>
      )}
      <Text style={{ flex: 1, fontSize: F.base, fontWeight: isSel ? "700" : "600" as const, color: C.textPrimary }}>
        {label}
      </Text>
      {isSel && <Feather name="check" size={I.lg} color={C.primary} />}
    </TouchableOpacity>
  );
}

export function ChipList({ items, selected, onSelect }: { items: string[]; selected: string | null; onSelect: (v: string) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: S.sm }}>
      {items.map(item => {
        const isSel = selected === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
            style={{
              paddingVertical: S.sm, paddingHorizontal: S.lg,
              borderRadius: R.pill,
              borderWidth: 1.5,
              borderColor: isSel ? C.primary : C.border,
              backgroundColor: isSel ? C.primary : C.surface,
            }}
          >
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: isSel ? C.primaryForeground : C.textSecondary }}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const MANUAL_STEPS = ["manual_brand", "manual_model", "manual_version", "manual_year", "manual_plate", "manual_color", "manual_fuel"];

export function ProgressDots({ current }: { current: number }) {
  return (
    <View style={{ flexDirection: "row", gap: S.xs, paddingHorizontal: S.xl, paddingTop: S.lg, justifyContent: "center" }}>
      {MANUAL_STEPS.map((_, i) => (
        <View
          key={i}
          style={{ height: 3, flex: 1, borderRadius: R.pill, backgroundColor: i <= current ? C.primary : C.border }}
        />
      ))}
    </View>
  );
}

export function ManualStepWrapper({
  stepIndex, title, onBack, captureBtn, children, footer,
}: {
  stepIndex: number;
  title: string;
  onBack: () => void;
  captureBtn?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1 }}>
      <ProgressDots current={stepIndex} />
      <ScrollView
        contentContainerStyle={{ padding: S.xl, paddingTop: S.lg, paddingBottom: S.xxxl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader title={title} onBack={onBack} right={captureBtn} />
        {children}
      </ScrollView>
      {footer && <Footer>{footer}</Footer>}
    </View>
  );
}

// ─── AI CAPTURE HOOK ──────────────────────────────────────────────────────────

export function useAiCapture(onExtracted: (data: Record<string, string>) => void) {
  const [processing, setProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const processImage = useCallback(async (base64: string, mediaType: string, field: string) => {
    setProcessing(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_BASE}/vehicle/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType, field }),
      });
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      onExtracted(json.data ?? {});
    } catch {
      setAiError("Não consegui extrair o dado. Preencha manualmente.");
    } finally {
      setProcessing(false);
    }
  }, [onExtracted]);

  return { processing, aiError, setAiError, processImage };
}

export async function pickAndCapture(
  useCamera: boolean,
): Promise<{ base64: string; mediaType: string } | null> {
  const perm = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!perm.granted) {
    Alert.alert("Permissão necessária", useCamera ? "Acesse as configurações e habilite a câmera." : "Acesse as configurações e habilite o acesso às fotos.");
    return null;
  }

  const result = useCamera
    ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.8 });

  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return { base64: asset.base64 ?? "", mediaType: asset.mimeType ?? "image/jpeg" };
}

// ─── CAPTURE BUTTON ───────────────────────────────────────────────────────────

export function CaptureBtn({
  field, processing, onCapture,
}: { field: string; processing: boolean; onCapture: (base64: string, mediaType: string, field: string) => void }) {
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleCapture = useCallback((uri: string, base64?: string) => {
    setCameraOpen(false);
    if (base64) onCapture(base64, "image/jpeg", field);
  }, [field, onCapture]);

  return (
    <>
      <TouchableOpacity
        onPress={() => setCameraOpen(true)}
        disabled={processing}
        activeOpacity={0.75}
        style={{
          flexDirection: "row", alignItems: "center", gap: S.xs,
          backgroundColor: AI_ACCENT_BG,
          borderWidth: 1.5, borderColor: AI_ACCENT_BORDER,
          borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: S.md,
        }}
      >
        {processing
          ? <ActivityIndicator size="small" color={AI_ACCENT} />
          : <Feather name="camera" size={I.sm} color={AI_ACCENT} />}
        <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: AI_ACCENT }}>
          {processing ? "Analisando…" : "Capturar"}
        </Text>
      </TouchableOpacity>

      {cameraOpen && (
        <CaptureCamera
          title="Capturar veículo"
          hint="Fotografe o veículo para extrair os dados automaticamente"
          withBase64
          onCapture={handleCapture}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </>
  );
}
