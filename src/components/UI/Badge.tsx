import React, { memo } from "react";
import { Tag } from "antd";

interface AntBadgeProps {
  variant: "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Badge = memo(function Badge({
  variant,
  size = "sm",
  children,
}: AntBadgeProps) {
  const getColor = () => {
    switch (variant) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "danger":
        return "error";
      case "info":
        return "processing";
      default:
        return "default";
    }
  };

  // Add "lg" size option
  const fontSize = size === "sm" ? "12px" : size === "md" ? "14px" : "18px";
  const padding =
    size === "sm" ? "2px 8px" : size === "md" ? "4px 6px" : "6px 12px";

  return (
    <Tag
      color={getColor()}
      style={{
        fontSize,
        padding,
        borderRadius: "999px",
      }}
    >
      {children}
    </Tag>
  );
});

export default Badge;
