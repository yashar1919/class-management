import React, { useState } from "react";
import { TimePicker } from "antd";

interface TimePickerCustomProps {
  value?: any;
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

  // لیبل شناور وقتی فوکوس یا مقدار دارد
  const isFloating =
    focused ||
    (!!value && value !== null && value !== undefined && value !== "");
  const labelColor = error
    ? "text-red-500"
    : focused
    ? "text-teal-500"
    : "text-gray-400";

  return (
    <div className="relative w-full">
      <span
        className={`
          absolute transition-all px-2 duration-300 pointer-events-none z-10
          text-xs font-normal
          ${labelColor}
          ${isFloating ? "bg-[#141414]" : ""}
        `}
        style={{
          left: isFloating ? "0.75rem" : "1rem",
          top: isFloating ? "-0.7rem" : "50%",
          transform: isFloating ? "none" : "translateY(-50%)",
          fontStyle: isFloating ? "italic" : undefined,
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
          //backgroundColor: "transparent",
          //color: "white",
          borderRadius: "10px",
          border: error ? "1px solid #ef4444" : undefined,
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
