import React, { useState } from "react";
import { Input } from "antd";
import { useTranslation } from "react-i18next";

interface InputFieldProps {
  placeholder?: string;
  prefix?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  prefix,
  value,
  onChange,
  type = "text",
  error,
  disabled = false,
  className = "",
}) => {
  const [focused, setFocused] = useState(false);
  const { i18n } = useTranslation();

  const isFloating = focused || (!!value && value.length > 0);
  const labelColor = error
    ? "text-red-500"
    : focused
    ? "text-teal-500"
    : "text-gray-400";

  // تعیین جهت و تراز بر اساس زبان
  const isRTL = i18n.language === "fa";
  const inputDir = isRTL ? "rtl" : "ltr";
  const inputTextAlign = isRTL ? "right" : "left";
  const labelLeft = isRTL ? undefined : isFloating ? "0.75rem" : "2.2rem";
  const labelRight = isRTL ? (isFloating ? "0.75rem" : "2.2rem") : undefined;

  return (
    <div className="relative">
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
        {placeholder}
      </span>
      <Input
        dir={inputDir}
        style={{
          borderRadius: "10px",
          borderColor: error ? "#ef4444" : focused ? "#00bba7" : undefined,
          textAlign: inputTextAlign,
        }}
        size="large"
        prefix={
          prefix ? <span className="text-gray-400">{prefix}</span> : undefined
        }
        value={value}
        onChange={onChange}
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`transition-all duration-300 pt-6 pb-2 ${
          error ? "input-error-placeholder" : ""
        } ${className}`}
        disabled={disabled}
      />
    </div>
  );
};

export default InputField;
