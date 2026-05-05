import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { VEHICLE, BOND_TIMELINE } from "@/constants/data";
import { R, S, F, I, getActivityIcon, TimelineItem, ActiveBadge, BackButton } from "@/components/shared";

const C = colors.light;

export default function BondScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleShare = async () => {
    try {
      await Share.share({ message: `Meu vínculo — ${VEHICLE.bond.type} · ${VEHICLE.name} · ${VEHICLE.plate}` });
    } catch (_) {}
  };

  const handleExport = () => {
    Alert.alert("Exportar vínculo", "Escolha o formato de exportação", [
      { text: "CSV", onPress: () => {} },
      { text: "PDF", onPress: () => {} },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: topPad + S.lg, paddingBottom: S.xxxl + 20 }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xl }}>
          <BackButton onPress={() => router.back()} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs }}>
            <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="share-2" size={I.xxl} color={C.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={{ padding: S.xs }}>
              <Feather name="download" size={I.xxl} color={C.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xxl }}>Meu vínculo</Text>

        {/* BOND CARD */}
        <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.lg }}>
            <View style={{ width: 48, height: 48, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Feather name="user" size={I.xxl} color={C.iconColor} />
            </View>
            <ActiveBadge active={true} />
          </View>
          <Text style={{ fontSize: F.xxxl, fontWeight: "700" as const, color: C.textPrimary }}>{VEHICLE.bond.type}</Text>
          <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: S.xs }}>{VEHICLE.name} · {VEHICLE.plate}</Text>
          <View style={{ height: 1, backgroundColor: C.border, marginVertical: S.lg }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const, marginBottom: S.xs }}>Desde</Text>
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>jan. 2023</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const, marginBottom: S.xs }}>Verificado em</Text>
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>15 jan. 2023</Text>
            </View>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={{ flexDirection: "row", gap: S.sm, marginBottom: S.xxl }}>
          <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: S.md }}>
            <Feather name="download" size={I.lg} color={C.textSecondary} />
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>Exportar vínculo</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: "#FEF2F2", borderRadius: R.xl, paddingVertical: S.md }}>
            <Feather name="user-x" size={I.lg} color={C.destructive} />
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.destructive }}>Desvincular</Text>
          </TouchableOpacity>
        </View>

        {/* TIMELINE */}
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.lg }}>Histórico do vínculo</Text>
        <View>
          {BOND_TIMELINE.map((item, idx) => (
            <TimelineItem
              key={item.id}
              iconName={getActivityIcon(item.type)}
              label={item.label}
              desc={item.desc}
              date={item.date}
              isLast={idx === BOND_TIMELINE.length - 1}
            />
          ))}
        </View>
      </ScrollView>

    </View>
  );
}
