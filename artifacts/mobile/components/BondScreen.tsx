import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";
import { VEHICLE, BOND_TIMELINE } from "@/constants/data";
import { R, S, F, I, getActivityIcon, TimelineItem, VerifiedBadge, ActiveBadge } from "@/components/shared";

const C = colors.light;

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenAllBonds: () => void;
}

export default function BondScreen({ visible, onClose, onOpenAllBonds }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: S.xxxl + 20 }}>

            {/* HEADER */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: S.lg, marginBottom: S.xl }}>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ padding: S.xs }}>
                <Feather name="arrow-left" size={I.lg} color={C.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuOpen(true)} activeOpacity={0.7} style={{ padding: S.xs }}>
                <Feather name="more-vertical" size={I.xxl} color={C.textSecondary} />
              </TouchableOpacity>
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
              <TouchableOpacity activeOpacity={0.7} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: S.md }}>
                <Feather name="share-2" size={I.lg} color={C.textSecondary} />
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
        </SafeAreaView>

        {/* CONTEXT MENU */}
        <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setMenuOpen(false)} activeOpacity={1}>
            <View style={{ position: "absolute", top: 100, right: S.xl, backgroundColor: C.surface, borderRadius: R.xl, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, elevation: 8, minWidth: 220, overflow: "hidden" }}>
              <TouchableOpacity onPress={() => { setMenuOpen(false); onClose(); onOpenAllBonds(); }} activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", gap: S.md, paddingVertical: S.md, paddingHorizontal: S.lg }}>
                <Feather name="users" size={I.lg} color={C.textSecondary} />
                <Text style={{ fontSize: F.base, fontWeight: "500" as const, color: C.textPrimary }}>Todos os vínculos</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}
