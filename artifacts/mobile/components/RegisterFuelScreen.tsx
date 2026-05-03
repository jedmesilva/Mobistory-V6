import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Modal,
  Platform, KeyboardAvoidingView, ActivityIndicator, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import colors from "@/constants/colors";
import { R, S, F, I } from "@/components/shared";
import { formatMoney, formatOdometer, parseDecimalInput, formatFuelInput, getFuelUnit, getFuelInputMode, formatFuelByUnit, formatDecimalInput } from "@/lib/format";

const C = colors.light;
type FeatherName = React.ComponentProps<typeof Feather>["name"];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const AI_ACCENT       = "#6366F1";
const AI_ACCENT_BG    = "#EEF2FF";
const AI_ACCENT_BORDER = "#C7D2FE";

const FUEL_TYPES = [
  { id: "gasolina_comum",     label: "Gasolina Comum"      },
  { id: "gasolina_aditivada", label: "Gasolina Aditivada"  },
  { id: "etanol",             label: "Etanol"              },
  { id: "diesel",             label: "Diesel"              },
  { id: "diesel_s10",         label: "Diesel S10"          },
  { id: "gnv",                label: "GNV"                 },
  { id: "eletrico",           label: "Elétrico"            },
];

const PAYMENT_METHODS = [
  { id: "credito",  label: "Crédito"          },
  { id: "debito",   label: "Débito"           },
  { id: "pix",      label: "Pix"              },
  { id: "dinheiro", label: "Dinheiro"         },
  { id: "vale",     label: "Vale combustível" },
];

const SUGGESTED_STATIONS = [
  { id: 1, name: "Shell Centro",         address: "Av. Paulista, 1000 · Centro",           distance: "0,3 km" },
  { id: 2, name: "Petrobras Av. Brasil", address: "Av. Brasil, 2500 · Jardins",            distance: "1,1 km" },
  { id: 3, name: "Ipiranga Shopping",    address: "Rua Augusta, 800 · Consolação",         distance: "1,8 km" },
  { id: 4, name: "BR Distribuidora",     address: "Av. Rebouças, 3200 · Pinheiros",        distance: "2,4 km" },
  { id: 5, name: "Posto Ipiranga Norte", address: "Rua da Consolação, 400 · Higienópolis", distance: "3,2 km" },
];

const STEPS = ["station", "fuels", "pump", "odometer", "payment", "details", "confirm", "success"] as const;
type Step = typeof STEPS[number];

interface FuelEntry {
  id: number;
  type: string;
  liters: string;
  pricePerLiter: string;
}

interface StationObj {
  id: number;
  name: string;
  address: string;
  distance: string | null;
  isNew?: boolean;
}

interface Draft {
  station?: string;
  stationObj?: StationObj;
  fuels?: FuelEntry[];
  pump?: string;
  odometer?: string;
  method?: string;
  date?: string;
  time?: string;
  notes?: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

const API_BASE = Platform.OS === "web" && typeof window !== "undefined"
  ? `${window.location.origin}/api`
  : "http://localhost:80/api";

async function analyzeImage(base64: string, mediaType: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/fuel/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, mediaType }),
  });
  if (!res.ok) throw new Error("API error");
  const json = await res.json() as { data: Record<string, unknown> };
  return json.data;
}

// ─── SHARED UI ───────────────────────────────────────────────────────────────

function AiBadge() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: AI_ACCENT_BG, borderRadius: R.pill, paddingVertical: 2, paddingHorizontal: 6, borderWidth: 1, borderColor: AI_ACCENT_BORDER }}>
      <Feather name="zap" size={9} color={AI_ACCENT} />
      <Text style={{ fontSize: 9, fontWeight: "700" as const, color: AI_ACCENT, letterSpacing: 0.4 }}>IA</Text>
    </View>
  );
}

function AiErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: S.sm, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: R.xl, padding: S.md, marginBottom: S.lg }}>
      <Feather name="alert-circle" size={I.md} color="#EF4444" style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, fontSize: F.sm, color: "#B91C1C", lineHeight: 20 }}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} activeOpacity={0.7}>
        <Feather name="x" size={I.sm} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}

function FieldLabel({ label, aiField }: { label: string; aiField?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: S.sm }}>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 0.8, textTransform: "uppercase" as const }}>{label}</Text>
      {aiField && <AiBadge />}
    </View>
  );
}

function StepHeader({ title, onBack, onCapture, processing }: { title: string; onBack: () => void; onCapture?: (uri: string, type: string) => void; processing?: boolean }) {
  const handleCapture = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        const galleryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPerm.granted) { Alert.alert("Permissão necessária", "Autorize o acesso à câmera ou galeria."); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.8 });
        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          onCapture?.(asset.base64 ?? "", asset.mimeType ?? "image/jpeg");
        }
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onCapture?.(asset.base64 ?? "", asset.mimeType ?? "image/jpeg");
      }
    } catch { Alert.alert("Erro", "Não foi possível abrir a câmera."); }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, marginBottom: S.xxl }}>
      <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={{ padding: S.xs }}>
        <Feather name="arrow-left" size={I.xl} color={C.textSecondary} />
      </TouchableOpacity>
      <Text style={{ flex: 1, fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, lineHeight: 34 }}>{title}</Text>
      {onCapture && (
        <TouchableOpacity
          onPress={handleCapture}
          disabled={processing}
          activeOpacity={0.7}
          style={{ flexDirection: "row", alignItems: "center", gap: S.xs, backgroundColor: AI_ACCENT_BG, borderWidth: 1.5, borderColor: AI_ACCENT_BORDER, borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: S.md }}
        >
          {processing
            ? <ActivityIndicator size="small" color={AI_ACCENT} />
            : <Feather name="camera" size={I.sm} color={AI_ACCENT} />
          }
          <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: AI_ACCENT }}>{processing ? "Analisando…" : "Capturar"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function NextButton({ label = "Continuar", onPress, disabled }: { label?: string; onPress: () => void; disabled: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: disabled ? C.iconBg : C.textPrimary, borderRadius: R.xxl, paddingVertical: S.lg }}
    >
      <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: disabled ? C.textTertiary : C.textInverse }}>{label}</Text>
      {!disabled && <Feather name="chevron-right" size={I.lg} color={C.textInverse} />}
    </TouchableOpacity>
  );
}

function SkipButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ alignItems: "center", paddingVertical: S.md, marginTop: S.md }}>
      <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textTertiary }}>Pular esta etapa</Text>
    </TouchableOpacity>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.sm }}>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 0.8, textTransform: "uppercase" as const }}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </View>
  );
}

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

// ─── STEP 1 — POSTO ──────────────────────────────────────────────────────────

function StepStation({ draft, setFields, aiFields, processing, aiError, setAiError, onNext, onBack, onProcessImage, insets }:
  { draft: Draft; setFields: (f: Partial<Draft>) => void; aiFields: Record<string, boolean>; processing: boolean; aiError: string | null; setAiError: (e: string | null) => void; onNext: () => void; onBack: () => void; onProcessImage: (b64: string, mime: string) => void; insets: { bottom: number } }) {

  const sheetRef = useRef<BottomSheetModal>(null);
  const searchRef = useRef<any>(null);
  const addrRef = useRef<any>(null);
  const [stationText, setStationText] = useState(draft.station ?? "");
  const [sheetName, setSheetName] = useState(draft.station ?? "");
  const [selected, setSelected] = useState<StationObj | null>(draft.stationObj ?? null);
  const [draftAddr, setDraftAddr] = useState("");

  useEffect(() => {
    if (draft.station && draft.station !== stationText) setStationText(draft.station);
    if (draft.station && draft.station !== sheetName) setSheetName(draft.station);
    if (draft.stationObj) setSelected(draft.stationObj);
  }, [draft.station, draft.stationObj]);

  const trimmed     = stationText.trim();
  const suggestions = trimmed.length === 0
    ? SUGGESTED_STATIONS.filter(Boolean)
    : SUGGESTED_STATIONS.filter(Boolean).filter(s => s.name.toLowerCase().includes(trimmed.toLowerCase()));
  const exactMatch   = SUGGESTED_STATIONS.some(s => s.name.toLowerCase() === trimmed.toLowerCase());
  const showRegister = trimmed.length > 0 && !exactMatch && suggestions.length === 0;

  const handleSelect = (s: typeof SUGGESTED_STATIONS[number]) => { setStationText(s.name); setSelected(s); };
  const openRegisterSheet = () => {
    searchRef.current?.blur?.();
    setSheetName(stationText);
    setDraftAddr("");
    sheetRef.current?.present();
  };
  const saveSheet    = () => {
    const name = sheetName.trim();
    const ns: StationObj = { id: Date.now(), name, address: draftAddr, distance: null, isNew: true };
    setSelected(ns);
    setStationText(name);
    sheetRef.current?.dismiss();
  };
  const handleSheetChange = useCallback((index: number) => {
    if (index >= 0) setTimeout(() => addrRef.current?.focus?.(), 120);
  }, []);

  return (
    <View>
      <StepHeader title="Qual posto?" onBack={onBack} onCapture={onProcessImage} processing={processing} />
      {aiError && <AiErrorBanner message={aiError} onDismiss={() => setAiError(null)} />}

      <FieldLabel label="Nome do posto" aiField={aiFields.station} />

      <View style={{ backgroundColor: aiFields.station ? AI_ACCENT_BG : C.surface, borderRadius: R.xl, borderWidth: aiFields.station ? 1.5 : 0, borderColor: AI_ACCENT_BORDER, flexDirection: "row", alignItems: "center", padding: S.lg, gap: S.sm }}>
        <Feather name="map-pin" size={I.lg} color={aiFields.station ? AI_ACCENT : C.textTertiary} />
        <TextInput
          ref={searchRef}
          value={stationText}
          onChangeText={t => { setStationText(t); }}
          placeholder="Buscar posto..."
          placeholderTextColor={C.textTertiary}
          style={{ flex: 1, fontSize: F.xl, fontWeight: "600" as const, color: C.textPrimary }}
        />
        {stationText.length > 0 && (
          <TouchableOpacity onPress={() => { setStationText(""); }} activeOpacity={0.7}>
            <Feather name="x" size={I.sm} color={C.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginTop: S.sm, backgroundColor: C.surface, borderRadius: R.xl, overflow: "hidden", borderWidth: suggestions.length > 0 ? 1 : 0, borderColor: C.border, maxHeight: 260 }}>
        <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={s.id} onPress={() => handleSelect(s)} activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center", gap: S.md, padding: S.md, paddingHorizontal: S.lg, borderBottomWidth: i < suggestions.length - 1 ? 1 : 0, borderBottomColor: C.border, opacity: selected?.id === s.id ? 0.85 : 1 }}>
              <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
                <Feather name={selected?.id === s.id ? "check-circle" : "shopping-bag"} size={I.lg} color={selected?.id === s.id ? AI_ACCENT : C.iconColor} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }} numberOfLines={1}>{s.name}</Text>
                <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }} numberOfLines={1}>{s.address}</Text>
              </View>
              <Text style={{ fontSize: F.xs, fontWeight: "500" as const, color: C.textTertiary }}>{s.distance}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selected && (
        <View style={{ marginTop: S.sm, marginBottom: S.sm, backgroundColor: C.iconBg, borderRadius: R.xl }}>
          <View style={{ paddingHorizontal: S.md, paddingTop: S.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "600" as const, textTransform: "uppercase" as const, letterSpacing: 0.7 }}>
                Selecionado
              </Text>
              <TouchableOpacity onPress={() => { setSelected(null); setStationText(""); }} activeOpacity={0.7} style={{ padding: S.xs }}>
                <Feather name="x" size={I.sm} color={C.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ backgroundColor: C.surface, borderWidth: 1.5, borderColor: aiFields.stationObj ? AI_ACCENT_BORDER : C.border, borderRadius: R.xl, padding: S.lg, flexDirection: "row", alignItems: "center", gap: S.md }}>
            <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Feather name="shopping-bag" size={I.lg} color={aiFields.stationObj ? AI_ACCENT : C.iconColor} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }} numberOfLines={1}>{selected.name}</Text>
              <Text style={{ fontSize: F.sm, color: selected.address ? C.textSecondary : C.textTertiary, marginTop: 2 }}>{selected.address || "A definir"}</Text>
            </View>
            {selected.distance && <Text style={{ fontSize: F.xs, color: C.textTertiary }}>{selected.distance}</Text>}
            {selected.isNew && <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}><Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textPrimary }}>Novo</Text></View>}
            {aiFields.stationObj && <AiBadge />}
          </View>
        </View>
      )}

      {showRegister && (
        <TouchableOpacity onPress={openRegisterSheet} activeOpacity={0.7}
          style={{ flexDirection: "row", alignItems: "center", gap: S.md, borderWidth: 1.5, borderStyle: "dashed" as const, borderColor: C.separator, borderRadius: R.xl, padding: S.lg, marginTop: S.sm }}>
          <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
            <Feather name="plus" size={I.lg} color={C.textTertiary} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 0.6, textTransform: "uppercase" as const, marginBottom: 2 }}>Cadastrar</Text>
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }} numberOfLines={1}>"{trimmed}"</Text>
            <Text style={{ fontSize: F.sm, color: C.textTertiary, marginTop: 2 }}>A definir</Text>
          </View>
          <Feather name="chevron-right" size={I.lg} color={C.textTertiary} />
        </TouchableOpacity>
      )}

      <View style={{ marginTop: S.xxxl }}>
        <NextButton onPress={() => { setFields({ station: selected!.name, stationObj: selected! }); onNext(); }} disabled={!selected} />
      </View>

      {/* SHEET — cadastrar posto */}
      <BottomSheetModal
        ref={sheetRef}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        onChange={handleSheetChange}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: S.xl + insets.bottom }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xs }}>
            <Text style={{ fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary }}>Cadastrar posto</Text>
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="x" size={I.md} color={C.textTertiary} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: F.sm, color: C.textSecondary, marginBottom: S.xl, lineHeight: 20 }}>
            Informe o endereço de <Text style={{ fontWeight: "600" as const, color: C.textPrimary }}>"{trimmed}"</Text>.
          </Text>
          <FieldLabel label="Nome" />
          <View style={{ backgroundColor: C.background, borderRadius: R.xl, padding: S.md, marginBottom: S.lg }}>
            <BottomSheetTextInput
              value={sheetName}
              onChangeText={setSheetName}
              placeholder="Nome do posto"
              placeholderTextColor={C.textTertiary}
              style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}
            />
          </View>
          <FieldLabel label="Endereço" />
          <View style={{ backgroundColor: C.background, borderRadius: R.xl, padding: S.md, flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.xl }}>
            <Feather name="map-pin" size={I.md} color={C.textTertiary} />
            <BottomSheetTextInput
              ref={addrRef}
              value={draftAddr}
              onChangeText={setDraftAddr}
              placeholder="Ex: Av. Paulista, 1000 · Centro"
              placeholderTextColor={C.textTertiary}
              style={{ flex: 1, fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}
            />
          </View>
          <TouchableOpacity onPress={saveSheet} disabled={draftAddr.trim().length === 0 || sheetName.trim().length === 0} activeOpacity={0.85}
            style={{ alignItems: "center", justifyContent: "center", backgroundColor: draftAddr.trim().length > 0 && sheetName.trim().length > 0 ? C.textPrimary : C.iconBg, borderRadius: R.xxl, paddingVertical: S.lg }}>
            <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: draftAddr.trim().length > 0 && sheetName.trim().length > 0 ? C.textInverse : C.textTertiary }}>Cadastrar</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

