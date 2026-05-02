import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { REGISTER_MODULES } from "@/constants/data";
import { R, S, F, I, BackButton } from "@/components/shared";

const C = colors.light;

const MODULE_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  fuel: "droplet",
  tire: "disc",
  bonds: "user",
};

const MODULE_COLORS: Record<string, string> = {
  fuel: "#FEF3C7",
  tire: "#E0E7FF",
  bonds: "#DCFCE7",
};

const MODULE_ICON_COLORS: Record<string, string> = {
  fuel: "#D97706",
  tire: "#4F46E5",
  bonds: "#16A34A",
};

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const rows: (typeof REGISTER_MODULES)[] = [];
  for (let i = 0; i < REGISTER_MODULES.length; i += 2) {
    rows.push(REGISTER_MODULES.slice(i, i + 2));
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
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
        <View style={{ gap: S.md }}>
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: "row", gap: S.md }}>
              {row.map(({ id, label, desc }) => {
                const icon = MODULE_ICONS[id] ?? "activity";
                const bgColor = MODULE_COLORS[id] ?? C.background;
                const iconColor = MODULE_ICON_COLORS[id] ?? C.textPrimary;
                const isAlone = row.length === 1;
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => router.back()}
                    activeOpacity={0.75}
                    style={{
                      flex: 1,
                      backgroundColor: C.background,
                      borderRadius: R.xxl,
                      padding: S.lg,
                      borderWidth: 1,
                      borderColor: C.border,
                      alignItems: isAlone ? "center" : "flex-start",
                      flexDirection: isAlone ? "row" : "column",
                      gap: S.md,
                    }}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: R.lg,
                      backgroundColor: bgColor,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Feather name={icon} size={I.xl} color={iconColor} />
                    </View>
                    <View style={{ flex: isAlone ? 1 : undefined }}>
                      <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary, marginBottom: 2 }}>
                        {label}
                      </Text>
                      <Text style={{ fontSize: F.xs, color: C.textTertiary, lineHeight: 16 }}>
                        {desc}
                      </Text>
                    </View>
                    {isAlone && (
                      <Feather name="chevron-right" size={I.lg} color={C.separator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
