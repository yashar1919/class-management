import React, { useState } from "react";
import type { ReactNode } from "react";
import { InputNumber } from "antd";
//import { useTheme } from "../../../context/ThemeContext";

interface InputNumberFieldProps {
  placeholder: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  error?: boolean;
}

const InputNumberField: React.FC<InputNumberFieldProps> = ({
  placeholder,
  value,
  onChange,
  addonBefore,
  addonAfter,
  error,
}) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState<number | null>(
    value ?? null
  );

  const currentValue = value !== undefined ? value : internalValue;

  const isFloating =
    focused || (currentValue !== null && currentValue !== undefined);
  const labelColor = focused ? "text-custom-primary-500" : "text-gray-400";
  const borderColor = focused ? "border-blue-600" : "border-gray-300";
  //const { theme } = useTheme();

  return (
    <div
      className={`input-number-wrapper relative w-full ${
        error ? " input-number-error" : ""
      }`}
    >
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
          left: isFloating ? "3rem" : "2.5rem",
          top: isFloating ? "-0.75rem" : "50%",
          transform: isFloating ? "none" : "translateY(-50%)",
          fontStyle: isFloating ? "italic" : undefined,
        }}
      >
        {placeholder}
      </span>
      <InputNumber
        className={`w-full rounded-2xl ${borderColor}`}
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
        min={1}
        value={currentValue as number | undefined}
        onChange={(val) => {
          setInternalValue(val as number | null);
          onChange?.(val as number | null);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
      />
    </div>
  );
};

export default InputNumberField;
