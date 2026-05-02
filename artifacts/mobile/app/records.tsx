import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  Platform, Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { MODULES } from "@/constants/data";
import { R, S, F, I, IconBox, BackButton } from "@/components/shared";

const C = colors.light;

const MODULE_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  fuel: "droplet",
  tire: "disc",
  bonds: "users",
};

export default function RecordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - S.xl * 2 - S.md) / 2;

  const filtered = MODULES.filter(
    m =>
      m.label.toLowerCase().includes(query.toLowerCase()) ||
      m.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (id: string) => {
    if (id === "bonds") {
      router.push("/all-bonds");
    } else {
      router.push("/activities");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: S.xl,
          paddingTop: topPad + S.lg,
          paddingBottom: bottomPad + S.xxxl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* BACK */}
        <BackButton onPress={() => router.back()} />

        {/* TITLE */}
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

        {/* SEARCH BAR */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: S.md,
            backgroundColor: C.surface,
            borderRadius: R.xl,
            paddingVertical: S.md,
            paddingHorizontal: S.lg,
            marginBottom: S.xxl,
          }}
        >
          <Feather name="search" size={I.lg} color={C.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar registros..."
            placeholderTextColor={C.textTertiary}
            style={{ flex: 1, fontSize: F.base, color: C.textPrimary }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Feather name="x" size={I.sm} color={C.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* 2-COLUMN GRID */}
        {filtered.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: S.md }}>
            {filtered.map(({ id, label, desc }) => (
              <TouchableOpacity
                key={id}
                onPress={() => handleSelect(id)}
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
                <Text
                  style={{
                    fontSize: F.base,
                    fontWeight: "600",
                    color: C.textPrimary,
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    fontSize: F.xs,
                    color: C.textTertiary,
                    marginTop: S.xs,
                  }}
                >
                  {desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingVertical: S.xxxl,
              gap: S.sm,
            }}
          >
            <Feather name="search" size={I.xxxl} color={C.textTertiary} />
            <Text
              style={{
                fontSize: F.base,
                color: C.textTertiary,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              Nenhum resultado para "{query}"
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
