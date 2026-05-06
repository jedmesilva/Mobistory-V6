import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  Platform, ActivityIndicator, Alert, Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import InspectionCamera from "@/components/InspectionCamera";
import CaptureCamera from "@/components/CaptureCamera";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { R, S, F, I } from "@/components/shared";
import {
  VEHICLE_BRANDS, VEHICLE_MODELS, VEHICLE_VERSIONS, VEHICLE_YEARS,
  VEHICLE_COLORS, VEHICLE_FUELS, BOND_TYPES, DOCS_BY_BOND, INSPECTION_STEPS,
} from "@/constants/data";
import { useInspections } from "@/contexts/InspectionsContext";

const C = colors.light;
type FeatherName = React.ComponentProps<typeof Feather>["name"];

const AI_ACCENT        = "#6366F1";
const AI_ACCENT_BG     = "#EEF2FF";
const AI_ACCENT_BORDER = "#C7D2FE";
const GREEN            = "#16A34A";
const GREEN_BG         = "#F0FDF4";
const GREEN_BORDER     = "#BBF7D0";
const GREEN_TEXT       = "#15803D";
const ERROR_BG         = "#FEF2F2";
const ERROR_BORDER     = "#FECACA";
const ERROR_TEXT       = "#B91C1C";

const API_BASE =
  Platform.OS === "web" && typeof window !== "undefined"
    ? `${window.location.origin}/api`
    : "http://localhost:80/api";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Screen =
  | "add_vehicle" | "doc_upload"
  | "manual_brand" | "manual_model" | "manual_version" | "manual_year"
  | "manual_plate" | "manual_color" | "manual_fuel"
  | "vehicle_confirm" | "bond_type" | "bond_doc" | "inspection" | "pending";

interface NavParams {
  source?: "uvi" | "doc" | "manual";
  vehicleFound?: boolean;
  bondType?: string;
}

interface ManualDraft {
  brand?: string;
  model?: string;
  version?: string;
  year?: string;
  plate?: string;
  color?: string;
  fuel?: string;
}

// ─── MOCK VEHICLE DATA ────────────────────────────────────────────────────────

const VEHICLE_FOUND = {
  brand: "Honda", model: "Civic", version: "Versão XLI 1.6",
  uvi: "MBS-··21-··847", issuedAt: "15 jan. 2023", issuedBy: "Mobistory", verified: true,
  plate: "ABC-··34", renavam: "123.···.···-0", chassis: "9BWZZZ···T004251",
  year: "2021 / 2021", fuel: "Flex", color: "Prata", power: "126 cv",
  engine: "1.598 cc", body: "Sedã", category: "Particular",
  manufacturer: "Honda do Brasil", origin: "Brasil", factory: "Sumaré - SP", group: "Honda Motor Co.",
};
const VEHICLE_NEW = {
  brand: "Toyota", model: "Corolla", version: "Versão GLi 2.0",
  uvi: null, issuedAt: null, issuedBy: null, verified: false,
  plate: "DEF-··78", renavam: "987.···.···-0", chassis: "9BR···ZZ2T001234",
  year: "2022 / 2022", fuel: "Flex", color: "Branco", power: "177 cv",
  engine: "1.998 cc", body: "Sedã", category: "Particular",
  manufacturer: "Toyota do Brasil", origin: "Brasil", factory: "Indaiatuba - SP", group: "Toyota Motor Corporation",
};

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────

