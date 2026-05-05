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

// ─── CORNER BRACKETS ─────────────────────────────────────────────────────────

function CornerBrackets() {
  const S = 22;
  const T = 3;
  const C = 10;

  const corners = [
    { top: -T / 2, left:  -T / 2, borderTopWidth: T, borderLeftWidth:  T, borderTopLeftRadius:     C },
    { top: -T / 2, right: -T / 2, borderTopWidth: T, borderRightWidth: T, borderTopRightRadius:    C },
    { bottom: -T / 2, left:  -T / 2, borderBottomWidth: T, borderLeftWidth:  T, borderBottomLeftRadius:  C },
    { bottom: -T / 2, right: -T / 2, borderBottomWidth: T, borderRightWidth: T, borderBottomRightRadius: C },
  ] as const;

  return (
    <>
      {corners.map((style, i) => (
        <View
          key={i}
          style={[{
            position: "absolute", width: S, height: S,
            borderColor: WHITE,
          }, style]}
        />
      ))}
    </>
  );
}

// ─── CAMERA VIEW ─────────────────────────────────────────────────────────────

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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled && result.assets[0]) {
      onCapture(result.assets[0].uri);
    }
  }, [onCapture]);

  const topPad    = Platform.OS === "web" ? 48 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 16;

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.noPermContainer}>
        <View style={styles.noPermBox}>
          <View style={styles.noPermIcon}>
            <Feather name="camera-off" size={28} color="#6B7280" />
          </View>
          <Text style={styles.noPermTitle}>Câmera bloqueada</Text>
          <Text style={styles.noPermDesc}>Autorize o acesso à câmera para continuar.</Text>
          <TouchableOpacity onPress={requestPermission} activeOpacity={0.85} style={styles.noPermBtn}>
            <Text style={styles.noPermBtnText}>Permitir câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickFromGallery} activeOpacity={0.75} style={styles.noPermGallery}>
            <Text style={styles.noPermGalleryText}>Escolher da galeria</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>

      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
      />

      {/* Dark edge vignette */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={StyleSheet.absoluteFill}>
          {/* frame overlay — transparent hole in center */}
          <View style={styles.frameOverlay}>
            {/* top strip */}
            <View style={styles.frameShadowTop} />
            {/* middle row */}
            <View style={styles.frameMiddle}>
              <View style={styles.frameShadowSide} />
              {/* clear window */}
              <View style={styles.frameWindow}>
                <CornerBrackets />
              </View>
              <View style={styles.frameShadowSide} />
            </View>
            {/* bottom strip */}
            <View style={styles.frameShadowBottom} />
          </View>
        </View>
      </View>

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.circleBtn}>
          <Feather name="arrow-left" size={17} color={WHITE} />
        </TouchableOpacity>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{stepIndex + 1} de {totalSteps}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setTorch(t => !t)}
          activeOpacity={0.8}
          style={[styles.circleBtn, torch && styles.circleBtnActive]}
        >
          <Feather name={torch ? "zap" : "zap-off"} size={17} color={torch ? "#FFD700" : WHITE} />
        </TouchableOpacity>
      </View>

      {/* ── Instruction pill ── */}
      <View style={styles.instructionWrap} pointerEvents="none">
        <View style={styles.instructionBox}>
          <Text style={styles.instructionLabel}>{step.label}</Text>
          <Text style={styles.instructionText}>{step.instruction}</Text>
        </View>
      </View>

      {/* ── Bottom shutter bar ── */}
      <View style={[styles.shutterBar, { paddingBottom: bottomPad }]}>
        {/* Gallery */}
        <TouchableOpacity onPress={pickFromGallery} activeOpacity={0.75} style={styles.sideBtn}>
          <Feather name="image" size={17} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity
          onPress={shoot}
          activeOpacity={0.85}
          disabled={shooting}
          style={styles.shutter}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <View style={styles.sideBtnSpacer} />
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

      {/* Label */}
      <View style={styles.instructionWrap} pointerEvents="none">
        <View style={styles.instructionBox}>
          <Text style={styles.instructionLabel}>{step.label}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.previewActions, { paddingBottom: bottomPad }]}>
        <TouchableOpacity onPress={onRetake} activeOpacity={0.8} style={styles.previewBtnOutline}>
          <Feather name="rotate-ccw" size={15} color={WHITE} />
          <Text style={styles.previewBtnOutlineText}>Refazer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onConfirm} activeOpacity={0.85} style={styles.previewBtnSolid}>
          <Feather name="check" size={15} color={DARK} />
          <Text style={styles.previewBtnSolidText}>Usar foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── MAIN MODAL COMPONENT ─────────────────────────────────────────────────────

/**
 * Full-screen camera modal for a single inspection step.
 * Shows camera → preview → calls onCapture(uri) on confirm.
 */
export default function InspectionCamera({
  step, stepIndex, totalSteps, onCapture, onClose,
}: InspectionCameraProps) {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handlePhoto = useCallback((uri: string) => {
    setPreviewUri(uri);
  }, []);

  const handleConfirm = useCallback(() => {
    if (previewUri) {
      onCapture(previewUri);
      setPreviewUri(null);
    }
  }, [previewUri, onCapture]);

  const handleRetake = useCallback(() => {
    setPreviewUri(null);
  }, []);

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

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const FRAME_W  = SCREEN_W * 0.82;
const FRAME_H  = SCREEN_H * 0.54;
const FRAME_L  = (SCREEN_W - FRAME_W) / 2;
const FRAME_T  = (SCREEN_H - FRAME_H) / 2;
const OVERLAY  = "rgba(0,0,0,0.42)";

const styles = StyleSheet.create({
  // ── Frame overlay ──
  frameOverlay: {
    flex: 1, flexDirection: "column",
  },
  frameShadowTop: {
    width: "100%", height: FRAME_T, backgroundColor: OVERLAY,
  },
  frameMiddle: {
    flexDirection: "row", height: FRAME_H,
  },
  frameShadowSide: {
    width: FRAME_L, backgroundColor: OVERLAY,
  },
  frameWindow: {
    width: FRAME_W, height: FRAME_H,
    borderRadius: 12, overflow: "hidden",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.8)",
  },
  frameShadowBottom: {
    flex: 1, backgroundColor: OVERLAY,
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
  sideBtnSpacer: {
    width: 44,
  },
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
    flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", padding: 32,
  },
  noPermBox: {
    alignItems: "center", gap: 12,
  },
  noPermIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#1F2937",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  noPermTitle: {
    fontSize: 18, fontWeight: "700" as const, color: WHITE,
  },
  noPermDesc: {
    fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 19,
  },
  noPermBtn: {
    marginTop: 8, backgroundColor: WHITE, borderRadius: 20,
    paddingVertical: 14, paddingHorizontal: 28,
  },
  noPermBtnText: {
    fontSize: 14, fontWeight: "700" as const, color: DARK,
  },
  noPermGallery: {
    paddingVertical: 10, paddingHorizontal: 20,
  },
  noPermGalleryText: {
    fontSize: 13, color: "rgba(255,255,255,0.55)",
  },
});
