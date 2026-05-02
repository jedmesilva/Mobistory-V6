import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import { ActivityItem, EVENT_DETAILS } from "@/constants/data";
import { R, S, F, I, IconBox, getActivityIcon, TimelineItem, BackButton, MoreOptionsButton } from "@/components/shared";

const C = colors.light;

interface Props {
  event: ActivityItem;
}

export default function EventDetailScreen({ event }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const details = EVENT_DETAILS[event.id] || { fields: [], location: null, subevents: [] };

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: S.xl, paddingTop: topPad + S.lg, paddingBottom: S.xxxl + 20 }}
      >
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.xxl }}>
          <BackButton onPress={() => router.back()} />
          <Text style={{ flex: 1, fontSize: F.xxl, fontWeight: "700" as const, color: C.textPrimary, marginLeft: S.md }} numberOfLines={1}>
            {event.title}
          </Text>
          <MoreOptionsButton
            topOffset={topPad + 52}
            actions={[
              { label: "Editar evento", icon: "edit-2" },
              { label: "Compartilhar", icon: "share-2" },
              { label: "Excluir evento", icon: "trash-2", destructive: true },
            ]}
          />
        </View>

        {/* HERO */}
        <View style={{ backgroundColor: C.surface, borderRadius: R.xxl, padding: S.xl, marginBottom: S.md, flexDirection: "row", alignItems: "center", gap: S.lg }}>
          <View style={{ width: 56, height: 56, borderRadius: R.xl, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
            <Feather name={getActivityIcon(event.iconType)} size={I.xxl} color={C.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: S.xs }}>
              {event.type}
            </Text>
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

        {/* SUB-EVENTS TIMELINE */}
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

    </View>
  );
}
