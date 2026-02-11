import React from "react";
import { Form, Input } from "antd";

const OtpInput = ({ name, rules, placeholder, label }) => {
  const onChange = (text) => {};
  const sharedProps = {
    onChange,
  };

  return (
    <Form.Item label={label} name={name} rules={rules} validateTrigger="onBlur">
      <Input.OTP
        formatter={(str) => str.toUpperCase()}
        placeholder={placeholder}
        {...sharedProps}
      />
    </Form.Item>
  );
};

export default OtpInput;
