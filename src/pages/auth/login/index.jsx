


import { Form, App } from "antd";
import BaseInput from "../../../components/shared/inputs";
import { Link, useNavigate } from "react-router";
import { combineRules, validations } from "@/config/rules";
import { useMutation } from "@/hooks/reactQuery";
import Helper from "@/helpers";

const Login = () => {
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const { mutate, isPending } = useMutation("login", {
        useFormData: false,
        onSuccess: async (response) => {
            console.log("Login response received:", response);
            
            // Handle the response data - could be direct or wrapped in data property
            const data = response.data || response;
            
            console.log("Checking login response for errors...");
            console.log("Response data:", data);
            
            // Check if the backend returned an error or success is false
            if (data.error || data.errorKey || data.message === "Unauthorized" || data.success === false) {
                console.log("Login failed - detected error in response");
                
                // Check for specific error messages
                let errorMessage = data.message || data.errorDesc || "Invalid credentials. Please try again.";
                
                // Enhanced check for user not found scenarios
                if (data.message && (
                    data.message.toLowerCase().includes("user not found") || 
                    data.message.toLowerCase().includes("invalid email") ||
                    data.message.toLowerCase().includes("no user") ||
                    data.message.toLowerCase().includes("not registered")
                )) {
                    errorMessage = "User not found. Please check your email address.";
                }
                
                // Check for invalid password
                if (data.message && data.message.toLowerCase().includes("invalid password")) {
                    errorMessage = "Invalid password. Please try again.";
                }
                
                console.log("Showing error message:", errorMessage);
                
                // Show error notification
                notification.error({
                    message: "Login Failed",
                    description: errorMessage,
                    duration: 4,
                });
                return; // Don't proceed with login
            }

            const userData = data.data;

            // If there's no user data but no explicit error, still show failure
            if (!userData) {
                console.log("No user data found, showing error");
                notification.error({
                    message: "Login Failed",
                    description: data.message || "Invalid credentials. Please try again.",
                    duration: 4,
                });
                return; // Don't proceed with login
            }

            // ✅ Extract token from response
            const token = userData?.token || userData?.access_token || userData?.api_token;

            if (token) {
                // Store token in localStorage for backup
                localStorage.setItem("authToken", token);

                userData.api_token = token;
                userData.access_token = token;
                userData.token = token;
            }

            // ✅ Save session for global user info
            await Helper.setStorageData("session", userData);
            window.user = userData;

            console.log("✅ Login successful - Token saved:", token ? "Yes" : "No");
            console.log("✅ window.user:", window.user);

            navigate("/dashboard", { replace: true });
        },
        onError: (error) => {
            console.log("Login error received:", error);
            // Handle any network or other errors
            // Check if error contains response data with success: false
            if (error.data && error.data.success === false) {
                console.log("Login failed with success: false");
                let errorMessage = error.data.message || error.data.errorDesc || "Invalid credentials. Please try again.";
                
                // Enhanced check for user not found scenarios
                if (error.data.message && (
                    error.data.message.toLowerCase().includes("user not found") || 
                    error.data.message.toLowerCase().includes("invalid email") ||
                    error.data.message.toLowerCase().includes("no user") ||
                    error.data.message.toLowerCase().includes("not registered")
                )) {
                    errorMessage = "User not found. Please check your email address.";
                }
                
                console.log("Showing error message:", errorMessage);
                notification.error({
                    message: "Login Failed",
                    description: errorMessage,
                    duration: 4,
                });
            } else {
                console.log("General login error");
                notification.error({
                    message: "Login Failed",
                    description: error.message || error.data?.message || "An error occurred during login. Please try again.",
                    duration: 4,
                });
            }
        }
    });
    const onFinish = (values) => {
        const transformedData = {
            ...values,
            device: "web",
            device_token: "web-token-" + Date.now(),
        };
        mutate(transformedData);
    };



    return (
        <section className="login_sec">
            <div className="login_wrapper">
                <div className="txt">
                    <h1>Sign In</h1>
                    <Form onFinish={onFinish} layout="vertical">
                        <div className="">
                            <div>
                                <BaseInput
                                    name="email"
                                    type="email"
                                    placeholder="Enter Email *"
                                    rules={combineRules("email", validations.required, validations.email)} />
                            </div>
                            <div>
                                <BaseInput
                                    type="password"
                                    name="password"
                                    placeholder="Enter Your Password *"
                                    rules={combineRules("password", validations.required, validations.password)} />
                            </div>
                            <div>
                                <div className="check_box">
                                    <BaseInput
                                        type="checkbox"
                                        name="check_box"
                                        rules={combineRules("check_box")} />
                                    Remember me
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit">
                                  {isPending ? "Sign In......." : "Sign In"}  
                                </button>
                            </div>
                            <div>
                                <div className="option_wrapper">
                                    <p>
                                        Don't have an account?
                                        <span>
                                            <Link to="/register"> Create Now</Link>
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </section>
    );
};

export default Login;
