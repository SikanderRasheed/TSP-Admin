import lodash from "lodash";
import constants from "@/config/constants";
import helper from "@/helpers";
async function bootstrap() {
  window.lodash = lodash;
  window.constants = constants;
  window.helper = helper;
  window.user = await window.helper.getStorageData("session");

  // Debug: Log user session on app load
  if (window.user && Object.keys(window.user).length > 0) {
    console.log("✅ Bootstrap: User session loaded", {
      hasToken: !!(window.user.token || window.user.api_token || window.user.access_token),
      tokenField: window.user.token ? 'token' : window.user.api_token ? 'api_token' : window.user.access_token ? 'access_token' : 'none'
    });
  } else {
    console.log("ℹ️ Bootstrap: No user session found");
  }
}

export default bootstrap;