function PageHeader({
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

function PrimaryButton({
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

function Footer({ children }: { children: React.ReactNode }) {
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

function AiError({ message, onDismiss }: { message: string; onDismiss: () => void }) {
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

function ListRow({
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

function ChipList({ items, selected, onSelect }: { items: string[]; selected: string | null; onSelect: (v: string) => void }) {
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

const MANUAL_STEPS = ["manual_brand","manual_model","manual_version","manual_year","manual_plate","manual_color","manual_fuel"];

function ProgressDots({ current }: { current: number }) {
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

// ─── AI CAPTURE HOOK ──────────────────────────────────────────────────────────

function useAiCapture(onExtracted: (data: Record<string, string>) => void) {
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

async function pickAndCapture(
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

function CaptureBtn({
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

// ─── MANUAL STEP WRAPPER ─────────────────────────────────────────────────────

function ManualStepWrapper({
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

// ─── SCREEN: ADD VEHICLE ──────────────────────────────────────────────────────

function ScreenAddVehicle({ navigate, onClose }: { navigate: (s: Screen, p?: NavParams) => void; onClose: () => void }) {
  const [uvi, setUvi] = useState("");
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: (Platform.OS === "web" ? 40 : insets.top) + S.lg, paddingBottom: S.xxxl + 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="arrow-left" size={I.lg} color="#374151" />
          </TouchableOpacity>
          <View style={{ width: I.lg }} />
        </View>
        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xs }}>
          Informe o veículo
        </Text>
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, lineHeight: F.base * 1.5 }}>
          Informe os dados do veículo que deseja adicionar
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: R.xl, paddingHorizontal: S.lg, paddingVertical: 14, gap: S.sm, marginBottom: S.xs }}>
          <Feather name="hash" size={I.lg} color={C.textTertiary} />
          <TextInput
            autoFocus
            value={uvi}
            onChangeText={t => setUvi(t.toUpperCase())}
            placeholder="Digite o UVI do veículo"
            placeholderTextColor={C.textTertiary}
            autoCapitalize="characters"
            style={{ flex: 1, fontSize: F.xl, fontWeight: "600" as const, color: C.textPrimary, padding: 0, letterSpacing: uvi ? 2 : 0 }}
          />
        </View>
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginBottom: S.xs, paddingLeft: S.xs }}>
          O UVI é o identificador único permanente do veículo
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, marginVertical: S.md }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>ou</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        <View style={{ gap: S.sm }}>
          {([
            { icon: "file-text" as FeatherName, title: "Enviar documento do veículo", desc: "Tire uma foto ou faça upload do CRLV ou outro documento", screen: "doc_upload" as Screen },
            { icon: "edit-2" as FeatherName,    title: "Informar manualmente",         desc: "Preencha os dados do veículo você mesmo",                screen: "manual_brand" as Screen },
          ] as const).map(opt => (
            <TouchableOpacity
              key={opt.screen}
              onPress={() => navigate(opt.screen)}
              activeOpacity={0.8}
              style={{ flexDirection: "row", alignItems: "center", gap: S.lg, backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg }}
            >
              <View style={{ width: 44, height: 44, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Feather name={opt.icon} size={I.xl} color={C.iconColor} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary, marginBottom: 3 }}>{opt.title}</Text>
                <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: F.sm * 1.4 }}>{opt.desc}</Text>
              </View>
              <Feather name="chevron-right" size={I.lg} color={C.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {uvi.trim().length > 0 && (
        <Footer>
          <PrimaryButton
            label="Continuar com UVI"
            onPress={() => navigate("vehicle_confirm", { source: "uvi", vehicleFound: true })}
          />
        </Footer>
      )}
    </View>
  );
}

// ─── SCREEN: DOC UPLOAD ───────────────────────────────────────────────────────

function ScreenDocUpload({ navigate }: { navigate: (s: Screen, p?: NavParams) => void }) {
  const [imageUri,    setImageUri]    = useState<string | null>(null);
  const [cameraOpen,  setCameraOpen]  = useState(false);

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
      <ScrollView
        contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Documento do veículo" onBack={() => navigate("add_vehicle")} />
        <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
          Envie uma foto ou arquivo do documento do veículo.
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
              { icon: "camera" as FeatherName, title: "Tirar foto",         desc: "Use a câmera para fotografar o documento",  cam: true  },
              { icon: "upload" as FeatherName, title: "Escolher da galeria", desc: "Selecione uma imagem já salva",              cam: false },
            ] as const).map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handlePick(opt.cam)}
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
          Documentos aceitos: CRLV, nota fiscal, DUT ou qualquer documento oficial do veículo
        </Text>
      </ScrollView>

      {imageUri && (
        <Footer>
          <PrimaryButton
            label="Continuar"
            onPress={() => navigate("vehicle_confirm", { source: "doc", vehicleFound: true })}
          />
        </Footer>
      )}

      {cameraOpen && (
        <CaptureCamera
          title="Documento do veículo"
          hint="Fotografe o CRLV, DUT ou outro documento oficial"
          onCapture={(uri) => { setImageUri(uri); setCameraOpen(false); }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </View>
  );
}

// ─── SCREEN: MANUAL — BRAND ───────────────────────────────────────────────────

function ScreenManualBrand({
  draft, setDraft, navigate,
}: { draft: ManualDraft; setDraft: React.Dispatch<React.SetStateAction<ManualDraft>>; navigate: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const list = VEHICLE_BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase()));
  const { processing, aiError, setAiError, processImage } = useAiCapture(({ brand }) => {
    if (brand) { setDraft(d => ({ ...d, brand })); navigate("manual_model"); }
  });

  return (
    <ManualStepWrapper
      stepIndex={0} title="Qual a marca?" onBack={() => navigate("add_vehicle")}
      captureBtn={
        <CaptureBtn
          field="brand" processing={processing}
          onCapture={(b64, mt, f) => processImage(b64, mt, f)}
        />
      }
    >
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
        Selecione a marca do veículo.
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: R.xl, paddingHorizontal: S.lg, paddingVertical: 14, gap: S.sm, marginBottom: S.lg }}>
        <Feather name="search" size={I.lg} color={C.textTertiary} />
        <TextInput
          autoFocus value={query} onChangeText={setQuery} placeholder="Buscar marca..."
          placeholderTextColor={C.textTertiary}
          style={{ flex: 1, fontSize: F.xl, fontWeight: "600" as const, color: C.textPrimary, padding: 0 }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}><Feather name="x" size={I.sm} color={C.textTertiary} /></TouchableOpacity>
        )}
      </View>
      <View>
        {list.map((b, i) => (
          <ListRow key={b} label={b} selected={draft.brand} isLast={i === list.length - 1}
            iconName="truck"
            onSelect={v => { setDraft(d => ({ ...d, brand: v, model: undefined, version: undefined })); navigate("manual_model"); }}
          />
        ))}
      </View>
    </ManualStepWrapper>
  );
}

// ─── SCREEN: MANUAL — MODEL ───────────────────────────────────────────────────

function ScreenManualModel({
  draft, setDraft, navigate,
}: { draft: ManualDraft; setDraft: React.Dispatch<React.SetStateAction<ManualDraft>>; navigate: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const all = VEHICLE_MODELS[draft.brand ?? ""] ?? [];
  const list = all.filter(m => m.toLowerCase().includes(query.toLowerCase()));
  const { processing, aiError, setAiError, processImage } = useAiCapture(({ model }) => {
    if (model) { setDraft(d => ({ ...d, model })); navigate("manual_version"); }
  });

  return (
    <ManualStepWrapper
      stepIndex={1} title="Qual o modelo?" onBack={() => navigate("manual_brand")}
      captureBtn={<CaptureBtn field="model" processing={processing} onCapture={(b64, mt, f) => processImage(b64, mt, f)} />}
    >
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
        Selecione o modelo do veículo.
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: R.xl, paddingHorizontal: S.lg, paddingVertical: 14, gap: S.sm, marginBottom: S.lg }}>
        <Feather name="search" size={I.lg} color={C.textTertiary} />
        <TextInput
          autoFocus value={query} onChangeText={setQuery} placeholder="Buscar modelo..."
          placeholderTextColor={C.textTertiary}
          style={{ flex: 1, fontSize: F.xl, fontWeight: "600" as const, color: C.textPrimary, padding: 0 }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}><Feather name="x" size={I.sm} color={C.textTertiary} /></TouchableOpacity>
        )}
      </View>
      {list.length > 0 ? (
        <View>
          {list.map((m, i) => (
            <ListRow key={m} label={m} selected={draft.model} isLast={i === list.length - 1}
              onSelect={v => { setDraft(d => ({ ...d, model: v, version: undefined })); navigate("manual_version"); }}
            />
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: F.sm, color: C.textTertiary, textAlign: "center", padding: S.xl }}>
          Nenhum modelo encontrado para {draft.brand}
        </Text>
      )}
    </ManualStepWrapper>
  );
}

