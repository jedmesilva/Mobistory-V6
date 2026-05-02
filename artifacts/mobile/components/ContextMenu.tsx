import React from "react";
import * as ContextMenuPrimitive from "zeego/context-menu";
import * as DropdownMenuPrimitive from "zeego/dropdown-menu";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";

const C = colors.light;

export interface ContextMenuItem {
  key: string;
  title: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export interface ContextMenuSection {
  items: ContextMenuItem[];
}

interface Props {
  sections: ContextMenuSection[];
  children: React.ReactNode;
  mode?: "context" | "dropdown";
}

export function ContextMenu({ sections, children, mode = "context" }: Props) {
  if (mode === "dropdown") {
    return (
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger>{children}</DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Content>
          {sections.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              {sectionIndex > 0 && <DropdownMenuPrimitive.Separator />}
              {section.items.map((item) => (
                <DropdownMenuPrimitive.Item
                  key={item.key}
                  onSelect={item.onPress}
                  disabled={item.disabled}
                  destructive={item.destructive}
                >
                  <DropdownMenuPrimitive.ItemTitle
                    style={{ color: item.destructive ? C.destructive : C.text }}
                  >
                    {item.title}
                  </DropdownMenuPrimitive.ItemTitle>
                  {item.icon && (
                    <DropdownMenuPrimitive.ItemIcon
                      ios={{
                        name: featherToSF(item.icon),
                        pointSize: 16,
                      }}
                    />
                  )}
                </DropdownMenuPrimitive.Item>
              ))}
            </React.Fragment>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Root>
    );
  }

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger>{children}</ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Content>
        {sections.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            {sectionIndex > 0 && <ContextMenuPrimitive.Separator />}
            {section.items.map((item) => (
              <ContextMenuPrimitive.Item
                key={item.key}
                onSelect={item.onPress}
                disabled={item.disabled}
                destructive={item.destructive}
              >
                <ContextMenuPrimitive.ItemTitle
                  style={{ color: item.destructive ? C.destructive : C.text }}
                >
                  {item.title}
                </ContextMenuPrimitive.ItemTitle>
                {item.icon && (
                  <ContextMenuPrimitive.ItemIcon
                    ios={{
                      name: featherToSF(item.icon),
                      pointSize: 16,
                    }}
                  />
                )}
              </ContextMenuPrimitive.Item>
            ))}
          </React.Fragment>
        ))}
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Root>
  );
}

function featherToSF(icon: React.ComponentProps<typeof Feather>["name"]): string {
  const map: Partial<Record<React.ComponentProps<typeof Feather>["name"], string>> = {
    edit: "pencil",
    "edit-2": "pencil",
    "edit-3": "pencil",
    trash: "trash",
    "trash-2": "trash",
    share: "square.and.arrow.up",
    "share-2": "square.and.arrow.up",
    copy: "doc.on.doc",
    star: "star",
    heart: "heart",
    bookmark: "bookmark",
    download: "arrow.down.circle",
    upload: "arrow.up.circle",
    link: "link",
    eye: "eye",
    "eye-off": "eye.slash",
    lock: "lock",
    unlock: "lock.open",
    settings: "gearshape",
    info: "info.circle",
    "alert-circle": "exclamationmark.circle",
    "check-circle": "checkmark.circle",
    "x-circle": "xmark.circle",
    plus: "plus",
    minus: "minus",
    search: "magnifyingglass",
    user: "person",
    users: "person.2",
    home: "house",
    flag: "flag",
    bell: "bell",
    mail: "envelope",
    phone: "phone",
    map: "map",
    camera: "camera",
    image: "photo",
    file: "doc",
    folder: "folder",
    calendar: "calendar",
    clock: "clock",
    activity: "chart.line.uptrend.xyaxis",
    zap: "bolt",
    refresh: "arrow.clockwise",
    "refresh-cw": "arrow.clockwise",
    "log-out": "rectangle.portrait.and.arrow.right",
    "log-in": "rectangle.portrait.and.arrow.left",
  };
  return map[icon] ?? "ellipsis";
}
