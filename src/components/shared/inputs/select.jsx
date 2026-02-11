import React from "react";
import { Form, Select } from "antd";
const SelectInput = ({
  name,
  rules,
  placeholder,
  onChange,
  options,
  style,
  loading,
  label,
  defaultValue,
  suffix,
  prefix,
  className,
}) => {
  return (
    <Form.Item
      name={name}
      rules={rules}
      label={label}
      validateTrigger="onBlur"
      className={className}
    >
      <Select
        size="large"
        placeholder={placeholder}
        onChange={onChange}
        style={style}
        loading={loading}
        options={options}
        suffix={suffix}
        prefix={prefix}
      />
    </Form.Item>
  );
};

export default SelectInput;
