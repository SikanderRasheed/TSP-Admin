import React from "react";
import InputField from "./input";
import PasswordField from "./passwordfield";
import SelectInput from "./select";
import CheckBoxInput from "./checkbox";
import DatePickerInput from "./datepicker";
import TimePikerInput from "./timepiker";
import TextAreaInput from "./textarea";
import PhoneInputField from "./phonenumber";
import OtpInput from "./otpinput";
import UploadInput from "./upload";

const BaseInput = (props) => {
  if (props.type == "select") return <SelectInput {...props} />;
  else if (props.type == "password") return <PasswordField {...props} />;
  else if (props.type == "checkbox") return <CheckBoxInput {...props} />;
  else if (props.type == "date") return <DatePickerInput {...props} />;
  else if (props.type == "datepiker") return <DatePickerInput {...props} />;
  else if (props.type == "timepiker") return <TimePikerInput {...props} />;
  else if (props.type == "textarea") return <TextAreaInput {...props} />;
  else if (props.type == "phonenumber") return <PhoneInputField {...props} />;
  else if (props.type == "otp") return <OtpInput {...props} />;
  else if (props.type == "upload") return <UploadInput {...props} />;
  else return <InputField {...props} />;
};

export default BaseInput;