// ─── STEP 2 — COMBUSTÍVEIS ───────────────────────────────────────────────────

function StepFuels({ draft, setFields, aiFields, processing, aiError, setAiError, onNext, onBack, onProcessImage, insets }:
  { draft: Draft; setFields: (f: Partial<Draft>) => void; aiFields: Record<string, boolean>; processing: boolean; aiError: string | null; setAiError: (e: string | null) => void; onNext: () => void; onBack: () => void; onProcessImage: (b64: string, mime: string) => void; insets: { bottom: number } }) {

  const sheetRef = useRef<BottomSheetModal>(null);
  const litersRef = useRef<any>(null);
  const priceRef = useRef<any>(null);
  const [fuels, setFuels] = useState<FuelEntry[]>(draft.fuels?.length ? draft.fuels : []);
  const [editing, setEditing] = useState<number | null>(null);
  const [draftF, setDraftF] = useState({ type: "", liters: "", pricePerLiter: "" });

  useEffect(() => { if (draft.fuels?.length) setFuels(draft.fuels); }, [draft.fuels]);

  const openAdd  = () => { setDraftF({ type: "", liters: "", pricePerLiter: "" }); setEditing(null); sheetRef.current?.present(); };
  const openEdit = (f: FuelEntry) => { setDraftF({ type: f.type, liters: f.liters, pricePerLiter: f.pricePerLiter }); setEditing(f.id); sheetRef.current?.present(); };
  const saveSheet = () => {
    const next = editing !== null
      ? fuels.map(f => f.id === editing ? { ...f, ...draftF } : f)
      : [...fuels, { id: Date.now(), ...draftF }];
    setFuels(next); sheetRef.current?.dismiss();
  };
  const removeFuel = (id: number) => setFuels(fuels.filter(f => f.id !== id));
  const fuelInputMode = getFuelInputMode(draftF.type);
  const fuelUnit = getFuelUnit(draftF.type);
  const onLitersChange = (t: string) => setDraftF(d => ({ ...d, liters: formatFuelInput(t, fuelInputMode) }));
  const onPriceChange = (t: string) => setDraftF(d => ({ ...d, pricePerLiter: formatFuelInput(t, "electric") }));
  const onFuelTypeChange = (type: string) => {
    setDraftF(d => ({ ...d, type }));
    requestAnimationFrame(() => litersRef.current?.focus?.());
  };

  const calcTotal = (liters: string, price: string) => {
    const l = parseDecimalInput(liters);
    const p = parseDecimalInput(price);
    return l && p ? l * p : null;
  };
  const totalGeral   = fuels.reduce((acc, f) => { const t = calcTotal(f.liters, f.pricePerLiter); return t ? acc + t : acc; }, 0);
  const isValid      = fuels.length > 0 && fuels.every(f => f.type && parseDecimalInput(f.liters) !== null && parseDecimalInput(f.pricePerLiter) !== null);
  const isDraftValid = draftF.type && parseDecimalInput(draftF.liters) !== null && parseDecimalInput(draftF.pricePerLiter) !== null;

  return (
    <View>
      <StepHeader title="Combustíveis" onBack={onBack} onCapture={onProcessImage} processing={processing} />
      {aiError && <AiErrorBanner message={aiError} onDismiss={() => setAiError(null)} />}

      {aiFields.fuels && fuels.length > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: S.md }}>
          <AiBadge />
          <Text style={{ fontSize: F.xs, color: AI_ACCENT }}>Preenchido pela IA — revise os dados</Text>
        </View>
      )}

      {fuels.map(fuel => {
        const label = FUEL_TYPES.find(ft => ft.id === fuel.type)?.label;
        const total = calcTotal(fuel.liters, fuel.pricePerLiter);
        return (
          <TouchableOpacity key={fuel.id} onPress={() => openEdit(fuel)} activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: S.md, backgroundColor: aiFields.fuels ? AI_ACCENT_BG : C.surface, borderWidth: aiFields.fuels ? 1.5 : 0, borderColor: AI_ACCENT_BORDER, borderRadius: R.xl, padding: S.lg, marginBottom: S.sm }}>
            <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Feather name="droplet" size={I.md} color={aiFields.fuels ? AI_ACCENT : C.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{label}</Text>
              <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{formatFuelByUnit(fuel.liters, fuel.type)} · {formatMoney(fuel.pricePerLiter)}/{getFuelUnit(fuel.type)}{total ? ` · ${formatMoney(total)}` : ""}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFuel(fuel.id)} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="trash-2" size={I.md} color={C.textTertiary} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      {fuels.length > 1 && totalGeral > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: S.md, paddingHorizontal: S.sm, marginBottom: S.lg }}>
          <Text style={{ fontSize: F.sm, color: C.textSecondary }}>Total geral</Text>
          <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary }}>{formatMoney(totalGeral)}</Text>
        </View>
      )}

      <TouchableOpacity onPress={openAdd} activeOpacity={0.7}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, borderWidth: 1.5, borderStyle: "dashed" as const, borderColor: C.separator, borderRadius: R.xxl, paddingVertical: S.md, marginBottom: S.xxl }}>
        <Feather name="plus" size={I.lg} color={C.textTertiary} />
        <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textTertiary }}>Adicionar combustível</Text>
      </TouchableOpacity>

      <NextButton onPress={() => { setFields({ fuels }); onNext(); }} disabled={!isValid} />

      <BottomSheetModal
        ref={sheetRef}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: S.xl + insets.bottom }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
            <Text style={{ fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary }}>{editing !== null ? "Editar" : "Adicionar"} combustível</Text>
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="x" size={I.md} color={C.textTertiary} />
            </TouchableOpacity>
          </View>

          <FieldLabel label="Tipo" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: S.sm, marginBottom: S.lg }}>
            {FUEL_TYPES.map(ft => (
              <TouchableOpacity key={ft.id} onPressIn={() => onFuelTypeChange(ft.id)} activeOpacity={0.7}
                style={{ paddingVertical: 6, paddingHorizontal: S.md, borderRadius: R.pill, borderWidth: 1.5, borderColor: draftF.type === ft.id ? C.textPrimary : C.border, backgroundColor: draftF.type === ft.id ? C.textPrimary : "transparent" }}>
                <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: draftF.type === ft.id ? C.textInverse : C.textSecondary }}>{ft.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.sm }}>
            <View style={{ flex: 1 }}>
              <FieldLabel label={fuelUnit === "kWh" ? "Energia" : fuelUnit === "m³" ? "Volume" : "Litros"} />
              <View style={{ backgroundColor: C.background, borderRadius: R.xl, padding: S.md, flexDirection: "row", alignItems: "center", gap: S.xs }}>
                <BottomSheetTextInput ref={litersRef} value={draftF.liters} onChangeText={onLitersChange} placeholder="0,00" keyboardType="decimal-pad" placeholderTextColor={C.textTertiary}
                  style={{ flex: 1, fontSize: F.lg, fontWeight: "600" as const, color: C.textPrimary }} />
                <Text style={{ fontSize: F.sm, color: C.textTertiary }}>{fuelUnit}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel label={`Preço/${fuelUnit}`} />
              <View style={{ backgroundColor: C.background, borderRadius: R.xl, padding: S.md, flexDirection: "row", alignItems: "center", gap: S.xs }}>
                <Text style={{ fontSize: F.sm, color: C.textTertiary }}>R$</Text>
                <BottomSheetTextInput ref={priceRef} value={draftF.pricePerLiter} onChangeText={onPriceChange} placeholder="0,00" keyboardType="decimal-pad" placeholderTextColor={C.textTertiary}
                  style={{ flex: 1, fontSize: F.lg, fontWeight: "600" as const, color: C.textPrimary }} />
              </View>
            </View>
          </View>

          {calcTotal(draftF.liters, draftF.pricePerLiter) && (
            <View style={{ backgroundColor: C.background, borderRadius: R.xl, padding: S.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.lg }}>
              <Text style={{ fontSize: F.sm, color: C.textSecondary }}>Total</Text>
              <Text style={{ fontSize: F.lg, fontWeight: "700" as const, color: C.textPrimary }}>{formatMoney(calcTotal(draftF.liters, draftF.pricePerLiter))}</Text>
            </View>
          )}

          <TouchableOpacity onPress={saveSheet} disabled={!isDraftValid} activeOpacity={0.85}
            style={{ alignItems: "center", justifyContent: "center", backgroundColor: isDraftValid ? C.textPrimary : C.iconBg, borderRadius: R.xxl, paddingVertical: S.lg }}>
            <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: isDraftValid ? C.textInverse : C.textTertiary }}>{editing !== null ? "Salvar" : "Adicionar"}</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

