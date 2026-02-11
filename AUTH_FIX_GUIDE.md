# 🔐 Authentication Token Fix - Complete Guide

## 🐛 Problem Identified

**Issue**: After login, the certificate creation API was returning:
```json
{
  "error": true,
  "errorKey": "AUTH_ERROR",
  "errorDesc": "Authorization token missing or malformed"
}
```

**Root Cause**: Token field mismatch between login response and API client expectations.

### The Mismatch:
1. **Login Response**: Backend returns token as `userData.token`
2. **API Client Expected**: `window.user.api_token` OR `window.user.access_token`
3. **Result**: Token was saved but not found when making authenticated requests

---

## ✅ Fixes Applied

### 1. **Login Page Fix** (`src/pages/auth/login/index.jsx`)

**Before:**
```javascript
if (userData?.token) {
  localStorage.setItem("authToken", userData.token);
}
await Helper.setStorageData("session", userData);
window.user = userData;
```

**After:**
```javascript
// Extract token from response (check multiple possible fields)
const token = userData?.token || userData?.access_token || userData?.api_token;

if (token) {
  localStorage.setItem("authToken", token);
  
  // ✅ CRITICAL FIX: Ensure token is stored in ALL expected fields
  userData.api_token = token;
  userData.access_token = token;
  userData.token = token;
}

await Helper.setStorageData("session", userData);
window.user = userData;
```

**Why**: This ensures the token is available in all possible field names that the API client might check.

---

### 2. **API Client Enhancement** (`src/services/apiClient.js`)

**Before:**
```javascript
if (
  window.user &&
  (window.user.api_token || window.user.access_token) &&
  !publicEndpoints.includes(endpoint)
) {
  const token = window.user.api_token || window.user.access_token;
  headers.append("Authorization", `Bearer ${token}`);
}
```

**After:**
```javascript
if (
  window.user &&
  (window.user.api_token || window.user.access_token || window.user.token) &&
  !publicEndpoints.includes(endpoint)
) {
  const token = window.user.api_token || window.user.access_token || window.user.token;
  headers.append("Authorization", `Bearer ${token}`);
  console.log(`🔐 [${endpoint}] Authorization header added`);
} else if (!publicEndpoints.includes(endpoint)) {
  console.warn(`⚠️ [${endpoint}] No token found! window.user:`, window.user);
}
```

**Why**: 
- Added `window.user.token` as a fallback option
- Added debug logging to track token attachment
- Added warning when token is missing

---

### 3. **Bootstrap Debug Logging** (`src/bootstrap.js`)

Added session loading verification:
```javascript
if (window.user && Object.keys(window.user).length > 0) {
  console.log("✅ Bootstrap: User session loaded", {
    hasToken: !!(window.user.token || window.user.api_token || window.user.access_token),
    tokenField: window.user.token ? 'token' : window.user.api_token ? 'api_token' : 'access_token'
  });
} else {
  console.log("ℹ️ Bootstrap: No user session found");
}
```

---

### 4. **Helper Notification Fix** (`src/helpers/index.js`)

Added `Helper.notification` object for consistent notifications:
```javascript
notification: {
  success: (message, description = "") => {
    notification.success({ message, description, duration: 4 });
  },
  error: (message, description = "") => {
    notification.error({ message, description, duration: 4 });
  },
  // ... info, warning
}
```

---

### 5. **Enhanced Error Logging** (`src/services/apiClient.js`)

Added detailed 401 error logging:
```javascript
if (response.status === 401) {
  console.error("❌ 401 Unauthorized Error:", {
    endpoint,
    errorKey: data.errorKey,
    errorDesc: data.errorDesc,
    hasWindowUser: !!window.user,
    hasToken: !!(window.user?.token || window.user?.api_token || window.user?.access_token),
  });
  // ... show alert
}
```

---

## 🧪 Testing Steps

### Step 1: Clear Existing Session
```javascript
// Open browser console and run:
localStorage.clear();
window.location.reload();
```

### Step 2: Login
1. Go to login page (`/`)
2. Enter credentials
3. **Check Console** - You should see:
   ```
   ✅ Login successful - Token saved: Yes
   ✅ window.user: {token: "...", api_token: "...", access_token: "..."}
   ```

