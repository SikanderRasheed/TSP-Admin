import React from "react";
import { Input, Form } from "antd";
const { TextArea } = Input;

const TextAreaInput = ({
  placeholder,
  rows,
  label,
  name,
  rules,
  autoSize,
  onChange,
  value,
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules} validateTrigger="onBlur">
      <TextArea
        autoSize={autoSize}
        rows={rows}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
    </Form.Item>
  );
};

export default TextAreaInput;
