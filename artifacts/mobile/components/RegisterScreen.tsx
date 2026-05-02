import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { R, S, F, I, BackButton } from "@/components/shared";

const C = colors.light;

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const ACTIVITY_TYPES: { id: string; icon: FeatherName; label: string }[] = [
  { id: "fuel",        icon: "droplet",     label: "Abastecimento" },
  { id: "tire",        icon: "disc",        label: "Calibragem"    },
  { id: "oil",         icon: "thermometer", label: "Troca de óleo" },
  { id: "maintenance", icon: "tool",        label: "Manutenção"    },
  { id: "inspection",  icon: "shield",      label: "Inspeção"      },
  { id: "parts",       icon: "settings",    label: "Peças"         },
  { id: "document",    icon: "file-text",   label: "Documentação"  },
  { id: "wash",        icon: "wind",        label: "Lavagem"       },
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const gap = S.md;
  const hPad = S.xl;
  const cardWidth = (screenWidth - hPad * 2 - gap * 2) / 3;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: hPad, paddingTop: topPad + S.lg, paddingBottom: S.xxxl + 20 }}
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

        {/* GRID 3 COLUNAS */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
          {ACTIVITY_TYPES.map(({ id, icon, label }) => {
            const active = selectedActivity === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setSelectedActivity(id)}
                activeOpacity={0.75}
                style={{
                  width: cardWidth,
                  backgroundColor: C.background,
                  borderRadius: R.xl,
                  borderWidth: 2,
                  borderColor: active ? C.textPrimary : C.border,
                  padding: S.md,
                  alignItems: "center",
                }}
              >
                <View style={{ backgroundColor: C.surface, borderRadius: R.lg, padding: S.md, marginBottom: S.xs }}>
                  <Feather name={icon} size={I.xl} color={C.textSecondary} />
                </View>
                <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textPrimary, textAlign: "center" as const }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
