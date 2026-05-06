import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Alert, Image, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import CaptureCamera from "@/components/CaptureCamera";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { R, S, F, I } from "@/components/shared";
import { BOND_TYPES } from "@/constants/data";
import { useBonds } from "@/contexts/BondsContext";
import {
  C, FeatherName, GREEN, GREEN_BG, GREEN_BORDER,
  PageHeader, PrimaryButton, Footer,
} from "@/components/flow-ui";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Screen = "bond_type" | "recipient" | "bond_doc" | "success";

// ─── HELPER: LABELLED INPUT ───────────────────────────────────────────────────

function LabelledInput({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "words" | "sentences";
  hint?: string;
}) {
  return (
    <View style={{ marginBottom: S.lg }}>
      <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary, marginBottom: S.xs }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textTertiary}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "sentences"}
        style={{
          backgroundColor: C.surface,
          borderRadius: R.lg,
          borderWidth: 1.5,
          borderColor: value.length > 0 ? C.primary : C.border,
          paddingVertical: S.md,
          paddingHorizontal: S.lg,
          fontSize: F.base,
          color: C.textPrimary,
        }}
      />
      {hint && (
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: S.xs, paddingLeft: S.xs }}>{hint}</Text>
      )}
    </View>
  );
}

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
      <ScrollView contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }} showsVerticalScrollIndicator={false}>
        <PageHeader title="Tipo de vínculo" onBack={onBack} />
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
          Selecione o tipo de vínculo que deseja conceder ao destinatário.
        </Text>
        <View style={{ gap: S.sm }}>
          {BOND_TYPES.filter(b => b.id !== "proprietario").map(item => {
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

// ─── SCREEN: RECIPIENT ────────────────────────────────────────────────────────

function ScreenRecipient({
  bondType, onBack, onContinue,
}: {
  bondType: string;
  onBack: () => void;
  onContinue: (name: string, cpf: string, email: string) => void;
}) {
  const [name,  setName]  = useState("");
  const [cpf,   setCpf]   = useState("");
  const [email, setEmail] = useState("");

  const bondLabel = BOND_TYPES.find(b => b.id === bondType)?.label ?? bondType;

  const formatCpf = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  };

  const isValid = name.trim().length >= 3
    && cpf.replace(/\D/g, "").length === 11
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <PageHeader title="Destinatário" onBack={onBack} />

          {/* Bond type chip */}
          <View style={{ flexDirection: "row", marginBottom: S.lg, marginTop: S.xs }}>
            <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: S.md }}>
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>{bondLabel}</Text>
            </View>
          </View>

          <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, lineHeight: F.base * 1.5 }}>
            Informe os dados da pessoa que receberá o vínculo. Um convite será enviado ao e-mail informado.
          </Text>

          <LabelledInput
            label="Nome completo"
            value={name}
            onChangeText={setName}
            placeholder="Ex.: Maria da Silva"
            autoCapitalize="words"
          />
          <LabelledInput
            label="CPF"
            value={cpf}
            onChangeText={v => setCpf(formatCpf(v))}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            autoCapitalize="none"
            hint="Somente números — será usado para identificar a pessoa."
          />
          <LabelledInput
            label="E-mail de contato"
            value={email}
            onChangeText={setEmail}
            placeholder="exemplo@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            hint="Um convite será enviado para este endereço."
          />
        </ScrollView>
        {isValid && (
          <Footer>
            <PrimaryButton label="Continuar" onPress={() => onContinue(name.trim(), cpf, email.trim())} />
          </Footer>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── SCREEN: OPTIONAL DOC ─────────────────────────────────────────────────────

function ScreenBondDoc({
  onBack, onContinue,
}: {
  onBack: () => void;
  onContinue: (docUri?: string) => void;
}) {
  const [imageUri,   setImageUri]   = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permissão necessária", "Habilite o acesso às fotos nas configurações."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }} showsVerticalScrollIndicator={false}>
        <PageHeader title="Documento" onBack={onBack} />

        {/* Optional badge */}
        <View style={{ flexDirection: "row", marginBottom: S.lg, marginTop: S.xs }}>
          <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: S.md }}>
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textTertiary }}>Opcional</Text>
          </View>
        </View>

        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, lineHeight: F.base * 1.5 }}>
          Você pode anexar um documento que comprove sua autoridade para conceder este vínculo. Esta etapa é opcional.
        </Text>

        {imageUri ? (
          <View style={{ position: "relative", backgroundColor: C.surface, borderRadius: R.xl, overflow: "hidden", borderWidth: 1.5, borderColor: C.border, marginBottom: S.lg }}>
            <Image source={{ uri: imageUri }} style={{ width: "100%", height: 220 }} resizeMode="cover" />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={{ position: "absolute", top: S.sm, right: S.sm, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}
            >
              <Feather name="x" size={I.sm} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: S.sm, marginBottom: S.lg }}>
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
      </ScrollView>

      <Footer>
        <View style={{ gap: S.sm }}>
          <PrimaryButton label="Conceder vínculo" onPress={() => onContinue(imageUri ?? undefined)} />
          {!imageUri && (
            <TouchableOpacity onPress={() => onContinue(undefined)} activeOpacity={0.7} style={{ alignItems: "center", paddingVertical: S.sm }}>
              <Text style={{ fontSize: F.sm, color: C.textSecondary, fontWeight: "600" as const }}>Pular esta etapa</Text>
            </TouchableOpacity>
          )}
        </View>
      </Footer>

      {cameraOpen && (
        <CaptureCamera
          title="Documento de autoridade"
          hint="Fotografe o documento que comprova sua autoridade para conceder este vínculo"
          onCapture={(uri) => { setImageUri(uri); setCameraOpen(false); }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </View>
  );
}

// ─── SCREEN: SUCCESS ──────────────────────────────────────────────────────────

function ScreenSuccess({
  bondType, recipientName, onDone,
}: {
  bondType: string;
  recipientName: string;
  onDone: () => void;
}) {
  const bondLabel = BOND_TYPES.find(b => b.id === bondType)?.label ?? bondType;

  return (
    <View style={{ flex: 1, padding: S.xl, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: GREEN_BG, borderWidth: 1.5, borderColor: GREEN_BORDER, alignItems: "center", justifyContent: "center", marginBottom: S.xl }}>
        <Feather name="user-check" size={32} color={GREEN} />
      </View>
      <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, textAlign: "center", marginBottom: S.md }}>
        Vínculo concedido!
      </Text>
      <Text style={{ fontSize: F.base, color: C.textSecondary, textAlign: "center", lineHeight: F.base * 1.6, marginBottom: S.xxl }}>
        Um convite foi enviado para {recipientName}. O vínculo ficará pendente até que a pessoa aceite e a identidade seja verificada.
      </Text>

      {/* Summary card */}
      <View style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, width: "100%", marginBottom: S.xxl, borderWidth: 1, borderColor: C.border, gap: S.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: F.sm, color: C.textSecondary }}>Destinatário</Text>
          <Text style={{ fontSize: F.sm, fontWeight: "700" as const, color: C.textPrimary }}>{recipientName}</Text>
        </View>
        <View style={{ height: 1, backgroundColor: C.border }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: F.sm, color: C.textSecondary }}>Tipo de vínculo</Text>
          <Text style={{ fontSize: F.sm, fontWeight: "700" as const, color: C.textPrimary }}>{bondLabel}</Text>
        </View>
        <View style={{ height: 1, backgroundColor: C.border }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: F.sm, color: C.textSecondary }}>Status</Text>
          <View style={{ backgroundColor: "#FEF9C3", borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm, flexDirection: "row", alignItems: "center", gap: S.xs }}>
            <Feather name="clock" size={10} color="#92400E" />
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: "#92400E" }}>Aguardando aceite</Text>
          </View>
        </View>
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

