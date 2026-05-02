import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { REGISTER_MODULES } from "@/constants/data";
import { R, S, F, I, IconBox } from "@/components/shared";

const C = colors.light;

const MODULE_ICONS: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
  fuel: "droplet",
  tire: "disc",
  bonds: "user",
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function RegisterScreen({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.surface }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: S.xxxl + 20 }}>

            {/* HEADER */}
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ marginTop: S.lg, marginBottom: S.xl }}>
              <Feather name="arrow-left" size={I.lg} color={C.textSecondary} />
            </TouchableOpacity>

            <Text style={{ fontSize: F.hero, fontWeight: "700" as const, color: C.textPrimary, letterSpacing: -0.5, marginBottom: S.xxl }}>Registrar evento</Text>

            {/* AI CAPTURE CARD */}
            <TouchableOpacity onPress={onClose} activeOpacity={0.85}
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

            {/* MODULE LIST */}
            <View>
              {REGISTER_MODULES.map(({ id, label, desc }, idx) => (
                <TouchableOpacity key={id} onPress={onClose} activeOpacity={0.7}
                  style={{ flexDirection: "row", alignItems: "center", gap: S.lg, paddingVertical: S.lg, borderBottomWidth: idx < REGISTER_MODULES.length - 1 ? 1 : 0, borderBottomColor: C.border }}>
                  <IconBox iconType={MODULE_ICONS[id] ?? "activity"} size={I.xl} boxSize={44} radius={R.md} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: F.xl, fontWeight: "600" as const, color: C.textPrimary }}>{label}</Text>
                    <Text style={{ fontSize: F.sm, color: C.textTertiary, marginTop: 2 }}>{desc}</Text>
                  </View>
                  <Feather name="chevron-right" size={I.lg} color={C.separator} />
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
