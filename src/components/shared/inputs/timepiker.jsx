import React from "react";
import { Form, TimePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const TimePickerInput = ({
  name,
  rules,
  label,
  placeholder,
  className,
  onChange,
  format,
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules} validateTrigger="onBlur">
      <TimePicker
        className={className}
        placeholder={placeholder}
        onChange={onChange}
        defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
        size="large"
        format={format}
      />
    </Form.Item>
  );
};

export default TimePickerInput;