// ─── SCREEN: MANUAL — VERSION ─────────────────────────────────────────────────

function ScreenManualVersion({
  draft, setDraft, navigate,
}: { draft: ManualDraft; setDraft: React.Dispatch<React.SetStateAction<ManualDraft>>; navigate: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const all = VEHICLE_VERSIONS[draft.model ?? ""] ?? [];
  const list = all.filter(v => v.toLowerCase().includes(query.toLowerCase()));
  const { processing, aiError, setAiError, processImage } = useAiCapture(({ version }) => {
    if (version) { setDraft(d => ({ ...d, version })); navigate("manual_year"); }
  });

  return (
    <ManualStepWrapper
      stepIndex={2} title="Qual a versão?" onBack={() => navigate("manual_model")}
      captureBtn={<CaptureBtn field="version" processing={processing} onCapture={(b64, mt, f) => processImage(b64, mt, f)} />}
      footer={
        list.length === 0 && query.trim().length > 0
          ? <PrimaryButton label={`Usar "${query.trim()}"`} onPress={() => { setDraft(d => ({ ...d, version: query.trim() })); navigate("manual_year"); }} />
          : undefined
      }
    >
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
        Selecione a versão do veículo.
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: R.xl, paddingHorizontal: S.lg, paddingVertical: 14, gap: S.sm, marginBottom: S.lg }}>
        <Feather name="search" size={I.lg} color={C.textTertiary} />
        <TextInput
          autoFocus value={query} onChangeText={setQuery} placeholder="Buscar versão..."
          placeholderTextColor={C.textTertiary}
          style={{ flex: 1, fontSize: F.xl, fontWeight: "600" as const, color: C.textPrimary, padding: 0 }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}><Feather name="x" size={I.sm} color={C.textTertiary} /></TouchableOpacity>
        )}
      </View>
      {list.length > 0 ? (
        <View>
          {list.map((v, i) => (
            <ListRow key={v} label={v} selected={draft.version} isLast={i === list.length - 1}
              onSelect={val => { setDraft(d => ({ ...d, version: val })); navigate("manual_year"); }}
            />
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: F.sm * 1.5 }}>
          Não encontramos versões cadastradas. Digite manualmente.
        </Text>
      )}
    </ManualStepWrapper>
  );
}

