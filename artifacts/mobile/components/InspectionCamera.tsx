import React, { useRef, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Modal, Platform, Image,
  StyleSheet, Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface InspectionStep {
  id: string;
  label: string;
  instruction: string;
  required: boolean;
}

interface InspectionCameraProps {
  step: InspectionStep;
  stepIndex: number;
  totalSteps: number;
  onCapture: (uri: string) => void;
  onClose: () => void;
}

// ─── COLORS ───────────────────────────────────────────────────────────────────

const DARK      = "#111827";
const WHITE     = "#FFFFFF";
const WHITE_DIM = "rgba(255,255,255,0.75)";
const OVERLAY   = "rgba(0,0,0,0.42)";

// ─── ASPECT RATIOS PER STEP ──────────────────────────────────────────────────
//
// width / height ratio for each inspection step.
// Examples:
//   placa      → very wide strip  (4 / 1)
//   lateral    → panoramic        (8 / 3)
//   painel     → landscape widescreen (16 / 9)
//   frente/traseira → standard landscape (4 / 3)
//   chassi     → near-square      (3 / 2)

const STEP_RATIOS: Record<string, number> = {
  frente:    4 / 3,
  traseira:  4 / 3,
  lateral_e: 8 / 3,
  lateral_d: 8 / 3,
  painel:    16 / 9,
  placa:     4 / 1,
  chassi:    3 / 2,
};

const { width: SW, height: SH } = Dimensions.get("window");

// Maximum frame bounds (leaves breathing room on all sides)
const MAX_W = SW * 0.84;
const MAX_H = SH * 0.50;

function getFrameDims(stepId: string): { w: number; h: number; l: number; t: number } {
  const ratio = STEP_RATIOS[stepId] ?? 4 / 3;

  let w = MAX_W;
  let h = w / ratio;

  if (h > MAX_H) {
    h = MAX_H;
    w = h * ratio;
  }

  // Center horizontally; shift upward slightly so the shutter bar doesn't crowd the frame
  const l = (SW - w) / 2;
  const t = (SH - h) / 2 - SH * 0.04;

  return { w, h, l, t };
}

// ─── FLOATING CORNER BRACKETS ─────────────────────────────────────────────────
//
// Four L-shaped brackets positioned absolutely over the full screen.
// No border box → no corner-radius mismatch with the overlay.

interface BracketsProps {
  stepId: string;
}

function FloatingBrackets({ stepId }: BracketsProps) {
  const { w, h, l, t } = getFrameDims(stepId);

  const ARM  = 24;   // length of each bracket arm
  const THICK = 3;   // line thickness
  const R    = 8;    // corner radius on the bracket itself
  const r    = l;    // right-edge distance from screen right = l (symmetric)

  const bTop    = t;
  const bBottom = SH - (t + h);
  const bLeft   = l;
  const bRight  = r;

  return (
    <>
      {/* ── Top-left ── */}
      <View style={[s.bracket, {
        top: bTop, left: bLeft,
        borderTopWidth: THICK, borderLeftWidth: THICK,
        borderTopLeftRadius: R,
        width: ARM, height: ARM,
      }]} />
      {/* ── Top-right ── */}
      <View style={[s.bracket, {
        top: bTop, right: bRight,
        borderTopWidth: THICK, borderRightWidth: THICK,
        borderTopRightRadius: R,
        width: ARM, height: ARM,
      }]} />
      {/* ── Bottom-left ── */}
      <View style={[s.bracket, {
        bottom: bBottom, left: bLeft,
        borderBottomWidth: THICK, borderLeftWidth: THICK,
        borderBottomLeftRadius: R,
        width: ARM, height: ARM,
      }]} />
      {/* ── Bottom-right ── */}
      <View style={[s.bracket, {
        bottom: bBottom, right: bRight,
        borderBottomWidth: THICK, borderRightWidth: THICK,
        borderBottomRightRadius: R,
        width: ARM, height: ARM,
      }]} />
    </>
  );
}

// ─── CAMERA CAPTURE ───────────────────────────────────────────────────────────

function CameraCapture({
  step, stepIndex, totalSteps, onCapture, onClose,
}: InspectionCameraProps) {
  const cameraRef = useRef<CameraView>(null);
  const [torch, setTorch]       = useState(false);
  const [shooting, setShooting] = useState(false);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  const shoot = useCallback(async () => {
    if (shooting || !cameraRef.current) return;
    setShooting(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) onCapture(photo.uri);
    } finally {
      setShooting(false);
    }
  }, [shooting, onCapture]);

  const pickFromGallery = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) onCapture(result.assets[0].uri);
  }, [onCapture]);

  const topPad    = Platform.OS === "web" ? 48 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 16;

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={s.noPermContainer}>
        <View style={s.noPermBox}>
          <View style={s.noPermIcon}>
            <Feather name="camera-off" size={28} color="#6B7280" />
          </View>
          <Text style={s.noPermTitle}>Câmera bloqueada</Text>
          <Text style={s.noPermDesc}>Autorize o acesso à câmera para continuar.</Text>
          <TouchableOpacity onPress={requestPermission} activeOpacity={0.85} style={s.noPermBtn}>
            <Text style={s.noPermBtnText}>Permitir câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickFromGallery} activeOpacity={0.75} style={s.noPermGallery}>
            <Text style={s.noPermGalleryText}>Escolher da galeria</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>

      {/* Camera feed */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
      />

      {/* Single dark overlay + floating corner brackets (no border box!) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: OVERLAY }]} />
        <FloatingBrackets stepId={step.id} />
      </View>

      {/* ── Top bar ── */}
      <View style={[s.topBar, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={s.circleBtn}>
          <Feather name="arrow-left" size={17} color={WHITE} />
        </TouchableOpacity>

        <View style={s.stepBadge}>
          <Text style={s.stepBadgeText}>{stepIndex + 1} de {totalSteps}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setTorch(t => !t)}
          activeOpacity={0.8}
          style={[s.circleBtn, torch && s.circleBtnActive]}
        >
          <Feather name={torch ? "zap" : "zap-off"} size={17} color={torch ? "#FFD700" : WHITE} />
        </TouchableOpacity>
      </View>

      {/* ── Instruction pill ── */}
      <View style={s.instructionWrap} pointerEvents="none">
        <View style={s.instructionBox}>
          <Text style={s.instructionLabel}>{step.label}</Text>
          <Text style={s.instructionText}>{step.instruction}</Text>
        </View>
      </View>

      {/* ── Bottom shutter bar ── */}
      <View style={[s.shutterBar, { paddingBottom: bottomPad }]}>
        <TouchableOpacity onPress={pickFromGallery} activeOpacity={0.75} style={s.sideBtn}>
          <Feather name="image" size={17} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={shoot}
          activeOpacity={0.85}
          disabled={shooting}
          style={s.shutter}
        >
          <View style={s.shutterInner} />
        </TouchableOpacity>

        <View style={s.sideBtnSpacer} />
      </View>
    </View>
  );
}

