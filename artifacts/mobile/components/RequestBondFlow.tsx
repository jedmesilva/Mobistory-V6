import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Alert, Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import CaptureCamera from "@/components/CaptureCamera";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { R, S, F, I } from "@/components/shared";
import { BOND_TYPES, DOCS_BY_BOND } from "@/constants/data";
import { useBonds, BondMode } from "@/contexts/BondsContext";
import {
  C, FeatherName, GREEN, GREEN_BG, GREEN_BORDER, GREEN_TEXT,
  PageHeader, PrimaryButton, Footer,
} from "@/components/flow-ui";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Screen = "bond_type" | "bond_doc" | "success";

// ─── SCREEN: BOND TYPE ────────────────────────────────────────────────────────

function ScreenBondType({
  mode, onBack, onContinue,
}: {
  mode: BondMode;
  onBack: () => void;
  onContinue: (bondType: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const subtitle = mode === "reivindicar"
    ? "Selecione o tipo de vínculo que você reivindica ter com este veículo."
    : "Selecione o tipo de vínculo que deseja solicitar para este veículo.";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Tipo de vínculo" onBack={onBack} />
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
          {subtitle}
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
  bondType, mode, onBack, onContinue,
}: {
  bondType: string;
  mode: BondMode;
  onBack: () => void;
  onContinue: (docUri: string) => void;
}) {
  const [imageUri,   setImageUri]   = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const bondLabel = BOND_TYPES.find(b => b.id === bondType)?.label ?? bondType;

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permissão necessária", "Habilite o acesso às fotos nas configurações."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const subtitle = mode === "reivindicar"
    ? "Envie um documento que comprove o seu direito sobre este vínculo."
    : "Envie um documento que embase a sua solicitação de vínculo.";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }} showsVerticalScrollIndicator={false}>
        <PageHeader title="Comprovante" onBack={onBack} />

        {/* Bond type chip */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: S.lg, marginTop: S.xs }}>
          <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: S.md }}>
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>{bondLabel}</Text>
          </View>
        </View>

        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, lineHeight: F.base * 1.5 }}>
          {subtitle}
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
              { icon: "upload" as FeatherName, title: "Escolher da galeria", desc: "Selecione uma imagem já salva",             cam: false },
            ] as const).map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => opt.cam ? setCameraOpen(true) : pickFromGallery()}
                activeOpacity={0.8}
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
          Documentos aceitos: {DOCS_BY_BOND[bondType] ?? "Qualquer comprovante relevante"}
        </Text>
      </ScrollView>

      {imageUri && (
        <Footer>
          <PrimaryButton label="Enviar solicitação" onPress={() => onContinue(imageUri)} />
        </Footer>
      )}

      {cameraOpen && (
        <CaptureCamera
          title="Comprovante de vínculo"
          hint="Fotografe o documento que comprova o seu vínculo com o veículo"
          onCapture={(uri) => { setImageUri(uri); setCameraOpen(false); }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </View>
  );
}

// ─── SCREEN: SUCCESS ──────────────────────────────────────────────────────────

function ScreenSuccess({ mode, bondType, onDone }: { mode: BondMode; bondType: string; onDone: () => void }) {
  const bondLabel = BOND_TYPES.find(b => b.id === bondType)?.label ?? bondType;
  const title     = mode === "reivindicar" ? "Reivindicação enviada!" : "Solicitação enviada!";
  const desc      = mode === "reivindicar"
    ? "Sua reivindicação de vínculo foi registrada e está pendente de análise. Você será notificado quando houver uma atualização."
    : "Sua solicitação de vínculo foi registrada e está pendente de aprovação. Você será notificado quando houver uma atualização.";

  return (
    <View style={{ flex: 1, padding: S.xl, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: GREEN_BG, alignItems: "center", justifyContent: "center", marginBottom: S.xl }}>
        <Feather name="clock" size={32} color={GREEN} />
      </View>
      <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, textAlign: "center", marginBottom: S.md }}>{title}</Text>
      <Text style={{ fontSize: F.base, color: C.textSecondary, textAlign: "center", lineHeight: F.base * 1.6, marginBottom: S.xxl }}>{desc}</Text>

      {/* Bond type pill */}
      <View style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, width: "100%", marginBottom: S.xxl }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: F.sm, color: C.textSecondary }}>Tipo de vínculo</Text>
          <View style={{ backgroundColor: "#FEF9C3", borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm, flexDirection: "row", alignItems: "center", gap: S.xs }}>
            <Feather name="clock" size={10} color="#92400E" />
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: "#92400E" }}>Pendente</Text>
          </View>
        </View>
        <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary, marginTop: S.xs }}>{bondLabel}</Text>
      </View>

      <TouchableOpacity
        onPress={onDone}
        activeOpacity={0.85}
        style={{ backgroundColor: C.primary, borderRadius: R.xxl, paddingVertical: S.lg, width: "100%", alignItems: "center" }}
      >
        <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.primaryForeground }}>Concluir</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ROOT FLOW COMPONENT ──────────────────────────────────────────────────────

export default function RequestBondFlow() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams<{ mode?: string }>();
  const mode    = (params.mode === "reivindicar" ? "reivindicar" : "solicitar") as BondMode;

  const { addBond } = useBonds();

  const [screen,    setScreen]    = useState<Screen>("bond_type");
  const [bondType,  setBondType]  = useState<string>("");

  const handleTypeSelected = useCallback((type: string) => {
    setBondType(type);
    setScreen("bond_doc");
  }, []);

  const handleDocDone = useCallback((docUri: string) => {
    addBond({ type: bondType, mode, docUri });
    setScreen("success");
  }, [addBond, bondType, mode]);

  const handleDone = useCallback(() => {
    router.replace("/(tabs)");
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: C.background, paddingTop: screen === "success" ? 0 : (typeof insets.top === "number" ? insets.top : 0) }}>
      {screen === "bond_type" && (
        <ScreenBondType
          mode={mode}
          onBack={() => router.back()}
          onContinue={handleTypeSelected}
        />
      )}
      {screen === "bond_doc" && (
        <ScreenBondDoc
          bondType={bondType}
          mode={mode}
          onBack={() => setScreen("bond_type")}
          onContinue={handleDocDone}
        />
      )}
      {screen === "success" && (
        <ScreenSuccess
          mode={mode}
          bondType={bondType}
          onDone={handleDone}
        />
      )}
    </View>
  );
}
