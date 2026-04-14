# Kodax Likes System - Complete Research

## Executive Summary

The likes system in Kodax is a centralized, optimistic-update based architecture with proper state synchronization across all pages. It uses Supabase as the backend with client-side UUID generation and maintains like counts both in the database and in React state via AppContext.

---

## 1. DATABASE STRUCTURE

### Table: `code_likes`

**Location:** [supabase/schema.sql](supabase/schema.sql#L136)

```sql
CREATE TABLE code_likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id UUID REFERENCES code_snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snippet_id)
);
```

**Key Points:**

- **Primary Key:** UUID (client-generated to avoid server-side uuid_generate_v4() issues)
- **Constraints:** UNIQUE(user_id, snippet_id) — One like per user per snippet
- **Cascade Delete:** When user or snippet is deleted, likes are automatically removed
- **No RLS** on code_likes table, but has RLS policy: "Users can manage their own likes"

### Related Table: `code_snippets`

Stores the denormalized `likes_count` field:

```sql
CREATE TABLE code_snippets (
  ...
  likes_count INTEGER DEFAULT 0,
  ...
);
```

**Why Denormalization?**

- Faster loading of snippet lists (no COUNT query needed)
- Better UX with no delay waiting for count calculation
- Keeps count in sync with toggleLike and addComment operations

---

## 2. SERVICE LAYER: codeFeedService.ts

**File:** [src/services/codeFeedService.ts](src/services/codeFeedService.ts)

### 2.1 `checkUserLikes()` - Batch Like Checking

```typescript
export async function checkUserLikes(
  userId: string,
  snippetIds: string[]
): Promise<Set<string>>;
```

**Purpose:** Load which snippets the user has liked (used when loading feeds)

**Implementation:**

```typescript
try {
  if (!snippetIds.length) return new Set();

  const { data, error } = await supabase
    .from('code_likes')
    .select('snippet_id')
    .eq('user_id', userId)
    .in('snippet_id', snippetIds);

  if (error) throw error;

  return new Set((data || []).map((d: any) => d.snippet_id));
} catch {
  return new Set(); // Silent fail — doesn't break page loading
}
```

**Returns:** Set<string> of liked snippet IDs

**Error Handling:** Silent — returns empty Set if query fails

---

### 2.2 `toggleLike()` - Like/Unlike Operation

```typescript
export async function toggleLike(
  userId: string,
  snippetId: string
): Promise<{ liked: boolean; newCount: number; error: string | null }>;
```

**Flow:**

1. Check if user already liked this snippet
2. If exists → DELETE the like (unlike)
3. If not exists → INSERT new like (generate UUID client-side)
4. Get accurate count from database using `{ count: 'exact', head: true }`
5. Update snippet's `likes_count` field

**Key Code:**

```typescript
// Step 1: Check existing like
const { data: existing } = await supabase
  .from('code_likes')
  .select('id')
  .eq('user_id', userId)
  .eq('snippet_id', snippetId)
  .maybeSingle();

// Step 2: Toggle
if (existing) {
  await supabase.from('code_likes').delete().eq('id', existing.id);
} else {
  const likeId = generateUUID(); // Client-side UUID
  await supabase
    .from('code_likes')
    .insert({ id: likeId, user_id: userId, snippet_id: snippetId });
}

// Step 3: Get accurate count
const { count } = await supabase
  .from('code_likes')
  .select('*', { count: 'exact', head: true })
  .eq('snippet_id', snippetId);

// Step 4: Update denormalized count
const newCount = count || 0;
await supabase
  .from('code_snippets')
  .update({ likes_count: newCount })
  .eq('id', snippetId);

return { liked: !existing, newCount, error: null };
```

**Returns:**

- `liked`: boolean (true if just liked, false if unlike)
- `newCount`: exact like count from database
- `error`: null on success or error message

**Error Handling:** Returns error string, not thrown

---

## 3. APPCONTEXT: Centralized Like State Management

**File:** [src/contexts/AppContext.tsx](src/contexts/AppContext.tsx)

### 3.1 State Variables

```typescript
const [likedSnippets, setLikedSnippets] = useState<Set<string>>(new Set());
const [snippetLikeCounts, setSnippetLikeCounts] = useState<Map<string, number>>(
  new Map()
);
const likesInProgressRef = useRef<Set<string>>(new Set());
const likeCooldownRef = useRef<Set<string>>(new Set());
```

**Purpose:**

- `likedSnippets`: Set of snippet IDs currently liked by user
- `snippetLikeCounts`: Map of snippet ID → like count
- `likesInProgressRef`: Prevents race conditions during toggle
- `likeCooldownRef`: 400ms debounce to prevent rapid clicking

### 3.2 `syncLikes()` - Load Like State

```typescript
const syncLikes = useCallback(
  async (snippetIds: string[]) => {
    if (!userId || snippetIds.length === 0) return;
    try {
      const liked = await checkUserLikes(userId, snippetIds);
      setLikedSnippets((prev) => {
        const next = new Set(prev);
        for (const id of snippetIds) {
          if (liked.has(id)) {
            next.add(id);
          } else {
            next.delete(id);
          }
        }
        return next;
      });
    } catch (_e) {
      // Silent — don't break page loading
    }
  },
  [userId]
);
```

**Purpose:** Called when snippets are loaded to populate `likedSnippets` Set

**Called From:**

- [app/(tabs)/code.tsx](<app/(tabs)/code.tsx#L432>) - Feed page
- [app/code/[id].tsx](app/code/%5Bid%5D.tsx#L281) - Details page

**Error Handling:** Silent catch — doesn't throw

---

### 3.3 `updateLikeCounts()` - Initialize Counts

```typescript
const updateLikeCounts = useCallback((counts: Record<string, number>) => {
  setSnippetLikeCounts((prev) => {
    const next = new Map(prev);
    for (const [id, count] of Object.entries(counts)) {
      next.set(id, count);
    }
    return next;
  });
}, []);
```

**Purpose:** Load like counts from snippet data when page loads

**Called From:**

- [app/(tabs)/code.tsx](<app/(tabs)/code.tsx#L438>) - Feed page
- [app/code/[id].tsx](app/code/%5Bid%5D.tsx#L282) - Details page

**Usage:**

```typescript
const counts: Record<string, number> = {};
data.forEach((s) => {
  counts[s.id] = s.likes_count;
});
updateLikeCounts(counts);
```

---

### 3.4 `getLikeCount()` - Get Display Value

```typescript
const getLikeCount = useCallback(
  (snippetId: string, fallback = 0): number => {
    return snippetLikeCounts.get(snippetId) ?? fallback;
  },
  [snippetLikeCounts]
);
```

**Purpose:** Get the current like count to display

**Fallback:** Uses `fallback` parameter (usually `item.likes_count` or `snippet?.likes_count`)

**Used In:**

```tsx
// Feed page - showing counts in snippet cards
likes_count: getLikeCount(item.id, item.likes_count);

// Details page - showing count in button
{
  id ? getLikeCount(id, snippet?.likes_count || 0) : 0;
}
إعجاب;
```

---

### 3.5 `toggleLike()` - Main Like/Unlike Function

**The Core Feature with Optimistic Updates**

```typescript
const toggleLike = useCallback(
  async (snippetId: string) => {
    if (!userId) return;

    // ===== منع الضغط المتكرر (Debounce) =====
    if (likesInProgressRef.current.has(snippetId)) return;
    if (likeCooldownRef.current.has(snippetId)) return;

    likesInProgressRef.current.add(snippetId);
    likeCooldownRef.current.add(snippetId);
    setTimeout(() => likeCooldownRef.current.delete(snippetId), 400);

    const wasLiked = likedSnippets.has(snippetId);
    const delta = wasLiked ? -1 : 1;

    // ===== Optimistic Update — Visual feedback immediately =====
    setLikedSnippets((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(snippetId) : next.add(snippetId);
      return next;
    });
    setSnippetLikeCounts((prev) => {
      const next = new Map(prev);
      const current = next.get(snippetId) ?? 0;
      next.set(snippetId, Math.max(0, current + delta));
      return next;
    });

    try {
      const result = await toggleLikeService(userId, snippetId);
      if (result.error) {
        // ===== Rollback on error =====
        setLikedSnippets((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(snippetId) : next.delete(snippetId);
          return next;
        });
        setSnippetLikeCounts((prev) => {
          const next = new Map(prev);
          const current = next.get(snippetId) ?? 0;
          next.set(snippetId, Math.max(0, current - delta));
          return next;
        });
      } else {
        // ===== Update with accurate server count =====
        setSnippetLikeCounts((prev) => {
          const next = new Map(prev);
          next.set(snippetId, result.newCount);
          return next;
        });
      }
    } catch {
      // ===== Rollback on exception =====
      setLikedSnippets((prev) => {
        const next = new Set(prev);
        wasLiked ? next.add(snippetId) : next.delete(snippetId);
        return next;
      });
      setSnippetLikeCounts((prev) => {
        const next = new Map(prev);
        const current = next.get(snippetId) ?? 0;
        next.set(snippetId, Math.max(0, current - delta));
        return next;
      });
    } finally {
      likesInProgressRef.current.delete(snippetId);
    }
  },
  [userId, likedSnippets, snippetLikeCounts]
);
```

**Key Features:**

1. **Debounce (400ms):** Prevents rapid clicking
2. **In-Progress Lock:** Same behavior as debounce for double-checking
3. **Optimistic Update:** Immediate visual feedback
4. **Rollback:** If error, reverts to previous state
5. **Server Count:** Updates with exact count from server after success
6. **Math.max(0, ...):** Prevents negative counts

---

## 4. USAGE IN PAGES

### 4.1 Feed Page: [app/(tabs)/code.tsx](<app/(tabs)/code.tsx>)

**Initialization (Line 432-438):**

```typescript
if (user?.id && data.length > 0) {
  try {
    const ids = data.map((s) => s.id);
    syncLikes(ids); // Load which ones are liked

    const counts: Record<string, number> = {};
    data.forEach((s) => {
      counts[s.id] = s.likes_count;
    });
    updateLikeCounts(counts); // Load counts
  } catch (error) {
    console.error('Error syncing likes:', error);
  }
}
```

**Display (Line 578-580):**

```typescript
<SnippetCard
  snippet={{
    ...item,
    likes_count: getLikeCount(item.id, item.likes_count),  // Get count
  }}
  liked={likedSnippets.has(item.id)}  // Is it liked?
  onLike={() => handleLike(item.id)}  // Call toggle
  ...
/>
```

**Handler:**

```typescript
const handleLike = useCallback(
  async (snippetId: string) => {
    if (!user?.id) {
      router.push('/login');
      return;
    }
    await globalToggleLike(snippetId);
  },
  [user?.id, globalToggleLike, router]
);
```

---

### 4.2 Details Page: [app/code/[id].tsx](app/code/%5Bid%5D.tsx)

**Initialization (Line 281-282):**

```typescript
const load = async () => {
  const { data, error } = await getSnippetById(id);
  if (!error && data) {
    setSnippet(data);
    syncLikes([id]);  // Load like state
    updateLikeCounts({ [id]: data.likes_count || 0 });  // Load count
    incrementViews(id, user?.id);
    ...
  }
};
```

**Display (Line 1082):**

```tsx
<Text style={styles.actionButtonText}>
  {id ? getLikeCount(id, snippet?.likes_count || 0) : 0} إعجاب
</Text>
```

**Action Button:**

```tsx
<TouchableOpacity
  onPress={async () => {
    if (!user?.id) {
      router.push('/login');
      return;
    }
    await globalToggleLike(id);
  }}
>
  <MaterialIcons
    name={(id ? likedSnippets.has(id) : false) ? 'favorite' : 'favorite-border'}
    size={22}
    color={(id ? likedSnippets.has(id) : false) ? '#ef4444' : '#9ca3af'}
  />
</TouchableOpacity>
```

---

## 5. CROSS-PAGE SYNCHRONIZATION

### How It Works:

1. **Single Source of Truth:** AppContext holds `likedSnippets` and `snippetLikeCounts`
2. **Provider Wrapping:** All pages wrapped in `<AppProvider userId={currentUserId}>`
3. **Shared State:** When like is toggled, ALL pages see the update
4. **Map Keys:** Snippet IDs are the connecting point

### Example Flow:

```
User in Feed Page                    User in Details Page
         ↓                                     ↓
    Click Like btn              ← Connected via AppContext →
         ↓                                     ↓
  optimistic update                   Auto sees update
  setLikedSnippets(...)               without reload
         ↓                                     ↓
  appContext.toggleLike(id)           (same state)
         ↓
  server update
         ↓
  Final count synced
```

---

## 6. INITIALIZATION FLOW WHEN USER LOGS IN

**From AppProvider (AppContext.tsx):**

```typescript
useEffect(() => {
  const prevId = prevUserIdRef.current;
  prevUserIdRef.current = userId;

  if (!userId) {
    // Logged out — clear everything
    setLikedSnippets(new Set());
    setSnippetLikeCounts(new Map());
    return;
  }

  if (prevId !== userId) {
    // New user logged in — no auto-load here
    // Each page loads its own snippets and calls syncLikes
  }
}, [userId]);
```

**Note:** Likes are NOT loaded globally on login. Instead:

- Each page (feed, details) loads its own snippets
- Then calls `syncLikes(snippetIds)` to check which are liked
- Then calls `updateLikeCounts(counts)` to load counts

This is more efficient than eager-loading all liked snippets on login.

---

## 7. IMAGE/ICON HANDLING

### Like Button Display:

- **Liked:** ❤️ Red heart (filled, `'favorite'` icon) - Color: `#ef4444`
- **Not Liked:** 🤍 Gray heart (outline, `'favorite-border'` icon) - Color: `#9ca3af`
- **Text:** Shows count from `getLikeCount()`

---

## 8. COUNT ACCURACY ASSURANCE

### Why Denormalization Works:

1. **Single Source:** `code_likes` table is truth
2. **On Like/Unlike:** Calculation done immediately
   - Query `code_likes` with `count: 'exact'`
   - Update `code_snippets.likes_count`
3. **On Feed Load:** counts come from `code_snippets.likes_count`
4. **No Stale Data:** AppContext uses Map to cache, gets updated on toggle

### Code Pattern:

```typescript
// Always count from code_likes table
const { count } = await supabase
  .from('code_likes')
  .select('*', { count: 'exact', head: true })
  .eq('snippet_id', snippetId);

// Update denormalized count
await supabase
  .from('code_snippets')
  .update({ likes_count: count || 0 })
  .eq('id', snippetId);
```

---

## 9. ERROR SCENARIOS & RECOVERY

### Scenario 1: Network Error During Toggle

- **Optimistic Update Applied:** ✅ UI shows change immediately
- **Server Request Fails:** ❌ Network error occurs
- **Rollback:** ✅ Both `likedSnippets` and `snippetLikeCounts` reverted
- **User Experience:** UI flashes back to old state

### Scenario 2: Check Like Query Fails

```typescript
export async function checkUserLikes(...) {
  try {
    ...
  } catch {
    return new Set();  // Return empty → user sees no likes
  }
}
```

- **Effect:** Page shows all snippets as "not liked"
- **Why:** Silent fail prevents page load crash
- **On Click:** Toggle works normally (loads fresh state)

### Scenario 3: Update Count Query Fails

```typescript
if (result.error) {
  // Rollback optimistic update
}
```

- **Effect:** Action reverted, UI shows old state

---

## 10. COMPARISON TABLE

| Aspect                     | Implementation                                                      |
| -------------------------- | ------------------------------------------------------------------- |
| **Storage**                | `code_likes` table + denormalized `code_snippets.likes_count`       |
| **Fetching**               | `checkUserLikes()` returns Set of liked IDs in batch                |
| **Counting**               | `SELECT * FROM code_likes WHERE snippet_id = ? with count: 'exact'` |
| **Toggle State**           | AppContext with `likedSnippets: Set<string>`                        |
| **Count State**            | AppContext with `snippetLikeCounts: Map<string, number>`            |
| **Synchronization**        | Cross-page via shared AppContext provider                           |
| **Optimistic UI**          | Yes - immediate feedback, rollback on error                         |
| **Debounce**               | 400ms cooldown + in-progress lock                                   |
| **Client-Side Generation** | UUID for like records (to avoid server schema issues)               |
| **Error Handling**         | Errors logged, not thrown; silent fails on check                    |
| **Count Accuracy**         | Always counted from `code_likes` table on toggle                    |

---

## 11. SUMMARY OF EXECUTION FLOW

### Loading Snippets:

```
Page Load
  ↓
getPublicSnippets() or getSnippetById()
  ↓
Returns data with likes_count field
  ↓
Call syncLikes(ids) → checks code_likes table
Call updateLikeCounts(counts) → loads from response
  ↓
UI renders with getLikeCount() for display
```

### Toggling Like:

```
User Click Like
  ↓
Check debounce/in-progress
  ↓
Optimistic Update (Set + Map)
  ↓
Call toggleLikeService()
  ├─ Check if exists
  ├─ Insert/Delete from code_likes
  ├─ Count from code_likes
  └─ Update code_snippets.likes_count
  ↓
If Success: Update Map with server count
If Error: Rollback both Set and Map
```

---

## 12. KEY FILES REFERENCE

| File                                                               | Purpose                               | Lines   |
| ------------------------------------------------------------------ | ------------------------------------- | ------- |
| [src/contexts/AppContext.tsx](src/contexts/AppContext.tsx)         | Central like state & functions        | 1-438   |
| [src/services/codeFeedService.ts](src/services/codeFeedService.ts) | Like operations (toggle, check)       | 191-287 |
| [supabase/schema.sql](supabase/schema.sql)                         | `code_likes` & `code_snippets` tables | 136+    |
| [app/(tabs)/code.tsx](<app/(tabs)/code.tsx>)                       | Feed page - loads & displays likes    | 370-450 |
| [app/code/[id].tsx](app/code/%5Bid%5D.tsx)                         | Details page - shows & toggles like   | 230-290 |

---

## 13. ARCHITECTURAL NOTES

✅ **Strengths:**

- Centralized state prevents inconsistency
- Optimistic updates provide instant feedback
- Rollback on error maintains accuracy
- Silent error handling prevents UX disruption
- Denormalization keeps counts fast

⚠️ **Potential Issues:**

- Race conditions if same snippet liked in multiple tabs (same browser)
- Count mismatch if multiple users modify simultaneously (eventual consistency)
- `code_likes.id` relies on client-side UUID generation

🔒 **Security:**

- RLS policies enforce `auth.uid() = user_id` for all operations
- Only your own likes can be viewed/deleted
- Public viewing of others' likes is allowed
