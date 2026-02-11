import React from "react";
import { Form, Input } from "antd";
const PasswordField = ({ name, rules, placeholder, icon, label ,dependencies}) => {
  return (
    <Form.Item label={label} name={name} rules={rules} validateTrigger="onBlur">
      <Input.Password size="large" placeholder={placeholder} prefix={icon}  dependencies={dependencies} />
    </Form.Item>
  );
};

export default PasswordField;
