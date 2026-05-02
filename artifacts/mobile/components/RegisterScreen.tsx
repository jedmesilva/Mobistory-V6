import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { REGISTER_MODULES } from "@/constants/data";
import { R, S, F, I, IconBox, BackButton } from "@/components/shared";

const C = colors.light;

const MODULE_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  fuel: "droplet",
  tire: "disc",
  bonds: "user",
};

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - S.xl * 2 - S.md) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: topPad + S.lg, paddingBottom: S.xxxl + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={() => router.back()} />

        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xxl }}>
          Registrar evento
        </Text>

        {/* AI CAPTURE CARD */}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}
          style={{ backgroundColor: "#111827", borderRadius: R.xxl, padding: S.xl, marginBottom: S.xxl }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.sm, marginBottom: S.md }}>
            <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" }}>
              <Feather name="camera" size={I.xl} color="#FFFFFF" />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
              <Feather name="zap" size={I.xs} color="#E5E7EB" />
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: "#E5E7EB", letterSpacing: 0.5 }}>Assistido por IA</Text>
            </View>
          </View>
          <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: "#FFFFFF", marginBottom: S.xs }}>Captura inteligente</Text>
          <Text style={{ fontSize: F.sm, color: "#9CA3AF", lineHeight: 20 }}>Tire uma foto e a IA identifica o evento e preenche tudo por você</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.xs, marginTop: S.lg, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: R.xl, paddingVertical: S.md, paddingHorizontal: S.lg }}>
            <Feather name="camera" size={I.md} color="#FFFFFF" />
            <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: "#FFFFFF" }}>Abrir câmera</Text>
          </View>
        </TouchableOpacity>

        {/* DIVIDER */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, marginBottom: S.lg }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const }}>ou registre manualmente</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        {/* MODULE GRID */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: S.md }}>
          {REGISTER_MODULES.map(({ id, label, desc }) => (
            <TouchableOpacity
              key={id}
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={{
                width: cardWidth,
                backgroundColor: C.surface,
                borderRadius: R.xl,
                padding: S.lg,
              }}
            >
              <View style={{ marginBottom: S.sm + 2 }}>
                <IconBox
                  iconType={MODULE_ICONS[id] ?? "activity"}
                  size={I.xxl}
                  boxSize={42}
                  radius={R.md}
                />
              </View>
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>
                {label}
              </Text>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: S.xs }}>
                {desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