// ─── STEP 3 — BOMBA ──────────────────────────────────────────────────────────

function StepPump({ draft, setFields, aiFields, processing, aiError, setAiError, onNext, onBack, onProcessImage }:
  { draft: Draft; setFields: (f: Partial<Draft>) => void; aiFields: Record<string, boolean>; processing: boolean; aiError: string | null; setAiError: (e: string | null) => void; onNext: () => void; onBack: () => void; onProcessImage: (b64: string, mime: string) => void }) {

  const [pump, setPump] = useState(draft.pump ?? "");
  useEffect(() => { if (draft.pump !== undefined && draft.pump !== pump) setPump(draft.pump); }, [draft.pump]);

  return (
    <View>
      <StepHeader title="Qual bomba?" onBack={onBack} onCapture={onProcessImage} processing={processing} />
      {aiError && <AiErrorBanner message={aiError} onDismiss={() => setAiError(null)} />}
      <FieldLabel label="Número da bomba" aiField={aiFields.pump} />
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: aiFields.pump ? AI_ACCENT_BG : C.surface, borderWidth: aiFields.pump ? 1.5 : 0, borderColor: AI_ACCENT_BORDER, borderRadius: R.xl, padding: S.lg, gap: S.sm }}>
        <Feather name="hash" size={I.lg} color={aiFields.pump ? AI_ACCENT : C.textTertiary} />
        <TextInput autoFocus value={pump} onChangeText={setPump} placeholder="Ex: 4" keyboardType="number-pad" placeholderTextColor={C.textTertiary}
          style={{ flex: 1, fontSize: F.xl, fontWeight: "600" as const, color: C.textPrimary }} />
      </View>
      <View style={{ marginTop: S.xxxl }}>
        <NextButton onPress={() => { setFields({ pump }); onNext(); }} disabled={false} />
        <SkipButton onPress={() => { setFields({ pump: "" }); onNext(); }} />
      </View>
    </View>
  );
}