// ─── SCREEN: MANUAL — YEAR ────────────────────────────────────────────────────

function ScreenManualYear({
  draft, setDraft, navigate,
}: { draft: ManualDraft; setDraft: React.Dispatch<React.SetStateAction<ManualDraft>>; navigate: (s: Screen) => void }) {
  const { processing, aiError, setAiError, processImage } = useAiCapture(({ year }) => {
    if (year) { setDraft(d => ({ ...d, year })); navigate("manual_plate"); }
  });

  return (
    <ManualStepWrapper
      stepIndex={3} title="Qual o ano?" onBack={() => navigate("manual_version")}
      captureBtn={<CaptureBtn field="year" processing={processing} onCapture={(b64, mt, f) => processImage(b64, mt, f)} />}
    >
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
        Selecione o ano de fabricação.
      </Text>
      <View>
        {VEHICLE_YEARS.map((y, i) => (
          <ListRow key={y} label={y} selected={draft.year} isLast={i === VEHICLE_YEARS.length - 1}
            onSelect={v => { setDraft(d => ({ ...d, year: v })); navigate("manual_plate"); }}
          />
        ))}
      </View>
    </ManualStepWrapper>
  );
}

// ─── SCREEN: MANUAL — PLATE ───────────────────────────────────────────────────

function ScreenManualPlate({
  draft, setDraft, navigate,
}: { draft: ManualDraft; setDraft: React.Dispatch<React.SetStateAction<ManualDraft>>; navigate: (s: Screen) => void }) {
  const [plate, setPlate] = useState(draft.plate ?? "");
  const formatted = plate.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  const canContinue = formatted.length >= 4;
  const { processing, aiError, setAiError, processImage } = useAiCapture(({ plate: p }) => {
    if (p) setPlate(p.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7));
  });

  return (
    <ManualStepWrapper
      stepIndex={4} title="Qual a placa?" onBack={() => navigate("manual_year")}
      captureBtn={<CaptureBtn field="plate" processing={processing} onCapture={(b64, mt, f) => processImage(b64, mt, f)} />}
      footer={canContinue
        ? <PrimaryButton label="Continuar" onPress={() => { setDraft(d => ({ ...d, plate: formatted })); navigate("manual_color"); }} />
        : undefined}
    >
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
        Informe a placa atual do veículo.
      </Text>
      <View style={{ backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: S.xl, paddingHorizontal: S.lg, marginBottom: S.sm, alignItems: "center" }}>
        <TextInput
          autoFocus
          value={formatted}
          onChangeText={t => setPlate(t)}
          placeholder="ABC1D23"
          placeholderTextColor={C.textTertiary}
          maxLength={7}
          autoCapitalize="characters"
          style={{ fontSize: 36, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: 6, textAlign: "center", padding: 0, width: "100%" }}
        />
      </View>
      <Text style={{ fontSize: F.xs, color: C.textTertiary, paddingLeft: S.xs, lineHeight: F.xs * 1.5 }}>
        Formato antigo: ABC-1234 · Mercosul: ABC1D23
      </Text>
    </ManualStepWrapper>
  );
}

