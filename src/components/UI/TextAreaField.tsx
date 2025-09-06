import React, { useState } from "react";
import { Input } from "antd";
//import { useTheme } from "../../../context/ThemeContext";

const { TextArea } = Input;

interface TextAreaFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  maxLength?: number;
  error?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  placeholder = "",
  value,
  onChange,
  rows = 4,
  maxLength,
  error,
}) => {
  const [focused, setFocused] = useState(false);

  const isFloating = focused || (!!value && value.length > 0);
  const labelColor = focused ? "text-custom-primary-500" : "text-gray-400";
  const borderColor = focused ? "border-blue-600" : "border-gray-300";
  //const { theme } = useTheme();

  return (
    <div className="relative w-full">
      <span
        className={`
          absolute transition-all duration-300 pointer-events-none z-10 px-1
          text-xs font-normal
          ${labelColor}
        `}
        /* className={`
          absolute transition-all duration-300 pointer-events-none z-10 ${
            theme === "dark" ? "bg-[#1e2636]" : "bg-white"
          } px-1
          text-xs font-normal
          ${labelColor}
        `} */
        style={{
          left: "1rem",
          top: isFloating ? "-0.75rem" : "18%",
          fontStyle: isFloating ? "italic" : undefined,
          transform: isFloating ? "none" : "translateY(-50%)",
        }}
      >
        {placeholder}
      </span>
      <TextArea
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
        className={`w-full rounded-2xl pt-6 pb-2 ${borderColor}`}
        style={{
          resize: "vertical",
          borderRadius: "10px",
          backgroundColor: "white",
          //backgroundColor: theme === "dark" ? "#1e2636" : "white",
          color: "black",
          //color: theme === "dark" ? "white" : "black",
          ...(error && { borderColor: "#ef4444", borderWidth: 1 }),
        }}
      />
    </div>
  );
};

export default TextAreaField;
