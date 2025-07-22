# Testing Google OAuth Profile Completion Flow

## Steps to Test:

1. **Navigate to test page:** http://localhost:3000/test-auth

2. **Click "Sign in with Google"** (use a Google account not already in the system)

3. **Check browser console for debug logs:**
   - Look for `🔍 Google OAuth JWT callback`
   - Look for `🆕 New Google user - needs profile completion`
   - Look for `🔍 SessionManager - session data`

4. **Expected behavior:**
   - New Google user should have `needsProfileCompletion: true`
   - Profile completion modal should appear
   - After filling out the form, user should be redirected

## Debug Information to Check:

### Console Logs Expected:
```
🔍 Google OAuth JWT callback { email: "user@example.com", accountId: "123..." }
🆕 New Google user - needs profile completion { email: "user@example.com" }
🎯 JWT token result { id: undefined, email: "user@example.com", needsProfileCompletion: true, hasRoles: false }
🔍 SessionManager - session data { status: "authenticated", userId: undefined, email: "user@example.com", needsProfileCompletion: true, ... }
📋 Showing profile completion modal for: user@example.com
```

### Session Debug Widget:
- Should show in bottom-left corner
- `Needs Profile: YES` for new Google users
- `Needs Profile: NO` after completion

## Troubleshooting:

If profile completion modal doesn't appear:
1. Check console for JWT/session logs
2. Verify `needsProfileCompletion` flag is set
3. Check if user already exists in database
4. Verify SessionManager is mounted in layout

## Manual Database Check:

```sql
SELECT id, email, name, phone, "googleId", roles 
FROM "User" 
WHERE email = 'your-google-email@example.com';
```

If user exists, delete them to test new user flow:
```sql
DELETE FROM "User" WHERE email = 'your-google-email@example.com';
```