// ─── STEP 4 — HODÔMETRO ──────────────────────────────────────────────────────

function StepOdometer({ draft, setFields, aiFields, processing, aiError, setAiError, onNext, onBack, onProcessImage }:
  { draft: Draft; setFields: (f: Partial<Draft>) => void; aiFields: Record<string, boolean>; processing: boolean; aiError: string | null; setAiError: (e: string | null) => void; onNext: () => void; onBack: () => void; onProcessImage: (b64: string, mime: string) => void }) {

  const [odometer, setOdometer] = useState(draft.odometer ?? "");
  useEffect(() => { if (draft.odometer !== undefined && draft.odometer !== odometer) setOdometer(draft.odometer); }, [draft.odometer]);
  const onOdometerChange = (t: string) => {
    const digits = t.replace(/\D/g, "");
    if (!digits) {
      setOdometer("");
      return;
    }
    setOdometer(new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Number(digits)));
  };

  return (
    <View>
      <StepHeader title="Hodômetro" onBack={onBack} onCapture={onProcessImage} processing={processing} />
      {aiError && <AiErrorBanner message={aiError} onDismiss={() => setAiError(null)} />}
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xxl, lineHeight: 22 }}>
        Registrar a quilometragem atual permite calcular o consumo médio do veículo.
      </Text>
      <FieldLabel label="Quilometragem atual" aiField={aiFields.odometer} />
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: aiFields.odometer ? AI_ACCENT_BG : C.surface, borderWidth: aiFields.odometer ? 1.5 : 0, borderColor: AI_ACCENT_BORDER, borderRadius: R.xl, padding: S.lg, gap: S.sm }}>
        <Feather name="activity" size={I.lg} color={aiFields.odometer ? AI_ACCENT : C.textTertiary} />
        <TextInput autoFocus value={odometer} onChangeText={onOdometerChange} placeholder="Ex: 45.230" keyboardType="number-pad" placeholderTextColor={C.textTertiary}
          style={{ flex: 1, fontSize: F.xl, fontWeight: "600" as const, color: C.textPrimary }} />
        <Text style={{ fontSize: F.base, color: C.textTertiary }}>km</Text>
      </View>
      <View style={{ marginTop: S.xxxl }}>
        <NextButton onPress={() => { setFields({ odometer }); onNext(); }} disabled={odometer.trim().length === 0} />
        <SkipButton onPress={() => { setFields({ odometer: "" }); onNext(); }} />
      </View>
    </View>
  );
}

