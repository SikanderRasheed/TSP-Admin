import React from 'react';
import { Form } from 'antd';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

const PhoneInputField = ({
  name,
  label,
  rules,
  placeholder,
  className,
  disabled,
  defaultCountry = 'US', // default to US unless specified
}) => {
  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      validateTrigger="onBlur"
    >
      <PhoneInput
        className={className}
        placeholder={placeholder}
        disabled={disabled}
        defaultCountry={defaultCountry}
      />
    </Form.Item>
  );
};

export default PhoneInputField;