// ─── PREVIEW VIEW ─────────────────────────────────────────────────────────────

function PhotoPreview({
  step, uri, onConfirm, onRetake,
}: { step: InspectionStep; uri: string; onConfirm: () => void; onRetake: () => void }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 16;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <View style={s.instructionWrap} pointerEvents="none">
        <View style={s.instructionBox}>
          <Text style={s.instructionLabel}>{step.label}</Text>
        </View>
      </View>

      <View style={[s.previewActions, { paddingBottom: bottomPad }]}>
        <TouchableOpacity onPress={onRetake} activeOpacity={0.8} style={s.previewBtnOutline}>
          <Feather name="rotate-ccw" size={15} color={WHITE} />
          <Text style={s.previewBtnOutlineText}>Refazer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onConfirm} activeOpacity={0.85} style={s.previewBtnSolid}>
          <Feather name="check" size={15} color={DARK} />
          <Text style={s.previewBtnSolidText}>Usar foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

export default function InspectionCamera({
  step, stepIndex, totalSteps, onCapture, onClose,
}: InspectionCameraProps) {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handlePhoto   = useCallback((uri: string) => setPreviewUri(uri), []);
  const handleConfirm = useCallback(() => {
    if (previewUri) { onCapture(previewUri); setPreviewUri(null); }
  }, [previewUri, onCapture]);
  const handleRetake  = useCallback(() => setPreviewUri(null), []);

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {previewUri ? (
          <PhotoPreview
            step={step}
            uri={previewUri}
            onConfirm={handleConfirm}
            onRetake={handleRetake}
          />
        ) : (
          <CameraCapture
            step={step}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            onCapture={handlePhoto}
            onClose={onClose}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({

  // ── Bracket ──
  bracket: {
    position: "absolute",
    borderColor: WHITE,
  },

  // ── Top bar ──
  topBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  circleBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  circleBtnActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  stepBadge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 99, paddingVertical: 4, paddingHorizontal: 12,
  },
  stepBadgeText: {
    fontSize: 12, fontWeight: "600" as const, color: WHITE,
  },

  // ── Instruction ──
  instructionWrap: {
    position: "absolute", bottom: 100, left: 20, right: 20,
  },
  instructionBox: {
    backgroundColor: "rgba(0,0,0,0.60)",
    borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12,
    alignItems: "center",
  },
  instructionLabel: {
    fontSize: 12, fontWeight: "700" as const, color: WHITE, marginBottom: 2,
  },
  instructionText: {
    fontSize: 11, color: WHITE_DIM, lineHeight: 15, textAlign: "center",
  },

  // ── Shutter bar ──
  shutterBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 48, paddingTop: 20, backgroundColor: "#000",
  },
  sideBtn: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  sideBtnSpacer: { width: 44 },
  shutter: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: WHITE,
    alignItems: "center", justifyContent: "center",
  },
  shutterInner: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: WHITE,
  },

  // ── Preview actions ──
  previewActions: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", gap: 12,
    paddingTop: 20, paddingHorizontal: 20, backgroundColor: "#000",
  },
  previewBtnOutline: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20,
    paddingVertical: 16,
  },
  previewBtnOutlineText: {
    fontSize: 14, fontWeight: "700" as const, color: WHITE,
  },
  previewBtnSolid: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: WHITE, borderRadius: 20, paddingVertical: 16,
  },
  previewBtnSolidText: {
    fontSize: 14, fontWeight: "700" as const, color: DARK,
  },

  // ── No permission ──
  noPermContainer: {
    flex: 1, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center", padding: 32,
  },
  noPermBox: { alignItems: "center", gap: 12 },
  noPermIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#1F2937",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  noPermTitle: { fontSize: 18, fontWeight: "700" as const, color: WHITE },
  noPermDesc: {
    fontSize: 13, color: "rgba(255,255,255,0.6)",
    textAlign: "center", lineHeight: 19,
  },
  noPermBtn: {
    marginTop: 8, backgroundColor: WHITE,
    borderRadius: 20, paddingVertical: 14, paddingHorizontal: 28,
  },
  noPermBtnText: { fontSize: 14, fontWeight: "700" as const, color: DARK },
  noPermGallery: { paddingVertical: 10, paddingHorizontal: 20 },
  noPermGalleryText: { fontSize: 13, color: "rgba(255,255,255,0.55)" },
});