// ─── SCREEN: MANUAL — COLOR ───────────────────────────────────────────────────

function ScreenManualColor({
  draft, setDraft, navigate,
}: { draft: ManualDraft; setDraft: React.Dispatch<React.SetStateAction<ManualDraft>>; navigate: (s: Screen) => void }) {
  const [color, setColor] = useState<string | null>(draft.color ?? null);
  const { processing, aiError, setAiError, processImage } = useAiCapture(({ color: c }) => { if (c) setColor(c); });

  return (
    <ManualStepWrapper
      stepIndex={5} title="Qual a cor?" onBack={() => navigate("manual_plate")}
      captureBtn={<CaptureBtn field="color" processing={processing} onCapture={(b64, mt, f) => processImage(b64, mt, f)} />}
      footer={color
        ? <PrimaryButton label="Continuar" onPress={() => { setDraft(d => ({ ...d, color: color! })); navigate("manual_fuel"); }} />
        : undefined}
    >
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
        Selecione a cor do veículo.
      </Text>
      <ChipList items={VEHICLE_COLORS} selected={color} onSelect={setColor} />
    </ManualStepWrapper>
  );
}

// ─── SCREEN: MANUAL — FUEL ────────────────────────────────────────────────────

function ScreenManualFuel({
  draft, setDraft, navigate,
}: { draft: ManualDraft; setDraft: React.Dispatch<React.SetStateAction<ManualDraft>>; navigate: (s: Screen, p?: NavParams) => void }) {
  const [fuel, setFuel] = useState<string | null>(draft.fuel ?? null);
  const { processing, aiError, setAiError, processImage } = useAiCapture(({ fuel: f }) => { if (f) setFuel(f); });

  return (
    <ManualStepWrapper
      stepIndex={6} title="Qual o combustível?" onBack={() => navigate("manual_color")}
      captureBtn={<CaptureBtn field="fuel" processing={processing} onCapture={(b64, mt, f) => processImage(b64, mt, f)} />}
      footer={fuel
        ? <PrimaryButton label="Continuar" onPress={() => { setDraft(d => ({ ...d, fuel: fuel! })); navigate("vehicle_confirm", { source: "manual", vehicleFound: false }); }} />
        : undefined}
    >
      {aiError && <AiError message={aiError} onDismiss={() => setAiError(null)} />}
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl, marginTop: S.sm, lineHeight: F.base * 1.5 }}>
        Selecione o tipo de combustível.
      </Text>
      <ChipList items={VEHICLE_FUELS} selected={fuel} onSelect={setFuel} />
    </ManualStepWrapper>
  );
}

// ─── SCREEN: VEHICLE CONFIRM ──────────────────────────────────────────────────

