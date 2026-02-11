# 🔄 Token Flow Diagram

## Before Fix (❌ BROKEN)

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. User submits login form
   ↓
2. POST /api/auth/login
   ↓
3. Backend responds:
   {
     data: {
       data: {
         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
         email: "user@example.com",
         name: "John Doe"
       }
     }
   }
   ↓
4. Login onSuccess handler:
   - localStorage.setItem("authToken", userData.token) ✅
   - Helper.setStorageData("session", userData) ✅
   - window.user = userData ✅
   
   window.user = {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ← Token saved here
     email: "user@example.com",
     name: "John Doe"
   }
   ↓
5. Navigate to /dashboard ✅

┌─────────────────────────────────────────────────────────────────┐
│                    CERTIFICATE CREATION                         │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Create Certificate"
   ↓
2. Form submitted
   ↓
3. apiClient.fetchApi() checks for token:
   
   if (window.user.api_token || window.user.access_token) {  ← Looking here
     // Add Authorization header
   }
   
   window.user = {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ← But token is here!
     email: "user@example.com",
     name: "John Doe"
   }
   
   ❌ MISMATCH! Token not found!
   ↓
4. Request sent WITHOUT Authorization header
   ↓
5. Backend responds:
   {
     "error": true,
     "errorKey": "AUTH_ERROR",
     "errorDesc": "Authorization token missing or malformed"
   }
   ❌ FAILED!
```

---

## After Fix (✅ WORKING)

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. User submits login form
   ↓
2. POST /api/auth/login
   ↓
3. Backend responds:
   {
     data: {
       data: {
         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
         email: "user@example.com",
         name: "John Doe"
       }
     }
   }
   ↓
4. Login onSuccess handler (FIXED):
   
   const token = userData?.token || userData?.access_token || userData?.api_token;
   
   if (token) {
     localStorage.setItem("authToken", token);
     
     // ✅ NORMALIZE: Save in ALL expected fields
     userData.api_token = token;
     userData.access_token = token;
     userData.token = token;
   }
   
   Helper.setStorageData("session", userData);
   window.user = userData;
   
   window.user = {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",        ✅
     api_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",    ✅
     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", ✅
     email: "user@example.com",
     name: "John Doe"
   }
   
   console.log("✅ Login successful - Token saved: Yes");
   ↓
5. Navigate to /dashboard ✅

┌─────────────────────────────────────────────────────────────────┐
│                    CERTIFICATE CREATION                         │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Create Certificate"
   ↓
2. Form submitted
   ↓
3. apiClient.fetchApi() checks for token (FIXED):
   
   if (window.user.api_token || window.user.access_token || window.user.token) {
     const token = window.user.api_token || window.user.access_token || window.user.token;
     headers.append("Authorization", `Bearer ${token}`);
     console.log("🔐 [createCertificate] Authorization header added");
   }
   
   window.user = {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",        ✅
     api_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",    ✅ Found!
     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", ✅
     email: "user@example.com",
     name: "John Doe"
   }
   
   ✅ Token found! Authorization header added!
   ↓
4. Request sent WITH Authorization header:
   
   POST /api/certificate/create
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "Content-Type": "application/json"
   }
   Body: {
     "certificate_number": "CERT-001",
     "created_at": "2025-11-09T10:30:00.000Z"
   }
   ↓
5. Backend validates token ✅
   ↓
6. Backend responds:
   {
     "success": true,
     "message": "Certificate created successfully",
     "data": { ... }
   }
   ✅ SUCCESS!
   ↓
7. UI shows success notification
   Modal closes
   Form resets
```

---

## Session Persistence Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAGE REFRESH / RELOAD                        │
└─────────────────────────────────────────────────────────────────┘

1. App starts
   ↓
2. bootstrap.js runs:
   
   window.user = await window.helper.getStorageData("session");
   ↓
3. Decrypt session from localStorage:
   
   localStorage.getItem("session")
   → "U2FsdGVkX1..." (encrypted)
   ↓
   decryptData()
   ↓
   window.user = {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     api_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     email: "user@example.com",
     name: "John Doe"
   }
   ↓
4. console.log("✅ Bootstrap: User session loaded {hasToken: true}")
   ↓
5. Route guard checks window.user
   ↓
6. User stays on /dashboard (not redirected to login) ✅
```

---

## Token Lookup Priority

```
apiClient.fetchApi() token lookup order:

1. window.user.api_token     ← First choice
   ↓ (if not found)
2. window.user.access_token  ← Second choice
   ↓ (if not found)
3. window.user.token         ← Third choice (NEW!)
   ↓ (if not found)
4. No token → Warning logged ⚠️
```

---

## Debug Console Output

### Successful Flow:
```
✅ Login successful - Token saved: Yes
✅ window.user: {token: "...", api_token: "...", access_token: "..."}
✅ Bootstrap: User session loaded {hasToken: true, tokenField: "api_token"}
🔐 [createCertificate] Authorization header added: Bearer eyJ...
Certificate created successfully!
```

### Failed Flow (if token missing):
```
⚠️ [createCertificate] No token found! window.user: {...}
❌ 401 Unauthorized Error: {
  endpoint: "createCertificate",
  errorKey: "AUTH_ERROR",
  errorDesc: "Authorization token missing or malformed",
  hasWindowUser: true,
  hasToken: false
}
```

---

## Network Request Comparison

### Before Fix (❌):
```
POST https://testing.trustedsystempartners.com/api/certificate/create

Headers:
  Content-Type: application/json
  Accept: application/json
  ❌ Authorization: (missing!)

Body:
  {
    "certificate_number": "CERT-001",
    "created_at": "2025-11-09T10:30:00.000Z"
  }

Response: 401 Unauthorized
```

### After Fix (✅):
```
POST https://testing.trustedsystempartners.com/api/certificate/create

Headers:
  Content-Type: application/json
  Accept: application/json
  ✅ Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body:
  {
    "certificate_number": "CERT-001",
    "created_at": "2025-11-09T10:30:00.000Z"
  }

Response: 200 OK
```

---

## Key Takeaways

1. **Problem**: Token field name mismatch
2. **Solution**: Normalize token storage + expand lookup
3. **Result**: Token found and sent in all requests
4. **Benefit**: Certificate creation works!

---

**Visual Legend:**
- ✅ = Working/Success
- ❌ = Broken/Failed
- ⚠️ = Warning
- 🔐 = Security/Auth related
- ↓ = Flow direction

