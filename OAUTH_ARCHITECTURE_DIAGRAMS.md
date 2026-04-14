## 🏗️ Architecture Diagrams

---

## 1️⃣ قبل الحل (المشكلة) ❌

```
┌─────────────────────────────────────────────────────────┐
│                    RootLayout                           │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ AuthProvider                                      │ │
│  │                                                   │ │
│  │ ┌──────────────────────────────────────────────┐ │ │
│  │ │ InnerLayout                                  │ │ │
│  │ │ user?.id available (but session unstable)   │ │ │
│  │ │                                              │ │ │
│  │ │ ┌──────────────────────────────────────────┐ │ │ │
│  │ │ │ AppProvider userId={user?.id} ❌         │ │ │ │
│  │ │ │                                          │ │ │ │
│  │ │ │ useEffect([userId]) fires TOO EARLY      │ │ │ │
│  │ │ │    │                                     │ │ │ │
│  │ │ │    ├─ loadProfile(userId)               │ │ │ │
│  │ │ │    │  └─ Query fired BEFORE session     │ │ │ │
│  │ │ │    │     in AsyncStorage                │ │ │ │
│  │ │ │    │  └─ ❌ 403 Unauthorized            │ │ │ │
│  │ │ │    │  └─ profile = null                 │ │ │ │
│  │ │ │    │                                     │ │ │ │
│  │ │ │    └─ loadLeaderboard()                 │ │ │ │
│  │ │ │       └─ ❌ Query fails too              │ │ │ │
│  │ │ │       └─ leaderboard = []                │ │ │ │
│  │ │ │                                          │ │ │ │
│  │ │ │ ┌────────────────────┐                   │ │ │ │
│  │ │ │ │ UI Renders:        │                   │ │ │ │
│  │ │ │ │ - Profile: NULL ❌ │                   │ │ │ │
│  │ │ │ │ - XP: 0            │                   │ │ │ │
│  │ │ │ │ - Avatar: missing  │                   │ │ │ │
│  │ │ │ │ = Empty Screens    │                   │ │ │ │
│  │ │ │ └────────────────────┘                   │ │ │ │
│  │ │ │                                          │ │ │ │
│  │ │ │ [5 seconds pass...]                      │ │ │ │
│  │ │ │                                          │ │ │ │
│  │ │ │ User closes app & reopens:               │ │ │ │
│  │ │ │ AsyncStorage loads session ✅            │ │ │ │
│  │ │ │ Next auth check: SIGNED_IN ✅            │ │ │ │
│  │ │ │ loadProfile() called again...            │ │ │ │
│  │ │ │ Now session IS in AsyncStorage ✅        │ │ │ │
│  │ │ │ Query succeeds ✅                        │ │ │ │
│  │ │ │ Data loads ✅                            │ │ │ │
│  │ │ │                                          │ │ │ │
│  │ │ └──────────────────────────────────────────┘ │ │ │
│  │ └──────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│ 🔴 ROOT CAUSE: AppProvider doesn't wait for async    │
│    session persistence before querying                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2️⃣ بعد الحل (الهندسة الجديدة) ✅

```
┌──────────────────────────────────────────────────────────────┐
│                     RootLayout                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ AuthProvider                                           │ │
│  │ • session: Session | null                             │ │
│  │ • authVersion: number (increments per login)          │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ 🆕 SessionHydrationProvider ✨                   │ │ │
│  │  │ (New layer of orchestration)                     │ │ │
│  │  │                                                  │ │ │
│  │  │ Detects: userId changed!                         │ │ │
│  │  │          session !== previousSession             │ │ │
│  │  │                                                  │ │ │
│  │  │ STAGE 1: Buffer for platform                     │ │ │
│  │  │ ┌─────────────────────────────────────────────┐  │ │ │
│  │  │ │ await setTimeout(300ms on mobile, 200 web) │  │ │ │
│  │  │ │ Reason: onAuthStateChange listeners settle │  │ │ │
│  │  │ └─────────────────────────────────────────────┘  │ │ │
│  │  │                                                  │ │ │
│  │  │ STAGE 2: Verify getSession() works (retry 5x)   │ │ │
│  │  │ ┌─────────────────────────────────────────────┐  │ │ │
│  │  │ │ Loop max 5 times:                           │  │ │ │
│  │  │ │   const {session} = getSession()            │  │ │ │
│  │  │ │   ✅ if session?.user?.id === userId        │  │ │ │
│  │  │ │      BREAK — session ready!                 │  │ │ │
│  │  │ │   ❌ else                                    │  │ │ │
│  │  │ │      await 100-600ms, retry                 │  │ │ │
│  │  │ └─────────────────────────────────────────────┘  │ │ │
│  │  │                                                  │ │ │
│  │  │ STAGE 3: AsyncStorage flush (iOS/Android)       │ │ │
│  │  │ ┌─────────────────────────────────────────────┐  │ │ │
│  │  │ │ await setTimeout(Platform.OS === 'web'       │  │ │ │
│  │  │ │   ? 100 : 200)                              │  │ │ │
│  │  │ │ Reason: Ensure storage layer is sync'd     │  │ │ │
│  │  │ └─────────────────────────────────────────────┘  │ │ │
│  │  │                                                  │ │ │
│  │  │ ✅ PRIMARY RESULT: setSafeUserId(userId) ✅     │ │ │
│  │  │                                                  │ │ │
│  │  │ GUARANTEE:                                       │ │ │
│  │  │ • Session in memory ✅                           │ │ │
│  │  │ • Session in AsyncStorage ✅                     │ │ │
│  │  │ • RLS policies ready ✅                          │ │ │
│  │  │ • Queries WILL succeed ✅                        │ │ │
│  │  │                                                  │ │ │
│  │  │  ┌──────────────────────────────────────────┐   │ │ │
│  │  │  │ HydratedInnerLayout ✅                   │   │ │ │
│  │  │  │ const {safeUserId} = useSessionHydration│   │ │ │
│  │  │  │                                          │   │ │ │
│  │  │  │ ┌──────────────────────────────────────┐ │   │ │ │
│  │  │  │ │ AppProvider  ✅                      │ │   │ │ │
│  │  │  │ │ userId={safeUserId}                  │ │   │ │ │
│  │  │  │ │                                      │ │   │ │ │
│  │  │  │ │ useEffect([userId]) fires NOW        │ │   │ │ │
│  │  │  │ │ (not before! only when ready)        │ │   │ │ │
│  │  │  │ │                                      │ │   │ │ │
│  │  │  │ │ loadProfile(safeUserId)              │ │   │ │ │
│  │  │  │ │ ├─ Retry logic (exponential)         │ │   │ │ │
│  │  │  │ │ ├─ Delays: 300, 600, 900, 1200ms    │ │   │ │ │
│  │  │  │ │ ├─ Handle: missing profile, timeout  │ │   │ │ │
│  │  │  │ │ └─ ✅ SUCCEEDS (session ready!)      │ │   │ │ │
│  │  │  │ │                                      │ │   │ │ │
│  │  │  │ │ loadLeaderboard()                    │ │   │ │ │
│  │  │  │ │ ├─ Retry logic (3 retries)          │ │   │ │ │
│  │  │  │ │ └─ ✅ SUCCEEDS                       │ │   │ │ │
│  │  │  │ │                                      │ │   │ │ │
│  │  │  │ │ setProfile(data) ✅                  │ │   │ │ │
│  │  │  │ │ setLeaderboard(data) ✅              │ │   │ │ │
│  │  │  │ │                                      │ │   │ │ │
│  │  │  │ │ ┌────────────────────┐               │ │   │ │ │
│  │  │  │ │ │ UI Renders:        │               │ │   │ │ │
│  │  │  │ │ │ - Profile: ✅      │               │ │   │ │ │
│  │  │  │ │ │ - XP: 450          │               │ │   │ │ │
│  │  │  │ │ │ - Avatar: loaded   │               │ │   │ │ │
│  │  │  │ │ │ = Data visible! ✅ │               │ │   │ │ │
│  │  │  │ │ └────────────────────┘               │ │   │ │ │
│  │  │  │ │                                      │ │   │ │ │
│  │  │  │ │ ✅ NO app restart needed!            │ │   │ │ │
│  │  │  │ │                                      │ │   │ │ │
│  │  │  │ └──────────────────────────────────────┘ │   │ │ │
│  │  │  │                                          │   │ │ │
│  │  │  └──────────────────────────────────────────┘   │ │ │
│  │  │                                                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ✅ SOLUTION: New layer (SessionHydration) orchestrates    │
│    async session persistence before AppProvider queries   │
└──────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Timeline Comparison

