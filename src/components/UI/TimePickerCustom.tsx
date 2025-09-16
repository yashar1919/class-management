import React, { useState } from "react";
import { TimePicker } from "antd";
import { useTranslation } from "react-i18next";

interface TimePickerCustomProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;
  error?: boolean;
  placeholder?: string;
}

const TimePickerCustom: React.FC<TimePickerCustomProps> = ({
  value,
  onChange,
  error,
  placeholder = "Select time",
}) => {
  const [focused, setFocused] = useState(false);
  const { i18n } = useTranslation();

  const isRTL = i18n.language === "fa";
  const inputDir = isRTL ? "rtl" : "ltr";
  const inputTextAlign = isRTL ? "right" : "left";

  const isFloating =
    focused ||
    (!!value && value !== null && value !== undefined && value !== "");
  const labelColor = error
    ? "text-red-500"
    : focused
    ? "text-teal-500"
    : "text-gray-400";

  const labelLeft = isRTL ? undefined : isFloating ? "0.75rem" : "1rem";
  const labelRight = isRTL ? (isFloating ? "0.75rem" : "1rem") : undefined;

  return (
    <div className="relative w-full" dir={inputDir}>
      <span
        className={`
          absolute transition-all px-2 duration-300 pointer-events-none z-10
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
      <TimePicker
        size="large"
        className={`w-full rounded-lg border transition-all duration-200 custom-timepicker`}
        value={value}
        onChange={onChange}
        format="HH:mm"
        allowClear
        style={{
          borderRadius: "10px",
          border: error ? "1px solid #ef4444" : undefined,
          textAlign: inputTextAlign,
          direction: inputDir,
        }}
        inputReadOnly
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=""
      />
    </div>
  );
};

export default TimePickerCustom;
