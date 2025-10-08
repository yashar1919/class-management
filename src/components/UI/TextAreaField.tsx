import React, { useState } from "react";
import { Input } from "antd";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

interface TextAreaFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  maxLength?: number;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  placeholder = "",
  value,
  onChange,
  rows = 4,
  maxLength,
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
    <div className={`relative w-full ${className}`}>
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
      <TextArea
        dir={inputDir}
        style={{
          borderRadius: "10px",
          borderColor: error ? "#ef4444" : focused ? "#00bba7" : undefined,
          textAlign: inputTextAlign,
          resize: "vertical",
        }}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
        className={`transition-all duration-300 pt-6 pb-2 ${
          error ? "input-error-placeholder" : ""
        }`}
        disabled={disabled}
      />
    </div>
  );
};

export default TextAreaField;
