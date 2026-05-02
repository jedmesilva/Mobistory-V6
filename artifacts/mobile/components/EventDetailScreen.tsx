import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { ActivityItem, EVENT_DETAILS } from "@/constants/data";
import { R, S, F, I, IconBox, getActivityIcon, TimelineItem } from "@/components/shared";

const C = colors.light;

interface Props {
  event: ActivityItem | null;
  onClose: () => void;
}

export default function EventDetailScreen({ event, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!event) return null;

  const details = EVENT_DETAILS[event.id] || { fields: [], location: null, subevents: [] };

  return (
    <Modal visible={!!event} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.background }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: S.xl, paddingBottom: S.xxxl + 20 }}>

            {/* HEADER */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: S.lg, marginBottom: S.xxl }}>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={{ padding: S.xs }}>
                <Feather name="arrow-left" size={I.lg} color={C.textSecondary} />
              </TouchableOpacity>
              <Text style={{ flex: 1, fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary, marginLeft: S.md }} numberOfLines={1}>{event.title}</Text>
              <TouchableOpacity onPress={() => setMenuOpen(true)} activeOpacity={0.7} style={{ padding: S.xs }}>
                <Feather name="more-vertical" size={I.xxl} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* HERO */}
            <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md, flexDirection: "row", alignItems: "center", gap: S.lg }}>
              <View style={{ width: 56, height: 56, borderRadius: R.xl, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
                <Feather name={getActivityIcon(event.iconType)} size={I.xxl} color={C.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.xs }}>{event.type}</Text>
                <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{event.date}</Text>
                <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{event.time}</Text>
              </View>
              {event.subcount > 0 && (
                <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: S.md }}>
                  <Text style={{ fontSize: F.xs, fontWeight: "700" as const, color: C.textTertiary }}>+{event.subcount} eventos</Text>
                </View>
              )}
            </View>

            {/* DETAILS */}
            {details.fields.length > 0 && (
              <>
                <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.md, marginTop: S.xl }}>Detalhes</Text>
                <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, overflow: "hidden", marginBottom: S.md }}>
                  {details.fields.map(({ label, value }, i) => (
                    <View key={label} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: S.md, paddingHorizontal: S.xl, borderBottomWidth: i < details.fields.length - 1 ? 1 : 0, borderBottomColor: C.border }}>
                      <Text style={{ fontSize: F.sm, color: C.textSecondary, fontWeight: "500" as const }}>{label}</Text>
                      <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textPrimary }}>{value}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* LOCATION */}
            {details.location && (
              <>
                <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.md, marginTop: S.xl }}>Local</Text>
                <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.lg, flexDirection: "row", alignItems: "center", gap: S.md, marginBottom: S.md }}>
                  <IconBox iconType="map-pin" size={I.lg} boxSize={40} radius={R.md} />
                  <Text style={{ fontSize: F.sm, fontWeight: "500" as const, color: C.textPrimary, flex: 1, lineHeight: 20 }}>{details.location}</Text>
                </View>
              </>
            )}

            {/* SUBEVENTS TIMELINE */}
            {details.subevents.length > 0 && (
              <>
                <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.lg, marginTop: S.xl }}>Histórico do evento</Text>
                <View>
                  {details.subevents.map((se, idx) => (
                    <TimelineItem
                      key={se.id}
                      iconName={getActivityIcon(se.iconType)}
                      label={se.title}
                      desc={se.desc}
                      date={`${se.date} · ${se.time}`}
                      isLast={idx === details.subevents.length - 1}
                    />
                  ))}
                </View>
              </>
            )}

            {/* ACTIONS */}
            <View style={{ flexDirection: "row", gap: S.sm, marginTop: S.xl }}>
              <TouchableOpacity activeOpacity={0.7} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: C.surface, borderRadius: R.xl, padding: S.md }}>
                <Feather name="share-2" size={I.lg} color={C.textSecondary} />
                <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.textSecondary }}>Compartilhar</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.sm, backgroundColor: "#FEF2F2", borderRadius: R.xl, padding: S.md }}>
                <Feather name="x" size={I.lg} color={C.destructive} />
                <Text style={{ fontSize: F.sm, fontWeight: "600" as const, color: C.destructive }}>Excluir</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </SafeAreaView>

        {/* MENU MODAL */}
        <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} activeOpacity={1}>
            <View style={{ position: "absolute", top: insets.top + 80, right: S.xl, backgroundColor: C.surface, borderRadius: R.xl, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, elevation: 8, minWidth: 200, overflow: "hidden" }}>
              {[
                { label: "Editar evento", color: C.textPrimary },
                { label: "Compartilhar", color: C.textPrimary },
                { label: "Excluir evento", color: C.destructive },
              ].map(({ label, color }) => (
                <TouchableOpacity key={label} onPress={() => setMenuOpen(false)} activeOpacity={0.7} style={{ paddingVertical: S.md, paddingHorizontal: S.lg }}>
                  <Text style={{ fontSize: F.base, fontWeight: "500" as const, color }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}
