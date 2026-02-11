import React from "react";
import { Modal } from "antd";

const CustomModal = ({
  open,
  onOk,
  onCancel,
  className,
  children,
  footer,
  title,
  width,
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      className={className}
      footer={footer}
      width={width}
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
