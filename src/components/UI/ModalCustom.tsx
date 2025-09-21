import React from "react";
import { Modal } from "antd";

interface ModalCustomProps {
  title?: React.ReactNode;
  open: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  width?: number | string;
  footer?: React.ReactNode | null;
  confirmLoading?: boolean;
  okText?: string;
  cancelText?: string;
  centered?: boolean;
  destroyOnHidden?: boolean;
  maskClosable?: boolean;
  className?: string;
}

const ModalCustom: React.FC<ModalCustomProps> = ({
  title = "Modal",
  open,
  onOk,
  onCancel,
  children,
  width = 520,
  footer,
  confirmLoading = false,
  okText = "Confirm",
  cancelText = "Cancel",
  centered = true,
  destroyOnHidden = true,
  maskClosable = true,
  className = "",
  ...rest
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={width}
      footer={footer}
      confirmLoading={confirmLoading}
      okText={okText}
      cancelText={cancelText}
      centered={centered}
      destroyOnHidden={destroyOnHidden}
      maskClosable={maskClosable}
      className={`custom-modal ${className}`}
      styles={{
        mask: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
      }}
      closable={false}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default ModalCustom;