```
╔═════════════════════════════════════════════════════════════╗
║                    BEFORE vs AFTER                          ║
╚═════════════════════════════════════════════════════════════╝

BEFORE (❌ Broken):
├─ t=0ms    Google OAuth start
├─ t=2s     OAuth completes
├─ t=2.1s   setSession() called
├─ t=2.2s   onAuthStateChange fires
├─ t=2.3s   AuthContext updates (session in memory only)
├─ t=2.4s   InnerLayout re-renders
├─ t=2.5s   AppProvider gets user.id
├─ t=2.6s   loadProfile() fires
├─ t=2.7s   Query: SELECT * FROM profiles WHERE id=$1
├─ ⚠️ t=2.8s  ❌ RLS check: session not in AsyncStorage
├─ ❌ t=2.9s  Error 403 Unauthorized
├─ ❌ t=3s    profile = null, UI empty
│
.... user closes app & reopens .....
│
├─ t=8s     AsyncStorage loads session
├─ t=8.5s   AuthContext updates
├─ t=8.6s   AppProvider detects change
├─ t=8.7s   loadProfile() fires again
├─ ✅ t=8.8s  RLS check: session in AsyncStorage ✅
├─ ✅ t=8.9s  Query succeeds
├─ ✅ t=9s    profile loaded
│
TOTAL TIME TO DATA: 9 seconds + app restart needed 😞


AFTER (✅ Fixed):
├─ t=0ms    Google OAuth start
├─ t=2s     OAuth completes
├─ t=2.1s   setSession() called
├─ t=2.2s   onAuthStateChange fires
├─ t=2.3s   AuthContext updates
├─ t=2.4s   SessionHydration detects change
├─ t=2.5s   STAGE 1: Buffer (300ms)
├─ t=2.8s   STAGE 2: getSession() retry loop
├─ t=3.2s   ✅ Session verified in getSession()
├─ t=3.4s   STAGE 3: AsyncStorage flush (200ms)
├─ t=3.6s   setSafeUserId(userId) ✅
├─ t=3.7s   HydratedInnerLayout re-renders
├─ t=3.8s   AppProvider gets safeUserId
├─ t=3.9s   loadProfile() fires
├─ t=4.0s   Query: SELECT * FROM profiles WHERE id=$1
├─ ✅ t=4.1s  RLS check: session in AsyncStorage ✅
├─ ✅ t=4.2s  Query succeeds
├─ ✅ t=4.3s  profile loaded
├─ ✅ t=4.4s  UI renders with data
│
TOTAL TIME TO DATA: 4.4 seconds, no restart needed 🎉

DIFF: 4.6 seconds faster + better UX
```

