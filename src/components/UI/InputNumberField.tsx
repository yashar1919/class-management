import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { InputNumber } from "antd";
import { useTranslation } from "react-i18next";

interface InputNumberFieldProps {
  placeholder?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  error?: boolean;
  min?: number;
  max?: number;
  formatter?: (value: string | number | undefined) => string;
  parser?: (value: string | undefined) => string | number | undefined;
  className?: string;
  disabled?: boolean;
}

const InputNumberField: React.FC<InputNumberFieldProps> = ({
  placeholder,
  value,
  onChange,
  addonBefore,
  addonAfter,
  error,
  min = 1,
  max,
  formatter,
  className = "",
  disabled = false,
}) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState<number | null>(
    value ?? (min >= 0 ? min : null)
  );
  const { i18n } = useTranslation();

  // Update internal value when prop value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const isRTL = i18n.language === "fa";
  const inputDir = isRTL ? "rtl" : "ltr";
  const inputTextAlign = isRTL ? "right" : "left";

  const currentValue = value !== undefined ? value : internalValue;

  const isFloating =
    focused || (currentValue !== null && currentValue !== undefined);
  const labelColor = error
    ? "text-red-500"
    : focused
      ? "text-teal-500"
      : "text-gray-400";

  // جای placeholder و addonها بر اساس زبان
  const labelLeft = isRTL
    ? undefined
    : isFloating
      ? addonBefore
        ? "2.5rem"
        : "0.75rem"
      : "2.2rem";
  const labelRight = isRTL
    ? isFloating
      ? addonAfter
        ? "2.5rem"
        : "2.5rem"
      : "2.2rem"
    : undefined;

  return (
    <div
      className={`relative w-full ${error ? "input-number-error" : ""}`}
      dir={inputDir}
    >
      {placeholder && (
        <span
          className={`
            absolute transition-all duration-300 pointer-events-none z-10 px-2
            text-xs font-normal
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
      )}
      <InputNumber
        size="large"
        className={`transition-all duration-200 ${
          error
            ? "border-red-500"
            : focused
              ? "border-teal-500"
              : "border-gray-300"
        } ${className}`}
        style={{
          width: "100%",
          borderRadius: "10px",
          textAlign: inputTextAlign,
          direction: inputDir,
        }}
        /* addonBefore={
          !isRTL && addonBefore ? (
            <span className="text-gray-400">{addonBefore}</span>
          ) : undefined
        }
        addonAfter={
          isRTL && addonAfter ? (
            <span className="text-gray-400">{addonAfter}</span>
          ) : undefined
        } */
        addonBefore={
          addonBefore ? (
            <span className="text-gray-400">{addonBefore}</span>
          ) : undefined
        }
        addonAfter={
          addonAfter ? (
            <span className="text-gray-400">{addonAfter}</span>
          ) : undefined
        }
        min={min}
        max={max}
        value={currentValue !== null ? (currentValue as number) : undefined}
        onChange={(val) => {
          setInternalValue(val as number | null);
          onChange?.(val as number | null);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        formatter={formatter}
        parser={(value: string | undefined) =>
          value ? value.replace(/(,*)/g, "") : ""
        }
        disabled={disabled}
        placeholder=""
      />
    </div>
  );
};

export default InputNumberField;