export default function GrantBondFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addBond } = useBonds();

  const [screen,        setScreen]        = useState<Screen>("bond_type");
  const [bondType,      setBondType]      = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientCpf,  setRecipientCpf]  = useState<string>("");
  const [recipientEmail,setRecipientEmail]= useState<string>("");

  const handleTypeSelected = useCallback((type: string) => {
    setBondType(type);
    setScreen("recipient");
  }, []);

  const handleRecipientDone = useCallback((name: string, cpf: string, email: string) => {
    setRecipientName(name);
    setRecipientCpf(cpf);
    setRecipientEmail(email);
    setScreen("bond_doc");
  }, []);

  const handleDocDone = useCallback((docUri?: string) => {
    addBond({
      type: bondType,
      mode: "conceder",
      docUri,
      recipientName,
      recipientCpf,
      recipientEmail,
    });
    setScreen("success");
  }, [addBond, bondType, recipientName, recipientCpf, recipientEmail]);

  const handleDone = useCallback(() => {
    router.replace("/(tabs)");
  }, [router]);

  const topPad = screen === "success" ? 0 : (typeof insets.top === "number" ? insets.top : 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.background, paddingTop: topPad }}>
      {screen === "bond_type" && (
        <ScreenBondType
          onBack={() => router.back()}
          onContinue={handleTypeSelected}
        />
      )}
      {screen === "recipient" && (
        <ScreenRecipient
          bondType={bondType}
          onBack={() => setScreen("bond_type")}
          onContinue={handleRecipientDone}
        />
      )}
      {screen === "bond_doc" && (
        <ScreenBondDoc
          onBack={() => setScreen("recipient")}
          onContinue={handleDocDone}
        />
      )}
      {screen === "success" && (
        <ScreenSuccess
          bondType={bondType}
          recipientName={recipientName}
          onDone={handleDone}
        />
      )}
    </View>
  );
}
