import React from "react";
import { Form, App } from "antd";
import BaseInput from "../../../components/shared/inputs";
import { Link, useNavigate } from "react-router";
import { combineRules, validations } from "@/config/rules";
import { useMutation } from "@/hooks/reactQuery";
import Helper from "@/helpers";

const Register = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const { mutate, isPending } = useMutation("signup", {
    useFormData: false,
    onSuccess: async (response) => {
      console.log("Registration response received:", response);
      
      // Handle the response data - could be direct or wrapped in data property
      const data = response.data || response;
      
      // Check if registration was successful
      if (data.success === false || data.error || data.errorKey) {
        console.log("Registration failed");
        
        let errorMessage = data.message || data.errorDesc || "Registration failed. Please try again.";
        
        notification.error({
          message: "Registration Failed",
          description: errorMessage,
          duration: 4,
        });
        return;
      }
      
      // Show success notification
      notification.success({
        message: "Account Created Successfully",
        description: "Your account has been created. Please login to continue.",
        duration: 4,
      });
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (error) => {
      console.log("Registration error received:", error);
      
      let errorMessage = "An error occurred during registration. Please try again.";
      
      if (error.data) {
        errorMessage = error.data.message || error.data.errorDesc || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notification.error({
        message: "Registration Failed",
        description: errorMessage,
        duration: 4,
      });
    },
  });

  const onFinish = (values) => {
    const transformedData = {
      ...values,
      image: "/images/",
      device: "web",
      device_token: "web-token-" + Date.now(), // Generate a web token
    };
    const finalPayload = {
      ...transformedData,
    };
    mutate(finalPayload);
  };


  return (
    <div className="login_sec">
      <div className="login_wrapper">
        <div className="txt">
          <h1> Create Account </h1>
          <Form onFinish={onFinish} layout="vertical">
            <div>
              <div className="flex_wrapper">
                <div>
                  <BaseInput
                    name="firstName"
                    placeholder="First Name*"
                    rules={combineRules("first_name", validations.required)}
                  />
                </div>
                <div>
                  <BaseInput
                    name="lastName"
                    placeholder="Last Name*"
                    rules={combineRules("last_name", validations.required)}
                  />
                </div>
              </div>
              <div>
                <BaseInput
                  name="email"
                  placeholder="Please Enter Your Email*"
                  rules={combineRules("email", validations.required, validations.email)}
                />
              </div>
              <div className="flex_wrapper">
                <div>
                  <BaseInput
                    name="password"
                    placeholder="Enter Your Password*"
                    type="password"
                    rules={combineRules("password", validations.required)}
                  />
                </div>
                <div>
                  <BaseInput
                    name="confirmPassword"
                    placeholder="Confirm Your Password*"
                    type="password"
                    rules={combineRules("confirm_password", validations.required)}
                  />
                </div>
              </div>
              <div>
                <BaseInput
                  name="phone_number"
                  placeholder="Please Enter Your Phone Number*"
                  type="number"
                  rules={combineRules("phone_number", validations.required)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-white text-[#16164e] text-[18px] font-medium px-4 py-2 rounded-md w-full"
                  disabled={isPending}
                >
                  {isPending ? "Creating Account..." : "Create Account"}
                </button>
              </div>
              <div>
                <div className="option_wrapper">
                  <p>
                    Already have an account?
                    <span>
                      <Link to="/">
                        LOGIN
                      </Link>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