// ─── STEP 5 — PAGAMENTO ──────────────────────────────────────────────────────

function StepPayment({ draft, setFields, aiFields, processing, aiError, setAiError, onNext, onBack, onProcessImage }:
  { draft: Draft; setFields: (f: Partial<Draft>) => void; aiFields: Record<string, boolean>; processing: boolean; aiError: string | null; setAiError: (e: string | null) => void; onNext: () => void; onBack: () => void; onProcessImage: (b64: string, mime: string) => void }) {

  const [method, setMethod] = useState(draft.method ?? "");
  useEffect(() => { if (draft.method !== undefined && draft.method !== method) setMethod(draft.method); }, [draft.method]);

  return (
    <View>
      <StepHeader title="Pagamento" onBack={onBack} onCapture={onProcessImage} processing={processing} />
      {aiError && <AiErrorBanner message={aiError} onDismiss={() => setAiError(null)} />}
      <FieldLabel label="Método de pagamento" aiField={aiFields.method} />
      <View style={{ gap: S.sm, marginBottom: S.xxxl }}>
        {PAYMENT_METHODS.map(pm => (
          <TouchableOpacity key={pm.id} onPress={() => setMethod(pm.id)} activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: method === pm.id && aiFields.method ? AI_ACCENT_BG : C.surface, borderWidth: 1.5, borderColor: method === pm.id ? (aiFields.method ? AI_ACCENT_BORDER : C.textPrimary) : "transparent", borderRadius: R.xl, padding: S.lg }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: S.md }}>
              <Feather name="credit-card" size={I.lg} color={method === pm.id ? (aiFields.method ? AI_ACCENT : C.textPrimary) : C.iconColor} />
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: method === pm.id ? C.textPrimary : C.textSecondary }}>{pm.label}</Text>
            </View>
            {method === pm.id && (aiFields.method ? <AiBadge /> : <Feather name="check" size={I.lg} color={C.textPrimary} />)}
          </TouchableOpacity>
        ))}
      </View>
      <NextButton onPress={() => { setFields({ method }); onNext(); }} disabled={method.length === 0} />
      <SkipButton onPress={() => { setFields({ method: "" }); onNext(); }} />
    </View>
  );
}

// ─── STEP 6 — DETALHES ───────────────────────────────────────────────────────

