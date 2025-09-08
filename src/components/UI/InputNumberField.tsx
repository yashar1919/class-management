/* import React, { useState } from "react";
import type { ReactNode } from "react";
import { InputNumber } from "antd";

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
  const labelColor = error
    ? "text-red-500"
    : focused
    ? "text-teal-500"
    : "text-gray-400";

  return (
    <div className={`relative w-full ${error ? "input-number-error" : ""}`}>
      <span
        className={`
          absolute transition-all duration-300 pointer-events-none z-10 px-2
          text-xs font-normal
          ${labelColor}
          ${isFloating ? "bg-[#141414]" : ""}
        `}
        style={{
          left: isFloating ? (addonBefore ? "2.5rem" : "0.75rem") : "2.2rem",
          top: isFloating ? "-0.7rem" : "50%",
          transform: isFloating ? "none" : "translateY(-50%)",
          fontStyle: isFloating ? "italic" : undefined,
        }}
      >
        {placeholder}
      </span>
      <InputNumber
        size="large"
        className={`transition-all duration-200 ${
          error
            ? "border-red-500"
            : focused
            ? "border-teal-500"
            : "border-gray-300"
        }`}
        style={{ width: "100%", borderRadius: "10px" }}
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

export default InputNumberField; */

import React, { useState } from "react";
import type { ReactNode } from "react";
import { InputNumber } from "antd";

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
    value ?? null
  );

  const currentValue = value !== undefined ? value : internalValue;

  const isFloating =
    focused || (currentValue !== null && currentValue !== undefined);
  const labelColor = error
    ? "text-red-500"
    : focused
    ? "text-teal-500"
    : "text-gray-400";

  return (
    <div className={`relative w-full ${error ? "input-number-error" : ""}`}>
      {placeholder && (
        <span
          className={`
            absolute transition-all duration-300 pointer-events-none z-10 px-2
            text-xs font-normal
            ${labelColor}
            ${isFloating ? "bg-[#141414]" : ""}
          `}
          style={{
            left: isFloating ? (addonBefore ? "2.5rem" : "0.75rem") : "2.2rem",
            top: isFloating ? "-0.7rem" : "50%",
            transform: isFloating ? "none" : "translateY(-50%)",
            fontStyle: isFloating ? "italic" : undefined,
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
        style={{ width: "100%", borderRadius: "10px" }}
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
        value={currentValue as number | undefined}
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
