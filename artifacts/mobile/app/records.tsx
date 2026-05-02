import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { MODULES } from "@/constants/data";
import { R, S, F, I, IconBox } from "@/components/shared";

const C = colors.light;

const MODULE_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  fuel: "droplet",
  tire: "disc",
  bonds: "users",
};

export default function RecordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSelect = (id: string) => {
    if (id === "bonds") {
      router.push("/all-bonds");
    } else {
      router.push("/activities");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: topPad + S.lg, paddingBottom: S.xxxl + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginBottom: S.xl }}>
          <Feather name="arrow-left" size={I.lg} color={C.textSecondary} />
        </TouchableOpacity>

        <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xxl }}>Registros</Text>

        {/* MODULE GRID */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: S.md }}>
          {MODULES.map(({ id, label, desc }) => (
            <TouchableOpacity
              key={id}
              onPress={() => handleSelect(id)}
              activeOpacity={0.8}
              style={{ width: "47%", backgroundColor: C.background, borderRadius: R.xl, padding: S.lg, borderWidth: 1, borderColor: C.border }}
            >
              <View style={{ marginBottom: S.sm + 2 }}>
                <IconBox iconType={MODULE_ICONS[id] ?? "activity"} size={I.xxl} boxSize={42} radius={R.md} />
              </View>
              <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{label}</Text>
              <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: S.xs }}>{desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
