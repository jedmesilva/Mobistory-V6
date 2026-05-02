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
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
        contentContainerStyle={{
          paddingHorizontal: S.xl,
          paddingTop: topPad + S.lg,
          paddingBottom: bottomPad + S.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* BACK */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{ marginBottom: S.xl, alignSelf: "flex-start" }}
        >
          <Feather name="arrow-left" size={I.lg} color={C.textSecondary} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: F.hero,
            fontWeight: "700",
            color: C.textPrimary,
            letterSpacing: -0.5,
            marginBottom: S.xxl,
          }}
        >
          Registros
        </Text>

        {/* MODULE LIST ROWS — mesma estética do RegisterScreen */}
        <View>
          {MODULES.map(({ id, label, desc }, idx) => (
            <TouchableOpacity
              key={id}
              onPress={() => handleSelect(id)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: S.lg,
                paddingVertical: S.lg,
                borderBottomWidth: idx < MODULES.length - 1 ? 1 : 0,
                borderBottomColor: C.border,
              }}
            >
              <IconBox
                iconType={MODULE_ICONS[id] ?? "activity"}
                size={I.xl}
                boxSize={44}
                radius={R.md}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: F.xl,
                    fontWeight: "600",
                    color: C.textPrimary,
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    fontSize: F.sm,
                    color: C.textTertiary,
                    marginTop: 2,
                  }}
                >
                  {desc}
                </Text>
              </View>
              <Feather name="chevron-right" size={I.lg} color={C.separator} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