function ScreenVehicleConfirm({
  params, navigate,
}: { params: NavParams; navigate: (s: Screen, p?: NavParams) => void }) {
  const found = params.vehicleFound ?? true;
  const v = found ? VEHICLE_FOUND : VEHICLE_NEW;
  const backScreen: Screen = params.source === "manual" ? "manual_fuel" : params.source === "doc" ? "doc_upload" : "add_vehicle";

  function SectionLabel({ children }: { children: string }) {
    return (
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, paddingHorizontal: S.xl, paddingTop: S.lg, paddingBottom: S.sm }}>
        {children}
      </Text>
    );
  }

  function DataRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.xl, paddingVertical: S.md, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: C.border }}>
        <Text style={{ fontSize: F.base, color: C.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary, fontVariant: ["tabular-nums"] as any, letterSpacing: 0.2 }}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: S.xl, paddingTop: S.xxxl, paddingBottom: S.sm }}>
          <TouchableOpacity onPress={() => navigate(backScreen)} activeOpacity={0.7} style={{ marginBottom: S.lg }}>
            <Feather name="arrow-left" size={I.lg} color="#374151" />
          </TouchableOpacity>
          <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, lineHeight: F.hero * 1.1 }}>
            Confirme o veículo
          </Text>
        </View>

        <View style={{ marginHorizontal: S.xl, backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.sm }}>
          <View style={{ padding: S.xl }}>
            <View style={{ marginBottom: S.lg }}>
              <View style={{ width: 56, height: 56, borderRadius: R.lg, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
                <Feather name="truck" size={I.xxl} color={C.iconColor} />
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.xs }}>
              <Text style={{ fontSize: F.xxxl, fontWeight: "700" as const, color: C.textPrimary }}>{v.brand} {v.model}</Text>
              {v.verified && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: GREEN_BG, borderWidth: 1, borderColor: GREEN_BORDER, borderRadius: R.pill, paddingVertical: 2, paddingHorizontal: S.sm }}>
                  <Feather name="check-circle" size={I.xs} color={GREEN_TEXT} />
                  <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: GREEN_TEXT }}>Verificado</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: S.xl }}>{v.version}</Text>

            {v.uvi ? (
              <View style={{ backgroundColor: C.background, borderRadius: R.lg, padding: S.md, marginBottom: S.lg }}>
                <Text style={{ fontSize: F.xs, color: C.textTertiary, marginBottom: S.xs }}>Nº de identidade</Text>
                <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: 1 }}>{v.uvi}</Text>
              </View>
            ) : (
              <View style={{ backgroundColor: C.background, borderRadius: R.lg, padding: S.md, marginBottom: S.lg, flexDirection: "row", alignItems: "center", gap: S.md }}>
                <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Feather name="shield-off" size={I.md} color={C.textSecondary} />
                </View>
                <View>
                  <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary, marginBottom: 2 }}>Identidade não encontrada</Text>
                  <Text style={{ fontSize: F.xs, color: C.textSecondary, lineHeight: F.xs * 1.5 }}>Ao continuar, a identidade será emitida para este veículo</Text>
                </View>
              </View>
            )}

            {v.issuedAt && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: F.xs, color: C.textTertiary, marginBottom: 2 }}>Emitida em</Text>
                  <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary }}>{v.issuedAt}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: F.xs, color: C.textTertiary, marginBottom: 2 }}>Emitida por</Text>
                  <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary }}>{v.issuedBy}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <SectionLabel>Registro Oficial</SectionLabel>
        <View style={{ marginHorizontal: S.xl, backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.sm }}>
          <DataRow label="Placa" value={v.plate} />
          <DataRow label="RENAVAM" value={v.renavam} />
          <DataRow label="Chassi" value={v.chassis} />
          <DataRow label="Ano fab./mod." value={v.year} isLast />
        </View>

        <SectionLabel>Características</SectionLabel>
        <View style={{ marginHorizontal: S.xl, backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.sm }}>
          <DataRow label="Combustível" value={v.fuel} />
          <DataRow label="Cor" value={v.color} />
          <DataRow label="Potência" value={v.power} />
          <DataRow label="Cilindrada" value={v.engine} />
          <DataRow label="Carroceria" value={v.body} />
          <DataRow label="Categoria" value={v.category} isLast />
        </View>

        <SectionLabel>Fabricação</SectionLabel>
        <View style={{ marginHorizontal: S.xl, backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.sm }}>
          <DataRow label="Fabricante" value={v.manufacturer} />
          <DataRow label="País de origem" value={v.origin} />
          <DataRow label="Fábrica" value={v.factory} />
          <DataRow label="Grupo" value={v.group} isLast />
        </View>
      </ScrollView>

      <Footer>
        <PrimaryButton
          label={found ? "Confirmar veículo" : "Emitir identidade e continuar"}
          onPress={() => navigate("bond_type")}
        />
      </Footer>
    </View>
  );
}

// ─── SCREEN: BOND TYPE ────────────────────────────────────────────────────────

function ScreenBondType({ navigate }: { navigate: (s: Screen, p?: NavParams) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: S.xl, paddingBottom: S.xxxl + 60 }}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Tipo de vínculo" onBack={() => navigate("vehicle_confirm")} />
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
          <PrimaryButton label="Continuar" onPress={() => navigate("bond_doc", { bondType: selected })} />
        </Footer>
      )}
    </View>
  );
}

// ─── SCREEN: BOND DOC ─────────────────────────────────────────────────────────

