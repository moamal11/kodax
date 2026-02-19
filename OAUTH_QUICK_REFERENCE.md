# OAuth Flow - Quick Reference

## 🔑 Key URLs

| Environment | Platform | Redirect URL                                     |
| ----------- | -------- | ------------------------------------------------ |
| **Dev**     | Web      | `http://localhost:19006/auth/callback`           |
| **Dev**     | Mobile   | `http://localhost:19006/auth/callback?fromApp=1` |
| **Prod**    | Web      | `https://kodax.app/auth/callback`                |
| **Prod**    | Mobile   | `https://kodax.app/auth/callback?fromApp=1`      |

## 📱 Deep Link

```
kodax://auth/success#access_token=...&refresh_token=...
```

## 🏗️ Implementation Structure

```
app/
├── (auth)/
│   └── login.tsx          → Login UI + OAuth initiation
├── auth/
│   ├── callback.tsx       → Web callback handler
│   └── success.tsx        → Deep link placeholder
└── _layout.tsx            → Deep link listener setup

src/services/
└── deepLinkAuthService.ts → Deep link processing logic
```

## 🔄 Flow Summary

### Mobile:

```
Login → Browser OAuth → Web Callback (fromApp=1)
→ Deep Link → Set Session → Dashboard
```

### Web:

```
Login → OAuth → Web Callback → Set Session → Dashboard
```

## 🧪 Quick Test Commands

```bash
# Start dev server
npx expo start

# Test on web
Press 'w'

# Test on Android
Press 'a'

# Test on iOS
Press 'i'
```

## ⚙️ Supabase Setup

1. Go to **Authentication** → **URL Configuration**
2. Add redirect URLs (both dev and prod)
3. Enable Google provider in **Providers**
4. Add Client ID and Secret

## 🐛 Debug Tips

**Check logs for:**

- `🔐 Starting Google Sign-In...` → OAuth initiated
- `🌐 Browser result:` → Browser callback
- `🔗 Received auth deep link:` → Deep link received
- `✅ Session established` → Success!

**Common Issues:**

- Missing redirect URL in Supabase
- Google OAuth not configured
- Deep link schema not working → rebuild app

## 📦 Key Dependencies

```json
{
  "expo-web-browser": "^15.0.10",
  "expo-linking": "~8.0.11",
  "@supabase/supabase-js": "..."
}
```

## 🔐 Security Checklist

- ✅ Tokens in URL hash (not query params)
- ✅ Session stored in AsyncStorage
- ✅ No token exposure in logs
- ✅ Automatic token refresh
- ✅ Proper cleanup on sign out

---

**Full documentation:** [OAUTH_UNIFIED_SETUP.md](OAUTH_UNIFIED_SETUP.md)
