import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Clipboard,
  Image, Share, Alert,
} from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { VEHICLE, IDENTITY, ALL_BONDS } from "@/constants/data";
import { R, S, F, I, BackButton, VerifiedBadge, TimelineItem } from "@/components/shared";

const HISTORICO_ICON: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  aprovacao: "check-circle",
  rotina:    "shield",
  emissao:   "file-text",
};

const C = colors.light;

const MONO_LABELS = ["RENAVAM", "Chassi"];

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={{
      fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary,
      letterSpacing: 1, textTransform: "uppercase" as const,
      marginTop: S.xl, marginBottom: S.md,
    }}>
      {title}
    </Text>
  );
}

function FieldRow({ label, value, last }: { label: string; value: string; last: boolean }) {
  const isMono = MONO_LABELS.includes(label);
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingVertical: S.md, paddingHorizontal: S.xl,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: C.border,
    }}>
      <Text style={{ fontSize: F.sm, color: C.textSecondary, fontWeight: "500" as const }}>{label}</Text>
      <Text style={{
        fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary,
        fontFamily: isMono ? "monospace" : undefined, letterSpacing: isMono ? 0.5 : 0,
      }}>
        {value}
      </Text>
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[{ backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden" }, style]}>
      {children}
    </View>
  );
}

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