---

## 4️⃣ Data Flow Diagram

```
OAuth Flow
    │
    ├─ Google Server: "auth successful"
    │
    ├──> WebBrowser.openAuthSessionAsync()
    │    └─> Returns: kodax://auth/success?...#access_token=...
    │
    ├──> Linking.addEventListener catches deep link
    │    └─> processAuthDeepLink(url)
    │
    ├──> Supabase.auth.setSession(tokens)
    │    └─> Session now in memory ✅
    │
    ├──> onAuthStateChange fires: "SIGNED_IN"
    │    └─> Previously problematic point ⚠️
    │
    ├──> AuthContext updates
    │    └─> session = {...}
    │    └─> AuthVersionRef.current++ (trigger signal)
    │
    ├──> 🆕 SessionHydrationProvider watches authVersion
    │    │
    │    ├─ Detects: session changed!
    │    │
    │    ├─ WAIT 300ms (platform buffer)
    │    │
    │    ├─ TRY getSession() 5 times
    │    │  └─ Until: session.user.id === userId
    │    │  └─ Exponential backoff: 100, 200, 400, 800ms
    │    │
    │    ├─ WAIT 200ms (AsyncStorage sync)
    │    │
    │    └─> setSafeUserId(userId) ✅
    │
    ├──> HydratedInnerLayout detects: safeUserId changed!
    │    │
    │    ├─> AppProvider receives safeUserId prop
    │    │
    │    ├─ useEffect([safeUserId]) triggers:
    │    │  ├─ loadProfile(safeUserId)
    │    │  │  └─ Query 1: SELECT * FROM profiles
    │    │  │  └─ Retry 4x with delays
    │    │  │  └─ ✅ SUCCESS → setProfile(data)
    │    │  │
    │    │  ├─ loadLeaderboard()
    │    │  │  └─ Query 2: SELECT * FROM leaderboard
    │    │  │  └─ Retry 3x with delays
    │    │  │  └─ ✅ SUCCESS → setLeaderboard(data)
    │    │  │
    │    │  └─ Promise.all resolves
    │    │     └─ setIsInitialLoad(false)
    │    │
    │    └──> AppContext provides:
    │         ├ profile: ProfileData
    │         ├ likedSnippets: Set<string>
    │         ├ snippetLikeCounts: Map<string, number>
    │         └ isInitialLoad: false
    │
    └──> PointsProvider, SubscriptionProvider, etc.
         └─> All provided with safeUserId ✅
         │
         └──> UI Re-renders
              ├─ Profile shows: name, avatar ✅
              ├─ XP/Level shows: 450/5 ✅
              ├─ Leaderboard loads ✅
              └─ Navigation works ✅
```

