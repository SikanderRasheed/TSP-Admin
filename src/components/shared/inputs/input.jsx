import React from "react";
import { Form, Input } from "antd";

const InputField = ({
  name,
  rules,
  icon,
  defaultValue,
  placeholder,
  className,
  disabled,
  label,
  type,
  suffix,
  onChange,
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules} validateTrigger="onBlur">
      <Input
        prefix={icon}
        suffix={suffix}
        size="large"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        type={type}
        onChange={onChange}
      />
    </Form.Item>
  );
};

export default InputField;
