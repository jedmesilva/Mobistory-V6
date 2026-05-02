import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { C, R, S, F, I } from "@/constants/theme";

export { C, R, S, F, I };

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface BackButtonProps {
  onPress: (e: GestureResponderEvent) => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ padding: S.xs, alignSelf: "flex-start" }}>
      <Feather name="arrow-left" size={I.xl} color={C.textSecondary} />
    </TouchableOpacity>
  );
}

export function getActivityIcon(iconType: string): FeatherName {
  switch (iconType) {
    case "fuel": return "droplet";
    case "gauge": return "disc";
    case "user": return "user";
    case "file": return "file-text";
    case "clock": return "clock";
    case "check": return "check-circle";
    case "shield": return "shield";
    default: return "activity";
  }
}

interface IconBoxProps {
  iconType: FeatherName;
  size?: number;
  boxSize?: number;
  radius?: number;
  bgColor?: string;
  iconColor?: string;
}

export function IconBox({ iconType, size = I.xl, boxSize = 44, radius = R.md, bgColor = C.iconBg, iconColor = C.iconColor }: IconBoxProps) {
  return (
    <View style={{ width: boxSize, height: boxSize, borderRadius: radius, backgroundColor: bgColor, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Feather name={iconType} size={size} color={iconColor} />
    </View>
  );
}

interface SectionLabelProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionLabel({ title, actionLabel, onAction }: SectionLabelProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: S.md }}>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary, letterSpacing: 1, textTransform: "uppercase" as const }}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={{ fontSize: F.sm, fontWeight: "500" as const, color: C.accentForeground === C.textInverse ? C.primary : C.textSecondary }}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface VerifiedBadgeProps {
  label?: string;
  small?: boolean;
}

export function VerifiedBadge({ label = "Verificado", small = false }: VerifiedBadgeProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.successBg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.sm }}>
      <Feather name="check-circle" size={small ? 9 : I.xs} color={C.success} />
      <Text style={{ fontSize: small ? F.xxs : F.xs, fontWeight: "600" as const, color: C.success }}>{label}</Text>
    </View>
  );
}

interface ActiveBadgeProps {
  active: boolean;
}

export function ActiveBadge({ active }: ActiveBadgeProps) {
  if (active) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.successBg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.md }}>
        <Feather name="check-circle" size={I.xs} color={C.success} />
        <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.success }}>Ativo</Text>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: C.iconBg, borderRadius: R.pill, paddingVertical: 3, paddingHorizontal: S.md }}>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textTertiary }}>Encerrado</Text>
    </View>
  );
}

interface ActionButtonSquareProps {
  iconName: FeatherName;
  label: string;
  onPress?: () => void;
}

export function ActionButtonSquare({ iconName, label, onPress }: ActionButtonSquareProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ flex: 1, alignItems: "center", gap: S.sm, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: S.lg, paddingHorizontal: S.sm }}>
      <View style={{ width: 40, height: 40, borderRadius: R.md, backgroundColor: C.iconBg, alignItems: "center", justifyContent: "center" }}>
        <Feather name={iconName} size={I.xl} color={C.iconColor} />
      </View>
      <Text style={{ fontSize: F.xs, fontWeight: "600" as const, color: C.textSecondary }}>{label}</Text>
    </TouchableOpacity>
  );
}

interface TimelineItemProps {
  iconName: FeatherName;
  label: string;
  desc: string;
  date: string;
  isLast?: boolean;
  iconColor?: string;
}

export function TimelineItem({ iconName, label, desc, date, isLast = false, iconColor = C.success }: TimelineItemProps) {
  return (
    <View style={{ flexDirection: "row", gap: S.lg, marginBottom: isLast ? 0 : S.xl }}>
      <View style={{ alignItems: "center" }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" }}>
          <Feather name={iconName} size={I.md} color={iconColor} />
        </View>
        {!isLast && <View style={{ width: 1, flex: 1, backgroundColor: C.border, marginTop: 4 }} />}
      </View>
      <View style={{ flex: 1, paddingTop: S.xs }}>
        <Text style={{ fontSize: F.base, fontWeight: "600" as const, color: C.textPrimary }}>{label}</Text>
        <Text style={{ fontSize: F.sm, color: C.textSecondary, marginTop: 2 }}>{desc}</Text>
        <Text style={{ fontSize: F.xs, color: C.textTertiary, marginTop: S.xs }}>{date}</Text>
      </View>
    </View>
  );
}