function StepDetails({ draft, setFields, aiFields, processing, aiError, setAiError, onNext, onBack, onProcessImage }:
  { draft: Draft; setFields: (f: Partial<Draft>) => void; aiFields: Record<string, boolean>; processing: boolean; aiError: string | null; setAiError: (e: string | null) => void; onNext: () => void; onBack: () => void; onProcessImage: (b64: string, mime: string) => void }) {

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [date,  setDate]  = useState(draft.date  || defaultDate);
  const [time,  setTime]  = useState(draft.time  || defaultTime);
  const [notes, setNotes] = useState(draft.notes || "");

  useEffect(() => { if (draft.date)  setDate(draft.date);   }, [draft.date]);
  useEffect(() => { if (draft.time)  setTime(draft.time);   }, [draft.time]);
  useEffect(() => { if (draft.notes) setNotes(draft.notes); }, [draft.notes]);

  const isAiDateTime = aiFields.date || aiFields.time;

  return (
    <View>
      <StepHeader title="Detalhes" onBack={onBack} onCapture={onProcessImage} processing={processing} />
      {aiError && <AiErrorBanner message={aiError} onDismiss={() => setAiError(null)} />}

      <FieldLabel label="Data e hora" aiField={isAiDateTime} />
      <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xl }}>
        {[
          { value: date, onChange: setDate, icon: "calendar" as FeatherName, placeholder: "AAAA-MM-DD", aiKey: "date" },
          { value: time, onChange: setTime, icon: "clock" as FeatherName, placeholder: "HH:MM",        aiKey: "time" },
        ].map(({ value, onChange, icon, placeholder, aiKey }) => (
          <View key={aiKey} style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: aiFields[aiKey] ? AI_ACCENT_BG : C.surface, borderWidth: aiFields[aiKey] ? 1.5 : 0, borderColor: AI_ACCENT_BORDER, borderRadius: R.xl, padding: S.md, gap: S.sm }}>
            <Feather name={icon} size={I.md} color={aiFields[aiKey] ? AI_ACCENT : C.textTertiary} />
            <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.textTertiary}
              style={{ flex: 1, fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary }} />
          </View>
        ))}
      </View>

      <FieldLabel label="Observações" aiField={aiFields.notes} />
      <View style={{ backgroundColor: aiFields.notes ? AI_ACCENT_BG : C.surface, borderWidth: aiFields.notes ? 1.5 : 0, borderColor: AI_ACCENT_BORDER, borderRadius: R.xl, padding: S.lg, marginBottom: S.xxxl }}>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Alguma observação sobre este abastecimento?"
          placeholderTextColor={C.textTertiary}
          multiline
          numberOfLines={3}
          style={{ fontSize: F.base, color: C.textPrimary, lineHeight: 22, textAlignVertical: "top" as const, minHeight: 72 }}
        />
      </View>

      <NextButton onPress={() => { setFields({ date, time, notes }); onNext(); }} disabled={false} />
    </View>
  );
}

// ─── STEP 7 — CONFIRMAÇÃO ────────────────────────────────────────────────────

function StepConfirm({ draft, onConfirm, onBack }: { draft: Draft; onConfirm: () => void; onBack: () => void }) {
  const calcTotal    = (liters: string, price: string) => parseFloat(liters) * parseFloat(price) || 0;
  const totalGeral   = draft.fuels?.reduce((acc, f) => acc + calcTotal(f.liters, f.pricePerLiter), 0) || 0;
  const totalLitros  = draft.fuels?.reduce((acc, f) => acc + (parseDecimalInput(f.liters) || 0), 0) || 0;
  const payLabel     = PAYMENT_METHODS.find(p => p.id === draft.method)?.label;

  return (
    <View>
      <StepHeader title="Confirmação" onBack={onBack} />

      <View style={{ marginBottom: S.xxl }}>
        <SectionDivider label="Posto" />
        <View style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, flexDirection: "row", alignItems: "center", gap: S.md }}>
          <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
            <Feather name="shopping-bag" size={I.lg} color={C.iconColor} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }} numberOfLines={1}>{draft.station}</Text>
            {draft.stationObj?.address ? <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{draft.stationObj.address}</Text> : null}
          </View>
          {draft.pump ? (
            <View style={{ backgroundColor: C.iconBg, borderRadius: R.md, paddingVertical: S.xs, paddingHorizontal: S.sm, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Feather name="hash" size={I.xs} color={C.textTertiary} />
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>{draft.pump}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={{ marginBottom: S.xxl }}>
        <SectionDivider label="Combustíveis" />
        {draft.fuels?.map(f => {
          const label = FUEL_TYPES.find(ft => ft.id === f.type)?.label;
          const total = calcTotal(f.liters, f.pricePerLiter);
          return (
            <View key={f.id} style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, flexDirection: "row", alignItems: "center", gap: S.md, marginBottom: S.sm }}>
              <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
                <Feather name="droplet" size={I.md} color={C.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{label}</Text>
                <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{formatFuelByUnit(f.liters, f.type)} · {formatMoney(f.pricePerLiter)}/{getFuelUnit(f.type)}</Text>
              </View>
              <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>{formatMoney(total)}</Text>
            </View>
          );
        })}
        {(draft.fuels?.length ?? 0) > 1 && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.sm, paddingTop: S.xs }}>
            <Text style={{ fontSize: F.sm, color: C.textTertiary }}>{formatFuelByUnit(totalLitros, draft.fuels?.[0]?.type ?? "liquid")} no total</Text>
            <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary }}>{formatMoney(totalGeral)}</Text>
          </View>
        )}
      </View>

      {draft.odometer ? (
        <View style={{ marginBottom: S.xxl }}>
          <SectionDivider label="Hodômetro" />
          <View style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, flexDirection: "row", alignItems: "center", gap: S.md }}>
            <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Feather name="activity" size={I.md} color={C.iconColor} />
            </View>
            <Text style={{ flex: 1, fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>Quilometragem atual</Text>
            <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textPrimary }}>{formatOdometer(draft.odometer)}</Text>
          </View>
        </View>
      ) : null}

      {payLabel ? (
        <View style={{ marginBottom: S.xxl }}>
          <SectionDivider label="Pagamento" />
          <View style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, flexDirection: "row", alignItems: "center", gap: S.md }}>
            <View style={{ width: 36, height: 36, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Feather name="credit-card" size={I.md} color={C.iconColor} />
            </View>
            <Text style={{ flex: 1, fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{payLabel}</Text>
          </View>
        </View>
      ) : null}

      <View style={{ marginBottom: S.xxl }}>
        <SectionDivider label="Data e hora" />
        <View style={{ flexDirection: "row", gap: S.sm }}>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg }}>
            <Text style={{ fontSize: F.xs, color: C.textTertiary, marginBottom: 4 }}>Data</Text>
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{draft.date}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg }}>
            <Text style={{ fontSize: F.xs, color: C.textTertiary, marginBottom: 4 }}>Hora</Text>
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{draft.time}</Text>
          </View>
        </View>
      </View>

      {draft.notes ? (
        <View style={{ marginBottom: S.xxl }}>
          <SectionDivider label="Observações" />
          <View style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg }}>
            <Text style={{ fontSize: F.sm, color: C.textSecondary, lineHeight: 22 }}>{draft.notes}</Text>
          </View>
        </View>
      ) : null}

      <NextButton label="Salvar abastecimento" onPress={onConfirm} disabled={false} />
    </View>
  );
}