function ScreenBondDoc({ params, navigate }: { params: NavParams; navigate: (s: Screen, p?: NavParams) => void }) {
  const bondType = params.bondType ?? "proprietario";
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
        <PageHeader title="Comprovante de vínculo" onBack={() => navigate("bond_type")} />
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
              { icon: "camera" as FeatherName, title: "Tirar foto",         desc: "Use a câmera para fotografar o documento",  cam: true  },
              { icon: "upload" as FeatherName, title: "Escolher da galeria", desc: "Selecione uma imagem ou PDF já salvo",        cam: false },
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
          <PrimaryButton label="Continuar" onPress={() => navigate("inspection", { bondType: params.bondType })} />
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

// ─── SCREEN: INSPECTION ───────────────────────────────────────────────────────

function ScreenInspection({ navigate, bondType }: { navigate: (s: Screen) => void; bondType?: string }) {
  const { addInspection, completeStep, finishInspection } = useInspections();
  const inspectionIdRef = useRef<number | null>(null);

  const [photos, setPhotos]             = useState<Record<string, string>>({});
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // Create the pending inspection in the context as soon as the screen mounts.
  // If the user closes the app mid-flow, this inspection will remain as Pendente.
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
    // Persist each completed step into the context immediately
    if (inspectionIdRef.current !== null) {
      completeStep(inspectionIdRef.current, activeStepId);
    }
    setActiveStepId(null);
  }, [activeStepId, completeStep]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: S.xl, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <PageHeader title="Vistoria" onBack={() => navigate("bond_doc")} />
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
                  {/* Thumbnail / placeholder */}
                  <TouchableOpacity
                    onPress={() => openCamera(step.id)}
                    activeOpacity={0.8}
                    style={{ width: 52, height: 52, borderRadius: R.md, overflow: "hidden", flexShrink: 0, backgroundColor: isDone ? "transparent" : C.iconBg, alignItems: "center", justifyContent: "center" }}
                  >
                    {isDone
                      ? <Image source={{ uri: photos[step.id] }} style={{ width: 52, height: 52 }} resizeMode="cover" />
                      : <Feather name="camera" size={I.xl} color={C.iconColor} />}
                  </TouchableOpacity>

                  {/* Labels */}
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

                  {/* Action */}
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

      {/* Finish footer */}
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
          onPress={() => {
            if (inspectionIdRef.current !== null) {
              finishInspection(inspectionIdRef.current);
            }
            navigate("pending");
          }}
          disabled={!canFinish}
        />
      </Footer>

      {/* Custom camera modal */}
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

export default function AddVehicleFlow() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("add_vehicle");
  const [params, setParams] = useState<NavParams>({});
  const [draft, setDraft] = useState<ManualDraft>({});

  const navigate = useCallback((to: Screen, p: NavParams = {}) => {
    setScreen(to);
    setParams(p);
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 0 : insets.top;

  const sharedProps = { navigate, params, draft, setDraft };

  return (
    <View style={{ flex: 1, backgroundColor: C.background, paddingTop: screen === "add_vehicle" || screen === "pending" ? 0 : topPad }}>
      {screen === "add_vehicle"     && <ScreenAddVehicle     navigate={navigate} onClose={handleClose} />}
      {screen === "doc_upload"      && <ScreenDocUpload      navigate={navigate} />}
      {screen === "manual_brand"    && <ScreenManualBrand    draft={draft} setDraft={setDraft} navigate={navigate} />}
      {screen === "manual_model"    && <ScreenManualModel    draft={draft} setDraft={setDraft} navigate={navigate} />}
      {screen === "manual_version"  && <ScreenManualVersion  draft={draft} setDraft={setDraft} navigate={navigate} />}
      {screen === "manual_year"     && <ScreenManualYear     draft={draft} setDraft={setDraft} navigate={navigate} />}
      {screen === "manual_plate"    && <ScreenManualPlate    draft={draft} setDraft={setDraft} navigate={navigate} />}
      {screen === "manual_color"    && <ScreenManualColor    draft={draft} setDraft={setDraft} navigate={navigate} />}
      {screen === "manual_fuel"     && <ScreenManualFuel     draft={draft} setDraft={setDraft} navigate={navigate} />}
      {screen === "vehicle_confirm" && <ScreenVehicleConfirm params={params} navigate={navigate} />}
      {screen === "bond_type"       && <ScreenBondType       navigate={navigate} />}
      {screen === "bond_doc"        && <ScreenBondDoc        params={params} navigate={navigate} />}
      {screen === "inspection"      && <ScreenInspection     navigate={navigate} bondType={params.bondType} />}
      {screen === "pending"         && <ScreenPending        onClose={handleClose} />}
    </View>
  );
}