### Step 3: Verify Session Persistence
1. Refresh the page
2. **Check Console** - You should see:
   ```
   ✅ Bootstrap: User session loaded {hasToken: true, tokenField: "token"}
   ```

### Step 4: Create Certificate
1. Go to Dashboard (`/dashboard`)
2. Click "Create New Certificate"
3. Fill in the form
4. Submit
5. **Check Console** - You should see:
   ```
   🔐 [createCertificate] Authorization header added: Bearer eyJ...
   ```
6. **Check Network Tab** - Request headers should include:
   ```
   Authorization: Bearer <your-token>
   ```

---

## 🔍 Debugging Checklist

If the issue persists, check these in order:

### ✅ 1. Token Saved After Login?
```javascript
// In console after login:
console.log("Token check:", {
  token: window.user?.token,
  api_token: window.user?.api_token,
  access_token: window.user?.access_token
});
```
**Expected**: At least one should have a value

### ✅ 2. Token Persists After Refresh?
```javascript
// After page refresh:
console.log("Session check:", window.user);
```
**Expected**: Should show user object with token fields

### ✅ 3. Token Sent in Request?
- Open **Network Tab** in DevTools
- Make a certificate creation request
- Click on the request
- Go to **Headers** tab
- Check **Request Headers**
- Look for: `Authorization: Bearer <token>`

### ✅ 4. Token Format Correct?
The token should:
- Start with `Bearer ` (with space)
- Be a valid JWT or API token string
- Not be `undefined` or `null`

---

## 🚨 Common Issues & Solutions

### Issue 1: "Token is undefined"
**Solution**: Check login response structure
```javascript
// Add this in login onSuccess:
console.log("Full login response:", data);
console.log("User data:", data.data.data);
```

### Issue 2: "Token not persisting after refresh"
**Solution**: Check localStorage encryption
```javascript
// Check if session is saved:
const encrypted = localStorage.getItem("session");
console.log("Encrypted session exists:", !!encrypted);

// Try to decrypt:
const decrypted = await window.helper.getStorageData("session");
console.log("Decrypted session:", decrypted);
```

### Issue 3: "Still getting AUTH_ERROR"
**Possible causes**:
1. Token expired (check token expiry)
2. Backend expects different header format
3. Token is malformed

**Debug**:
```javascript
// Check exact header being sent:
// In apiClient.js, add before fetch:
console.log("Request headers:", Object.fromEntries(headers.entries()));
```

---

## 📊 Expected Console Output (Success Flow)

### On Login:
```
✅ Login successful - Token saved: Yes
✅ window.user: {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  api_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  // ... other user data
}
```

### On Page Refresh:
```
✅ Bootstrap: User session loaded {hasToken: true, tokenField: "token"}
```

### On Certificate Creation:
```
🔐 [createCertificate] Authorization header added: Bearer eyJhbG...
```

### On Success:
```
Certificate created successfully!
```

---

## 🎯 What Changed Summary

| File | Change | Purpose |
|------|--------|---------|
| `login/index.jsx` | Normalize token fields | Ensure token saved in all expected fields |
| `apiClient.js` | Add `window.user.token` fallback | Support all token field names |
| `apiClient.js` | Add debug logging | Track token attachment |
| `bootstrap.js` | Add session logging | Verify session loading |
| `helpers/index.js` | Add notification helper | Fix Helper.notification usage |
| `dashboard/index.jsx` | Add error handler | Better error visibility |

---

## 🔄 Next Steps

1. **Test the login flow** with the fixes
2. **Monitor console logs** for any warnings
3. **Verify certificate creation** works
4. **Remove debug logs** in production (optional)

---

## 💡 Pro Tips

1. **Keep debug logs** during development - they're helpful!
2. **Check Network tab** - it never lies about what's being sent
3. **Use React DevTools** - inspect component state
4. **Test in incognito** - ensures clean state

---

## 📞 Still Having Issues?

If the problem persists:
1. Share the **console logs** from login
2. Share the **Network tab** screenshot of the failed request
3. Share the **login response** structure from backend
4. Check if backend expects a specific token format

---

**Last Updated**: 2025-11-09
**Status**: ✅ Ready for Testing