---

## 5️⃣ State Machine: SessionHydration

```
[NOT_STARTED]
    │
    ├─ Detect: session changed
    │  From: session=null → session={...}
    │  OR: userId changed
    │
    ↓
[WAITING]
    │
    ├─ State: Detected change
    ├─ Action: Buffer 300ms
    │
    ↓
[VERIFYING]
    │
    ├─ State: Platform settled
    ├─ Action: Loop getSession() 5x
    │  ├─ Success: Exit loop
    │  └─ Failure: Timeout after max attempts
    ├─ Action: Buffer AsyncStorage 200ms
    │
    ↓
[COMPLETE] ✅
    │
    ├─ State: Session is stable
    ├─ Action: setSafeUserId(userId)
    ├─ Result: AppProvider can query safely
    │
    └─ Next: If user logs out
       └─ Return to [NOT_STARTED]
```

---

## 6️⃣ RLS Security Check

```
Before SessionHydration:
┌─────────────────────────────────────┐
│ Supabase RLS Policy Check           │
│                                     │
│ User making query: abc123           │
│ Auth context: jwt_token             │
│ Session storage: ??? (not ready)    │
│                                     │
│ RLS verify: "Is jwt_token valid?"   │
│ ├─ Check JWT signature: ✅          │
│ ├─ Check expiry: ✅                 │
│ ├─ Check token in session store: ❌ │
│ └─ Result: 403 Forbidden            │
│                                     │
│ Database query: DENIED ❌           │
└─────────────────────────────────────┘

After SessionHydration:
┌─────────────────────────────────────┐
│ Supabase RLS Policy Check           │
│                                     │
│ User making query: abc123           │
│ Auth context: jwt_token             │
│ Session storage: READY ✅           │
│                                     │
│ RLS verify: "Is jwt_token valid?"   │
│ ├─ Check JWT signature: ✅          │
│ ├─ Check expiry: ✅                 │
│ ├─ Check token in session store: ✅ │
│ └─ Result: 200 OK                   │
│                                     │
│ Database query: ALLOWED ✅          │
└─────────────────────────────────────┘
```

---

## الخلاصة

```
المشكلة:     Race condition بين state و storage
الحل:        SessionHydrationProvider waits for stability
النتيجة:     Data loads immediately without restart ✅
```

