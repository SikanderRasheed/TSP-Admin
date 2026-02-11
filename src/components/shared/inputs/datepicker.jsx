import React from "react";
import { Form, DatePicker } from "antd";
import dayjs from "dayjs";

const DatePickerInput = ({
  name,
  rules,
  label,
  placeholder,
  className,
  onChange,
  disablePastDates = false,
  format,
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules} validateTrigger="onBlur">
      <DatePicker
        className={className}
        placeholder={placeholder}
        onChange={onChange}
        format={format}
        size="large"
        disabledDate={
          disablePastDates
            ? (current) => current && current < dayjs().startOf("day")
            : undefined
        }
      />
    </Form.Item>
  );
};

export default DatePickerInput;
