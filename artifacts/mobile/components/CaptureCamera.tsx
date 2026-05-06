import React, { useRef, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Modal, Platform, Image, StyleSheet, Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface CaptureCameraProps {
  title: string;
  hint?: string;
  withBase64?: boolean;
  onCapture: (uri: string, base64?: string) => void;
  onClose: () => void;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const DARK      = "#111827";
const WHITE     = "#FFFFFF";
const WHITE_DIM = "rgba(255,255,255,0.75)";

// Standard 4:3 viewfinder frame
const { width: SW, height: SH } = Dimensions.get("window");
const FRAME_W = SW * 0.84;
const FRAME_H = FRAME_W / (4 / 3);
const FRAME_L = (SW - FRAME_W) / 2;
const FRAME_T = (SH - FRAME_H) / 2 - SH * 0.04;

// ─── CORNER BRACKETS ──────────────────────────────────────────────────────────

function Brackets() {
  const ARM   = 24;
  const THICK = 3;
  const R     = 8;
  const bBottom = SH - (FRAME_T + FRAME_H);

  return (
    <>
      <View style={[s.bracket, { top: FRAME_T,     left:  FRAME_L,  borderTopWidth: THICK,    borderLeftWidth: THICK,  borderTopLeftRadius:     R, width: ARM, height: ARM }]} />
      <View style={[s.bracket, { top: FRAME_T,     right: FRAME_L,  borderTopWidth: THICK,    borderRightWidth: THICK, borderTopRightRadius:    R, width: ARM, height: ARM }]} />
      <View style={[s.bracket, { bottom: bBottom,  left:  FRAME_L,  borderBottomWidth: THICK, borderLeftWidth: THICK,  borderBottomLeftRadius:  R, width: ARM, height: ARM }]} />
      <View style={[s.bracket, { bottom: bBottom,  right: FRAME_L,  borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: R, width: ARM, height: ARM }]} />
    </>
  );
}

// ─── CAMERA VIEW ──────────────────────────────────────────────────────────────

function CameraCapture({ title, hint, withBase64, onCapture, onClose }: CaptureCameraProps) {
  const cameraRef = useRef<CameraView>(null);
  const [torch,    setTorch]    = useState(false);
  const [shooting, setShooting] = useState(false);
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  const topPad    = Platform.OS === "web" ? 48 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 16;

  const shoot = useCallback(async () => {
    if (shooting || !cameraRef.current) return;
    setShooting(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        ...(withBase64 ? { base64: true } : {}),
      });
      if (photo?.uri) onCapture(photo.uri, photo.base64 ?? undefined);
    } finally {
      setShooting(false);
    }
  }, [shooting, withBase64, onCapture]);

  const pickFromGallery = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      ...(withBase64 ? { base64: true } : {}),
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onCapture(asset.uri, asset.base64 ?? undefined);
    }
  }, [withBase64, onCapture]);

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
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.42)" }]} />
        <Brackets />
      </View>

      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: topPad }]}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={s.circleBtn}>
          <Feather name="arrow-left" size={17} color={WHITE} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTorch(t => !t)}
          activeOpacity={0.8}
          style={[s.circleBtn, torch && s.circleBtnActive]}
        >
          <Feather name={torch ? "zap" : "zap-off"} size={17} color={torch ? "#FFD700" : WHITE} />
        </TouchableOpacity>
      </View>

      {/* Instruction pill */}
      {(title || hint) && (
        <View style={s.instructionWrap} pointerEvents="none">
          <View style={s.instructionBox}>
            {title ? <Text style={s.instructionLabel}>{title}</Text> : null}
            {hint  ? <Text style={s.instructionText}>{hint}</Text>   : null}
          </View>
        </View>
      )}

      {/* Shutter bar */}
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

// ─── PREVIEW ──────────────────────────────────────────────────────────────────

function PhotoPreview({
  title, uri, onConfirm, onRetake,
}: { title: string; uri: string; onConfirm: () => void; onRetake: () => void }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 32 : insets.bottom + 16;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <View style={s.instructionWrap} pointerEvents="none">
        <View style={s.instructionBox}>
          <Text style={s.instructionLabel}>{title}</Text>
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

export default function CaptureCamera(props: CaptureCameraProps) {
  const [previewUri,    setPreviewUri]    = useState<string | null>(null);
  const [previewBase64, setPreviewBase64] = useState<string | undefined>(undefined);

  const handlePhoto = useCallback((uri: string, base64?: string) => {
    setPreviewUri(uri);
    setPreviewBase64(base64);
  }, []);

  const handleConfirm = useCallback(() => {
    if (previewUri) {
      props.onCapture(previewUri, previewBase64);
      setPreviewUri(null);
    }
  }, [previewUri, previewBase64, props]);

  const handleRetake = useCallback(() => setPreviewUri(null), []);

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={props.onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {previewUri ? (
          <PhotoPreview
            title={props.title}
            uri={previewUri}
            onConfirm={handleConfirm}
            onRetake={handleRetake}
          />
        ) : (
          <CameraCapture {...props} onCapture={handlePhoto} />
        )}
      </View>
    </Modal>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  bracket: {
    position: "absolute",
    borderColor: WHITE,
  },
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
