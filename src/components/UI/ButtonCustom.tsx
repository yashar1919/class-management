import React, { useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import type { ButtonProps } from "antd";
import { Button } from "antd";

interface ButtonCustomProps extends ButtonProps {
  children: ReactNode;
  className?: string;
  textColor?: string;
  backgroundColor?: string;
  hoverStyle?: CSSProperties;
  activeStyle?: CSSProperties;
}

const ButtonCustom: React.FC<ButtonCustomProps> = ({
  children,
  type = "default",
  className = "",
  textColor,
  backgroundColor,
  style,
  hoverStyle,
  activeStyle,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const defaultPrimaryBg = "#0077B6";
  const defaultPrimaryText = "#fff";
  const defaultPrimaryHoverBg = "#005f91";
  const defaultPrimaryActiveBg = "#004c70";

  const outlineBg = "#fff";
  const outlineText = "#0077B6";
  const outlineBorder = "#0077B6";
  const outlineHoverText = "#005f91";
  const outlineHoverBorder = "#005f91";
  const outlineActiveText = "#004c70";
  const outlineActiveBorder = "#004c70";

  const appliedHoverStyle =
    hoverStyle ??
    (type === "primary"
      ? { backgroundColor: defaultPrimaryHoverBg }
      : type === "default"
      ? {
          color: outlineHoverText,
          borderColor: outlineHoverBorder,
          backgroundColor: outlineBg,
        }
      : undefined);

  const appliedActiveStyle =
    activeStyle ??
    (type === "primary"
      ? { backgroundColor: defaultPrimaryActiveBg }
      : type === "default"
      ? {
          color: outlineActiveText,
          borderColor: outlineActiveBorder,
          backgroundColor: outlineBg,
        }
      : undefined);

  const cleanStyle = { ...style };
  delete cleanStyle.border;

  let combinedStyle: React.CSSProperties = {
    color:
      textColor ??
      (type === "primary"
        ? defaultPrimaryText
        : type === "default"
        ? outlineText
        : undefined),
    backgroundColor:
      backgroundColor ??
      (type === "primary"
        ? defaultPrimaryBg
        : type === "default"
        ? outlineBg
        : undefined),
    borderWidth: type === "default" ? 1 : undefined,
    borderStyle: type === "default" ? "solid" : undefined,
    borderColor: type === "default" ? outlineBorder : undefined,
    height: 40,
    fontWeight: 600,
    fontSize: "16px",
    borderRadius: 12,
    ...cleanStyle,
  };

  if (isHovered && appliedHoverStyle) {
    combinedStyle = { ...combinedStyle, ...appliedHoverStyle };
    if (type === "default") {
      combinedStyle.borderWidth = 1;
      combinedStyle.borderStyle = "solid";
    }
  }
  if (isActive && appliedActiveStyle) {
    combinedStyle = { ...combinedStyle, ...appliedActiveStyle };
    if (type === "default") {
      combinedStyle.borderWidth = 1;
      combinedStyle.borderStyle = "solid";
    }
  }

  return (
    <Button
      type={type}
      className={`w-full ${className}`}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ButtonCustom;