function IdentityShareSheet({ sheetRef }: { sheetRef: React.RefObject<BottomSheetModal | null> }) {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&color=111827&bgcolor=F7F8FA&data=${IDENTITY.id}`;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCopy = () => {
    Clipboard.setString(IDENTITY.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Identidade Mobistory: ${IDENTITY.id}\n${VEHICLE.name} · ${VEHICLE.plate}` });
    } catch (_) {}
  };

  return (
    <BottomSheetModal ref={sheetRef} enablePanDownToClose backdropComponent={renderBackdrop}>
      <BottomSheetView style={{ paddingBottom: bottomPad + S.xl }}>
        {/* Título */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: S.xl, paddingTop: S.sm, paddingBottom: S.md }}>
          <Text style={{ fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary }}>Identidade do veículo</Text>
          <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} activeOpacity={0.7} style={{ padding: S.xs }}>
            <Feather name="x" size={I.md} color={C.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* QR Code */}
        <View style={{ alignItems: "center", paddingVertical: S.md, paddingHorizontal: S.xl }}>
          <View style={{ backgroundColor: C.background, borderRadius: R.xxl, padding: S.xl }}>
            <Image
              source={{ uri: qrUrl }}
              style={{ width: 180, height: 180, borderRadius: R.md }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Número + copiar */}
        <View style={{
          marginHorizontal: S.xl, marginTop: S.md,
          backgroundColor: C.background, borderRadius: R.xl,
          padding: S.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        }}>
          <View>
            <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const, marginBottom: S.xs }}>Nº de identidade</Text>
            <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary, fontFamily: "monospace", letterSpacing: 0.5 }}>{IDENTITY.id}</Text>
          </View>
          <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}
            style={{
              flexDirection: "row", alignItems: "center", gap: S.xs,
              backgroundColor: copied ? "#DCFCE7" : C.surface,
              borderRadius: R.lg, paddingVertical: S.sm, paddingHorizontal: S.md,
            }}>
            <Feather name={copied ? "check-circle" : "copy"} size={I.md} color={copied ? "#16A34A" : C.textSecondary} />
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: copied ? "#16A34A" : C.textSecondary }}>
              {copied ? "Copiado" : "Copiar"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contexto */}
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginHorizontal: S.xl, marginTop: S.sm, paddingHorizontal: S.xs }}>
          {VEHICLE.name} · {VEHICLE.plate} · Emitida em {IDENTITY.emittedAt}
        </Text>

        {/* Botão compartilhar */}
        <TouchableOpacity onPress={handleShare} activeOpacity={0.85}
          style={{
            marginHorizontal: S.xl, marginTop: S.xl,
            backgroundColor: C.textPrimary, borderRadius: R.xxl,
            paddingVertical: S.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm,
          }}>
          <Feather name="share-2" size={I.lg} color={C.surface} />
          <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: C.surface }}>Compartilhar link</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export default function IdentityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const shareSheetRef = useRef<BottomSheetModal>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const activeBonds = ALL_BONDS.filter(b => b.active).length;

  const handleCopy = () => {
    Clipboard.setString(IDENTITY.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    Alert.alert("Exportar", "Escolha o formato de exportação", [
      { text: "CSV", onPress: () => {} },
      { text: "PDF", onPress: () => {} },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.background }}
        contentContainerStyle={{ paddingTop: topPad + S.lg, paddingBottom: bottomPad + S.xxxl, paddingHorizontal: S.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
          <BackButton onPress={() => router.back()} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
            <TouchableOpacity onPress={() => shareSheetRef.current?.present()} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="share-2" size={I.xxl} color={C.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="download" size={I.xxl} color={C.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO CARD */}
        <Card>
          {/* ícone + status */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", padding: S.xl, paddingBottom: S.lg }}>
            <View style={{ width: 56, height: 56, borderRadius: R.xl, backgroundColor: "#EEF0F4", alignItems: "center", justifyContent: "center" }}>
              <FontAwesome5 name="car" size={I.xxl} color={C.textTertiary} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#DCFCE7", borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: S.md }}>
              <Feather name="check-circle" size={I.xs} color="#16A34A" />
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: "#16A34A" }}>{IDENTITY.status}</Text>
            </View>
          </View>

          {/* nome + versão */}
          <View style={{ paddingHorizontal: S.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, flexWrap: "wrap" as const, marginBottom: 3 }}>
              <Text style={{ fontSize: F.xxxl, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5 }}>{VEHICLE.name}</Text>
              {VEHICLE.verified && <VerifiedBadge />}
            </View>
            <Text style={{ fontSize: F.base, color: C.textSecondary, marginBottom: S.xl }}>Versão {VEHICLE.version}</Text>
          </View>

          {/* número de identidade */}
          <View style={{ marginHorizontal: S.xl, backgroundColor: C.background, borderRadius: R.xl, padding: S.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.lg }}>
            <View>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const, marginBottom: S.xs }}>Nº de identidade</Text>
              <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary, fontFamily: "monospace", letterSpacing: 0.5 }}>{IDENTITY.id}</Text>
            </View>
            <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}
              style={{ backgroundColor: copied ? "#DCFCE7" : C.surface, borderRadius: R.md, padding: S.sm, alignItems: "center", justifyContent: "center" }}>
              <Feather name={copied ? "check" : "copy"} size={I.lg} color={copied ? "#16A34A" : C.iconColor} />
            </TouchableOpacity>
          </View>

          {/* divider */}
          <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: S.xl }} />

          {/* emissão */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", padding: S.xl }}>
            <View>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const, marginBottom: S.xs }}>Emitida em</Text>
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary }}>{IDENTITY.emittedAt}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const, marginBottom: S.xs }}>Emitida por</Text>
              <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary }}>{IDENTITY.emittedBy}</Text>
            </View>
          </View>
        </Card>

        {/* REGISTRO OFICIAL */}
        <SectionLabel title="Registro oficial" />
        <Card>
          {IDENTITY.registro.map((item, i) => (
            <FieldRow key={item.label} label={item.label} value={item.value} last={i === IDENTITY.registro.length - 1} />
          ))}
        </Card>

        {/* CARACTERÍSTICAS */}
        <SectionLabel title="Características" />
        <Card>
          {IDENTITY.caracteristicas.map((item, i) => (
            <FieldRow key={item.label} label={item.label} value={item.value} last={i === IDENTITY.caracteristicas.length - 1} />
          ))}
        </Card>

        {/* DOCUMENTAÇÃO */}
        <SectionLabel title="Documentação" />
        <Card>
          {IDENTITY.documentacao.map((item, i) => (
            <View key={item.label} style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              paddingVertical: S.md, paddingHorizontal: S.xl,
              borderBottomWidth: i < IDENTITY.documentacao.length - 1 ? 1 : 0,
              borderBottomColor: C.border,
            }}>
              <Text style={{ fontSize: F.sm, color: C.textSecondary, fontWeight: "500" as const }}>{item.label}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
                <View style={{ backgroundColor: item.ok ? "#DCFCE7" : "#FEF2F2", borderRadius: R.pill, paddingVertical: 2, paddingHorizontal: S.sm }}>
                  <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: item.ok ? "#16A34A" : "#DC2626" }}>{item.status}</Text>
                </View>
                <Feather name="chevron-right" size={I.sm} color={C.textTertiary} />
              </View>
            </View>
          ))}
        </Card>

        {/* VÍNCULOS */}
        <SectionLabel title="Vínculos" />

        <TouchableOpacity onPress={() => router.navigate("/bond")} activeOpacity={0.8}
          style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, marginBottom: S.sm, flexDirection: "row", alignItems: "center", gap: S.md }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
            <Feather name="user" size={I.lg} color={C.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: F.xs, color: C.textTertiary, marginBottom: 2 }}>Seu vínculo</Text>
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{VEHICLE.bond.type}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm }}>
            <View style={{ backgroundColor: "#DCFCE7", borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: "#16A34A" }}>Ativo</Text>
            </View>
            <Feather name="chevron-right" size={I.md} color={C.textTertiary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.navigate("/all-bonds")} activeOpacity={0.8}
          style={{ backgroundColor: C.surface, borderRadius: R.xl, padding: S.lg, flexDirection: "row", alignItems: "center", gap: S.md }}>
          <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
            <Feather name="users" size={I.lg} color={C.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>Vínculos ativos</Text>
            <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{activeBonds} pessoas vinculadas</Text>
          </View>
          <Feather name="chevron-right" size={I.md} color={C.textTertiary} />
        </TouchableOpacity>

        {/* HISTÓRICO */}
        <SectionLabel title="Histórico" />
        <View style={{ paddingLeft: S.xs }}>
          {IDENTITY.historico.map((item, idx) => (
            <TimelineItem
              key={item.id}
              iconName={HISTORICO_ICON[item.type] ?? "activity"}
              label={item.typeLabel}
              desc={`${item.desc} · v${item.version}`}
              date={item.date}
              isLast={idx === IDENTITY.historico.length - 1}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.navigate("/all-identity")}
          activeOpacity={0.7}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.xs, marginTop: S.lg, paddingVertical: S.md, backgroundColor: C.surface, borderRadius: R.xl }}
        >
          <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>Ver todas</Text>
          <Feather name="chevron-right" size={I.sm} color={C.textTertiary} />
        </TouchableOpacity>
      </ScrollView>

      <IdentityShareSheet sheetRef={shareSheetRef} />
    </>
  );
}
