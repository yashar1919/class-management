import React, { useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown, message } from "antd";
import type { ReactNode } from "react";
//import { useTheme } from "../../../context/ThemeContext";

interface DropdownFieldProps {
  label?: string; // Placeholder/floating label
  icon?: ReactNode; // ثابت کنار فیلد
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
  // Use controlled value if provided, otherwise fallback to internal state
  const actualSelected = typeof value === "string" ? value : selected;
  const [focused, setFocused] = useState(false);

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
  const isFloating = focused || !!actualSelected;
  const labelColor = focused ? "text-teal-500" : "text-gray-400";
  //const borderColor = focused ? "border-blue-600" : "border-gray-300";
  const borderColor = error
    ? "border-red-500"
    : focused
    ? "border-teal-500"
    : "border-gray-300";

  //const { theme } = useTheme();

  return (
    <div className="w-full relative">
      {/* آیکون ثابت سمت چپ */}
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none z-20">
          {icon}
        </span>
      )}
      {/* Floating Label */}
      {/* <span
        className={`
          absolute transition-all duration-300 pointer-events-none z-10 ${
            theme === "dark" ? "bg-[#1e2636]" : "bg-white"
          } px-1
          text-xs font-normal
          ${labelColor}
        `}
        style={{
          left: isFloating ? "1rem" : "2.2rem",
          top: isFloating ? "-0.75rem" : "50%",
          transform: isFloating ? "none" : "translateY(-50%)",
          fontStyle: isFloating ? "italic" : undefined,
        }}
      >
        {label}
      </span> */}
      <span
        className={`
    absolute transition-all duration-300 pointer-events-none z-10
    text-xs font-normal
    px-2
    ${labelColor}
    ${isFloating ? "bg-slate-800" : ""}
  `}
        style={{
          left: isFloating ? "0.75rem" : "2.2rem",
          top: isFloating ? "-0.7rem" : "50%",
          transform: isFloating ? "none" : "translateY(-50%)",
          fontStyle: isFloating ? "italic" : undefined,
        }}
      >
        {label}
      </span>
      <Dropdown
        menu={menuProps}
        className="w-full"
        onOpenChange={(open) => setFocused(open)}
        //open={true}
      >
        <Button
          className={`w-full flex items-center relative pt-6 pb-2 ${borderColor}`}
          style={{
            textAlign: "left",
            height: 40,
            borderColor: focused ? "#14b8a6" : error ? "#ef4444" : "#d1d5db",
            paddingRight: 16,
            backgroundColor: "transparent",
            // backgroundColor: theme === "dark" ? "#1e2636" : "white",
            color: "white",
            // color: theme === "dark" ? "white" : "black",
            borderRadius: "10px",
            paddingLeft: icon ? 40 : 16,
            ...(error && { borderColor: "#ef4444", borderWidth: 1 }),
          }}
        >
          <DownOutlined className="absolute right-4" />
          <span className="w-full text-left pr-6">
            {actualSelected ? actualSelected : ""}
          </span>
        </Button>
      </Dropdown>
    </div>
  );
};

export default DropdownField;
