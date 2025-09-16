import React, { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown, message } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface DropdownFieldProps {
  label?: string; // Placeholder/floating label
  icon?: ReactNode; // آیکون کنار فیلد
  items: MenuProps["items"]; // Dropdown options
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  label = "Current Status",
  icon,
  items,
  value,
  onChange,
  error,
}) => {
  const [selected, setSelected] = useState<string>("");
  const actualSelected = typeof value === "string" ? value : selected;
  const [focused, setFocused] = useState(false);
  const isFloating = focused || !!actualSelected;
  const { i18n } = useTranslation();

  const isRTL = i18n.language === "fa";
  const inputDir = isRTL ? "rtl" : "ltr";
  const inputTextAlign = isRTL ? "right" : "left";
  const labelLeft = isRTL ? undefined : isFloating ? "0.75rem" : "2.2rem";
  const labelRight = isRTL ? (isFloating ? "0.75rem" : "2.2rem") : undefined;

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const validItems = (items ?? []).filter(
      (item): item is Exclude<typeof item, null> => item !== null
    );
    const found = validItems.find(
      (item) => "key" in item && item.key === e.key && "label" in item
    );
    if (found && "label" in found) {
      if (onChange) {
        onChange(found.label as string);
      } else {
        setSelected(found.label as string);
      }
    }
    message.info(`Selected: ${found && "label" in found ? found.label : ""}`);
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  // Floating label logic
  const labelColor = error
    ? "text-red-500"
    : focused
    ? "text-teal-500"
    : "text-gray-400";

  return (
    <div className="w-full relative" dir={inputDir}>
      {icon && (
        <span
          className={`absolute top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none z-20
            ${isRTL ? "right-3" : "left-3"}
          `}
        >
          {icon}
        </span>
      )}

      <span
        className={`
          absolute transition-all duration-300 pointer-events-none z-10
          text-xs font-normal px-2
          ${labelColor}
          ${isFloating ? "bg-[#141414]" : ""}
        `}
        style={{
          left: labelLeft,
          right: labelRight,
          top: isFloating ? "-0.7rem" : "50%",
          transform: isFloating ? "none" : "translateY(-50%)",
          fontStyle: isFloating ? "italic" : undefined,
          textAlign: inputTextAlign,
        }}
      >
        {label}
      </span>
      <Dropdown
        menu={menuProps}
        className="w-full"
        onOpenChange={(open) => setFocused(open)}
      >
        <Button
          size="small"
          className={`w-full flex items-center relative ${
            error
              ? "border-red-500"
              : focused
              ? "border-teal-500"
              : "border-gray-300"
          }`}
          style={{
            textAlign: inputTextAlign,
            height: 40,
            borderColor: focused ? "#14b8a6" : error ? "#ef4444" : undefined,
            borderRadius: "10px",
            paddingLeft: !isRTL && icon ? 40 : 16,
            paddingRight: isRTL && icon ? 40 : 16,
            ...(error && { borderColor: "#ef4444", borderWidth: 1 }),
          }}
        >
          {/* فلش را سمت مخالف آیکون قرار بده */}
          <span
            className={`flex-1 ${isRTL ? "text-right pl-6" : "text-left pr-6"}`}
            style={{ minHeight: 24 }}
          >
            {actualSelected ? actualSelected : ""}
          </span>
          {/* فلش وسط عمودی و ریز */}
          <span
            className={`absolute top-1/2 ${
              isRTL ? "left-4" : "right-4"
            } -translate-y-1/2`}
            style={{ fontSize: 12, pointerEvents: "none" }}
          >
            <DownOutlined />
          </span>
        </Button>
      </Dropdown>
    </div>
  );
};

export default DropdownField;
