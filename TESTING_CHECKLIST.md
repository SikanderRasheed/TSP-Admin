# 🧪 Quick Testing Checklist

## Before Testing
```javascript
// Clear everything
localStorage.clear();
window.location.reload();
```

## Test 1: Login ✅
1. Go to `/` (login page)
2. Enter credentials
3. Click "Sign In"
4. **Expected Console Output**:
   ```
   ✅ Login successful - Token saved: Yes
   ✅ window.user: {...}
   ```
5. **Expected Behavior**: Redirect to `/dashboard`

## Test 2: Session Persistence ✅
1. Refresh the page (F5)
2. **Expected Console Output**:
   ```
   ✅ Bootstrap: User session loaded {hasToken: true, tokenField: "token"}
   ```
3. **Expected Behavior**: Stay on dashboard (not redirected to login)

## Test 3: Certificate Creation ✅
1. Click "Create New Certificate"
2. Fill in certificate number
3. Click OK/Submit
4. **Expected Console Output**:
   ```
   🔐 [createCertificate] Authorization header added: Bearer eyJ...
   ```
5. **Expected Network Request**:
   - URL: `https://testing.trustedsystempartners.com/api/certificate/create`
   - Method: `POST`
   - Headers: `Authorization: Bearer <token>`
6. **Expected Response**: Success (not AUTH_ERROR)
7. **Expected UI**: Success notification + modal closes

## Quick Debug Commands

### Check Token After Login
```javascript
console.log({
  token: window.user?.token,
  api_token: window.user?.api_token,
  access_token: window.user?.access_token
});
```

### Check Session Storage
```javascript
localStorage.getItem("session"); // Should return encrypted string
```

### Decrypt Session
```javascript
window.helper.getStorageData("session").then(console.log);
```

### Check Current User
```javascript
console.log("Current user:", window.user);
```

## ❌ If Tests Fail

### Login doesn't save token
- Check console for login response
- Verify backend returns token in response

### Token not in headers
- Check console for warning: `⚠️ [createCertificate] No token found!`
- Run: `console.log(window.user)`

### Still getting AUTH_ERROR
- Check Network tab → Request Headers
- Verify `Authorization: Bearer <token>` is present
- Check if token is valid (not expired)

## ✅ Success Criteria
- [ ] Login works without errors
- [ ] Token saved in localStorage
- [ ] Session persists after refresh
- [ ] Certificate creation succeeds
- [ ] No AUTH_ERROR in response
- [ ] Success notification appears

