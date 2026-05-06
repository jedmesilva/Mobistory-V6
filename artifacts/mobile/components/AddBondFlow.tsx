import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Alert, Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import CaptureCamera from "@/components/CaptureCamera";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { R, S, F, I } from "@/components/shared";
import { BOND_TYPES, DOCS_BY_BOND } from "@/constants/data";
import {
  C, FeatherName,
  PageHeader, PrimaryButton, Footer,
} from "@/components/flow-ui";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Screen = "bond_type" | "bond_doc";

// ─── SCREEN: BOND TYPE ────────────────────────────────────────────────────────

function ScreenBondType({
  onBack, onContinue,
}: {
  onBack: () => void;
  onContinue: (bondType: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Tipo de vínculo" onBack={onBack} />
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
          Selecione qual é o seu vínculo com este veículo.
        </Text>
        <View style={{ gap: S.sm }}>
          {BOND_TYPES.map(item => {
            const isSel = selected === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelected(item.id)}
                activeOpacity={0.8}
                style={{
                  flexDirection: "row", alignItems: "center", gap: S.lg,
                  backgroundColor: C.surface,
                  borderWidth: 1.5, borderColor: isSel ? C.primary : "transparent",
                  borderRadius: R.xl, padding: S.lg,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: R.md, backgroundColor: isSel ? C.primary : C.iconBg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Feather name={item.icon as FeatherName} size={I.xl} color={isSel ? C.primaryForeground : C.iconColor} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary, marginBottom: 3 }}>{item.label}</Text>
                  <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: F.sm * 1.4 }}>{item.description}</Text>
                </View>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: isSel ? 0 : 1.5, borderColor: C.border, backgroundColor: isSel ? C.primary : "transparent", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isSel && <Feather name="check" size={I.xs} color={C.primaryForeground} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      {selected && (
        <Footer>
          <PrimaryButton label="Continuar" onPress={() => onContinue(selected)} />
        </Footer>
      )}
    </View>
  );
}

// ─── SCREEN: BOND DOC ─────────────────────────────────────────────────────────

function ScreenBondDoc({
  bondType, onBack, onContinue,
}: {
  bondType: string;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [imageUri,   setImageUri]   = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permissão necessária", "Habilite o acesso às fotos nas configurações."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const handlePick = (useCamera: boolean) => {
    if (useCamera) setCameraOpen(true);
    else pickFromGallery();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }} showsVerticalScrollIndicator={false}>
        <PageHeader title="Comprovante de vínculo" onBack={onBack} />
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
          Envie um documento que comprove o seu vínculo com este veículo.
        </Text>

        {imageUri ? (
          <View style={{ position: "relative", backgroundColor: C.surface, borderRadius: R.xl, overflow: "hidden", borderWidth: 1.5, borderColor: C.border }}>
            <Image source={{ uri: imageUri }} style={{ width: "100%", height: 220 }} resizeMode="cover" />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={{ position: "absolute", top: S.sm, right: S.sm, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}
            >
              <Feather name="x" size={I.sm} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: S.sm }}>
            {([
              { icon: "camera" as FeatherName, title: "Tirar foto",          desc: "Use a câmera para fotografar o documento", cam: true  },
              { icon: "upload" as FeatherName, title: "Escolher da galeria", desc: "Selecione uma imagem ou PDF já salvo",       cam: false },
            ] as const).map((opt, idx) => (
              <TouchableOpacity
                key={idx} onPress={() => handlePick(opt.cam)} activeOpacity={0.8}
                style={{ flexDirection: "row", alignItems: "center", gap: S.lg, backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg }}
              >
                <View style={{ width: 44, height: 44, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Feather name={opt.icon} size={I.xl} color={C.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary, marginBottom: 3 }}>{opt.title}</Text>
                  <Text style={{ fontSize: F.sm, color: C.textSecondary }}>{opt.desc}</Text>
                </View>
                <Feather name="chevron-right" size={I.lg} color={C.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: S.lg, lineHeight: F.xs * 1.5, paddingLeft: S.xs }}>
          Documentos aceitos: {DOCS_BY_BOND[bondType]}
        </Text>
      </ScrollView>

      {imageUri && (
        <Footer>
          <PrimaryButton label="Continuar para vistoria" onPress={onContinue} />
        </Footer>
      )}

      {cameraOpen && (
        <CaptureCamera
          title="Comprovante de vínculo"
          hint="Fotografe o documento que comprova seu vínculo com o veículo"
          onCapture={(uri) => { setImageUri(uri); setCameraOpen(false); }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </View>
  );
}

// ─── ROOT FLOW COMPONENT ──────────────────────────────────────────────────────

export default function AddBondFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>("bond_type");
  const [bondType, setBondType] = useState<string>("");

  const handleBondTypeSelected = useCallback((type: string) => {
    setBondType(type);
    setScreen("bond_doc");
  }, []);

  // After bond doc is submitted, launch the inspection flow as a new independent screen
  const handleBondDocDone = useCallback(() => {
    router.push({ pathname: "/add-inspection", params: { bondType } });
  }, [router, bondType]);

  return (
    <View style={{ flex: 1, backgroundColor: C.background, paddingTop: (typeof insets.top === "number" ? insets.top : 0) }}>
      {screen === "bond_type" && (
        <ScreenBondType
          onBack={() => router.back()}
          onContinue={handleBondTypeSelected}
        />
      )}
      {screen === "bond_doc" && (
        <ScreenBondDoc
          bondType={bondType}
          onBack={() => setScreen("bond_type")}
          onContinue={handleBondDocDone}
        />
      )}
    </View>
  );
}
