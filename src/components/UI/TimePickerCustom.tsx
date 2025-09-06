import React from "react";
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
  return (
    <div className="relative w-full">
      <TimePicker
        className={`w-full pl-10 pr-3 py-2 rounded-lg border transition-all duration-200 ${
          error ? "border-red-500" : "border-gray-300"
        } custom-timepicker`}
        value={value}
        onChange={onChange}
        format="HH:mm:ss"
        placeholder={placeholder}
        allowClear
        style={{
          backgroundColor: "transparent",
          color: "white",
        }}
        inputReadOnly
      />
    </div>
  );
};

export default TimePickerCustom;
