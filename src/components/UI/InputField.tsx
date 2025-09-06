import React, { useState } from "react";
import { Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
//import { useTheme } from "../../../context/ThemeContext";

/**
 * Custom InputField with animated floating placeholder/label
 * @param placeholder - The placeholder and floating label text
 * @param prefix - Optional icon
 * @param value - Controlled value
 * @param onChange - Change handler
 * @param type - Input type
 * @param error - Error state
 */
interface InputFieldProps {
  placeholder: string;
  prefix?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  prefix = <UserOutlined />,
  value,
  onChange,
  type = "text",
  error,
}) => {
  const [focused, setFocused] = useState(false);

  // آیا باید لیبل بالا باشد؟
  const isFloating = focused || (!!value && value.length > 0);

  // رنگ لیبل: فقط وقتی فوکوس است آبی، در غیر این صورت خاکستری
  const labelColor = focused ? "text-teal-500" : "text-gray-400";
  // رنگ بوردر: فقط وقتی فوکوس است آبی، در غیر این صورت خاکستری
  const borderColor = error
    ? "border-red-500"
    : focused
    ? "border-teal-500"
    : "border-gray-300";

  //const { theme } = useTheme();

  return (
    <div className="relative">
      {/* Floating Placeholder/Label */}
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
        {placeholder}
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
        {placeholder}
      </span>
      <Input
        style={{
          borderRadius: "10px",
          borderColor: focused ? "#14b8a6" : error ? "#ef4444" : "#d1d5db",
          backgroundColor: "transparent",
          //backgroundColor: theme === "dark" ? "#1e2636" : "white",
          color: "white",
          //color: theme === "dark" ? "white" : "black",
          ...(error ? { borderColor: "#ef4444", borderWidth: 1 } : undefined),
        }}
        size="large"
        placeholder=""
        prefix={
          prefix ? <span className="text-gray-400">{prefix}</span> : undefined
        }
        value={value}
        onChange={onChange}
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
           transition-all duration-300 pt-6 pb-2
          ${borderColor}
        `}
      />
    </div>
  );
};

export default InputField;
