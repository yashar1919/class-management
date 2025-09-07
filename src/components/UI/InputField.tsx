import React, { useState } from "react";
import { Input } from "antd";
import { UserOutlined } from "@ant-design/icons";

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

  const isFloating = focused || (!!value && value.length > 0);
  const labelColor = error
    ? "text-red-500"
    : focused
    ? "text-teal-500"
    : "text-gray-400";

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
          borderColor: error ? "#ef4444" : focused ? "#14b8a6" : undefined,
          //backgroundColor: "transparent",
          //color: "white",
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
        }`}
      />
    </div>
  );
};

export default InputField;
