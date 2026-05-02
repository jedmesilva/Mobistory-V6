import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform, Dimensions, Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { MY_VEHICLES } from "@/constants/data";
import { R, S, F, I } from "@/components/shared";

const C = colors.light;

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const ACTIVITY_TYPES: { id: string; icon: FeatherName; label: string }[] = [
  { id: "fuel",        icon: "droplet",   label: "Abastecimento" },
  { id: "tire",        icon: "disc",      label: "Calibragem"    },
  { id: "oil",         icon: "thermometer", label: "Troca de óleo" },
  { id: "maintenance", icon: "tool",      label: "Manutenção"    },
  { id: "inspection",  icon: "shield",    label: "Inspeção"      },
  { id: "parts",       icon: "settings",  label: "Peças"         },
  { id: "document",    icon: "file-text", label: "Documentação"  },
  { id: "wash",        icon: "wind",      label: "Lavagem"       },
];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedVehicleId, setSelectedVehicleId] = useState(MY_VEHICLES[0].id);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const vehicle = MY_VEHICLES.find(v => v.id === selectedVehicleId) ?? MY_VEHICLES[0];

  const screenWidth = Dimensions.get("window").width;
  const gap = S.md;
  const hPad = S.xl;
  const colCount = 3;
  const cardWidth = (screenWidth - hPad * 2 - gap * (colCount - 1)) / colCount;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>

      {/* ── HEADER ── */}
      <View style={{
        paddingTop: topPad + S.sm,
        paddingBottom: S.md,
        paddingHorizontal: S.xl,
        backgroundColor: C.background,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        flexDirection: "row",
        alignItems: "center",
        gap: S.md,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{ width: 40, height: 40, borderRadius: R.xl, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="x" size={I.lg} color={C.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowVehicleSelector(true)}
          activeOpacity={0.7}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: F.lg, fontWeight: "700" as const, color: C.textPrimary }}>Novo Registro</Text>
            <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 1 }} numberOfLines={1}>
              {vehicle.name} · {vehicle.plate} · {vehicle.year}
            </Text>
          </View>
          <Feather name="chevron-down" size={I.lg} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: hPad, paddingTop: S.lg, paddingBottom: bottomPad + S.xxxl }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── CAPTURA RÁPIDA ── */}
        <TouchableOpacity activeOpacity={0.85}
          style={{ backgroundColor: "#111827", borderRadius: R.xxl, padding: S.lg, marginBottom: S.xxl }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, marginBottom: S.lg }}>
            <View style={{ width: 48, height: 48, backgroundColor: "#FFFFFF", borderRadius: R.xl, alignItems: "center", justifyContent: "center" }}>
              <Feather name="zap" size={I.xl} color="#111827" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: S.xs, marginBottom: S.xs }}>
                <Text style={{ fontSize: F.base, fontWeight: "700" as const, color: "#FFFFFF" }}>Captura Rápida</Text>
                <View style={{ backgroundColor: "#3B82F6", borderRadius: R.pill, paddingVertical: 2, paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: F.xxs, fontWeight: "700" as const, color: "#FFFFFF" }}>com IA</Text>
                </View>
              </View>
              <Text style={{ fontSize: F.xs, color: "#9CA3AF" }}>Tire uma foto e deixe a IA extrair todos os dados</Text>
              <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: "#4ADE80", marginTop: 4 }}>2 capturas grátis disponíveis</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.85}
            style={{ backgroundColor: "#FFFFFF", borderRadius: R.xl, paddingVertical: S.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.xs }}
          >
            <Feather name="camera" size={I.lg} color="#111827" />
            <Text style={{ fontSize: F.sm, fontWeight: "700" as const, color: "#111827" }}>Capturar</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── DIVIDER ── */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: S.md, marginBottom: S.lg }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ fontSize: F.xs, color: C.textTertiary, fontWeight: "500" as const }}>ou registre manualmente</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        {/* ── GRID 3 COLUNAS ── */}
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

      {/* ── VEHICLE SELECTOR MODAL ── */}
      <Modal visible={showVehicleSelector} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setShowVehicleSelector(false)}
        >
          <View style={{ backgroundColor: C.background, borderTopLeftRadius: R.xxxl, borderTopRightRadius: R.xxxl, padding: S.xl, paddingBottom: bottomPad + S.xl }}>
            <View style={{ width: 40, height: 4, backgroundColor: C.separator, borderRadius: R.pill, alignSelf: "center", marginBottom: S.xl }} />
            <Text style={{ fontSize: F.xl, fontWeight: "700" as const, color: C.textPrimary, marginBottom: S.lg }}>Selecionar veículo</Text>
            {MY_VEHICLES.map(v => {
              const active = v.id === selectedVehicleId;
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => { setSelectedVehicleId(v.id); setShowVehicleSelector(false); }}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: S.md,
                    paddingVertical: S.md, paddingHorizontal: S.lg,
                    borderRadius: R.xl,
                    backgroundColor: active ? C.surface : "transparent",
                    marginBottom: S.xs,
                  }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: R.xl, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" }}>
                    <Feather name="car" size={I.xl} color={C.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{v.name} {v.version}</Text>
                    <Text style={{ fontSize: F.sm, color: C.textTertiary }}>{v.plate} · {v.year}</Text>
                  </View>
                  {active && <Feather name="check" size={I.lg} color={C.textPrimary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