// ─── STEP 8 — SUCESSO ────────────────────────────────────────────────────────

function StepSuccess({ draft, onClose }: { draft: Draft; onClose: () => void }) {
  const totalGeral = draft.fuels?.reduce((acc, f) => {
    const l = parseFloat(f.liters), p = parseFloat(f.pricePerLiter);
    return l > 0 && p > 0 ? acc + l * p : acc;
  }, 0) || 0;

  return (
    <View style={{ alignItems: "center", justifyContent: "center", minHeight: 400, paddingTop: S.xxxl }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center", marginBottom: S.xl }}>
        <Feather name="check" size={32} color="#16A34A" />
      </View>
      <Text style={{ fontSize: F.xxxl, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.sm, textAlign: "center" as const }}>
        Abastecimento salvo!
      </Text>
      <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xs }}>{draft.station}</Text>
      <Text style={{ fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary, marginBottom: S.xxxl }}>
        {formatMoney(totalGeral)}
      </Text>
      <TouchableOpacity onPress={onClose} activeOpacity={0.85}
        style={{ width: "100%", alignItems: "center", justifyContent: "center", backgroundColor: C.textPrimary, borderRadius: R.xxl, paddingVertical: S.lg }}>
        <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.textInverse }}>Concluir</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── WIZARD ──────────────────────────────────────────────────────────────────

export default function RegisterFuelScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const topPad   = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [stepIdx,     setStepIdx]    = useState(0);
  const [draft,       setDraftState] = useState<Draft>({});
  const [aiFields,    setAiFields]   = useState<Record<string, boolean>>({});
  const [processing,  setProcessing] = useState(false);
  const [aiError,     setAiError]    = useState<string | null>(null);

  const step = STEPS[stepIdx];

  const setFields = useCallback((fields: Partial<Draft>) => {
    setDraftState(prev => ({ ...prev, ...fields }));
  }, []);

  const processImage = useCallback(async (base64: string, mediaType: string) => {
    if (!base64) return;
    setProcessing(true);
    setAiError(null);
    try {
      const extracted = await analyzeImage(base64, mediaType);
      const newFields: Partial<Draft> = {};
      const newAiFields: Record<string, boolean> = {};

      if (extracted.station) {
        newFields.station = extracted.station as string;
        newFields.stationObj = { id: Date.now(), name: extracted.station as string, address: (extracted.stationAddress as string) || "", distance: null };
        newAiFields.station = true;
        newAiFields.stationObj = true;
      }
      if (extracted.pump)          { newFields.pump = extracted.pump as string;                   newAiFields.pump = true; }
      if (extracted.odometer)      { newFields.odometer = String(extracted.odometer);             newAiFields.odometer = true; }
      if (extracted.paymentMethod) { newFields.method = extracted.paymentMethod as string;        newAiFields.method = true; }
      if (extracted.date)          { newFields.date = extracted.date as string;                   newAiFields.date = true; }
      if (extracted.time)          { newFields.time = extracted.time as string;                   newAiFields.time = true; }
      if (extracted.notes)         { newFields.notes = extracted.notes as string;                 newAiFields.notes = true; }
      if (Array.isArray(extracted.fuels) && (extracted.fuels as unknown[]).length > 0) {
        newFields.fuels = (extracted.fuels as Array<{ type: string; liters: string; pricePerLiter: string }>).map((f, i) => ({ id: Date.now() + i, ...f }));
        newAiFields.fuels = true;
      }

      setFields(newFields);
      setAiFields(prev => ({ ...prev, ...newAiFields }));
    } catch {
      setAiError("Não consegui extrair os dados. Tente outra imagem ou preencha manualmente.");
    } finally {
      setProcessing(false);
    }
  }, [setFields]);

  const next  = () => setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
  const back  = () => { if (stepIdx > 0) setStepIdx(i => i - 1); else router.back(); };
  const reset = () => { setDraftState({}); setAiFields({}); setAiError(null); setStepIdx(0); router.back(); };

  const stepProps = { draft, setFields, aiFields, processing, aiError, setAiError, onNext: next, onBack: back, onProcessImage: processImage, insets };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingTop: topPad + S.lg, paddingBottom: bottomPad + S.xxxl, paddingHorizontal: S.xl }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === "station"  && <StepStation  {...stepProps} />}
          {step === "fuels"    && <StepFuels    {...stepProps} />}
          {step === "pump"     && <StepPump     {...stepProps} />}
          {step === "odometer" && <StepOdometer {...stepProps} />}
          {step === "payment"  && <StepPayment  {...stepProps} />}
          {step === "details"  && <StepDetails  {...stepProps} />}
          {step === "confirm"  && <StepConfirm  draft={draft} onConfirm={next} onBack={back} />}
          {step === "success"  && <StepSuccess  draft={draft} onClose={reset} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
