# Kodax Likes System - Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React App Pages                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │   Feed Page          │  │   Details Page       │             │
│  │  (code.tsx)          │  │   ([id].tsx)         │             │
│  │                      │  │                      │             │
│  │ • Lists snippets     │  │ • Shows snippet      │             │
│  │ • Shows like counts  │  │ • Shows like count   │             │
│  │ • Like/Unlike button │  │ • Like/Unlike button │             │
│  └──────────┬───────────┘  └──────────┬───────────┘             │
│             │                          │                         │
│             │   getPublicSnippets()    │   getSnippetById()     │
│             │   syncLikes(ids)         │   syncLikes([id])      │
│             │   updateLikeCounts(obj)  │   updateLikeCounts()   │
│             │   toggleLike(id)         │   toggleLike(id)       │
│             │                          │                         │
│             └──────────────┬───────────┘                         │
│                            │                                     │
│         ┌──────────────────▼──────────────────┐                │
│         │    AppContext (Central State)       │                │
│         ├──────────────────────────────────────┤                │
│         │                                      │                │
│         │ likedSnippets: Set<string>          │                │
│         │ ├─ snippet-id-1                     │                │
│         │ ├─ snippet-id-2                     │                │
│         │ └─ snippet-id-3                     │                │
│         │                                      │                │
│         │ snippetLikeCounts: Map<str, num>   │                │
│         │ ├─ snippet-id-1 → 42                │                │
│         │ ├─ snippet-id-2 → 15                │                │
│         │ └─ snippet-id-3 → 8                 │                │
│         │                                      │                │
│         │ Functions:                           │                │
│         │ • syncLikes(ids)                    │                │
│         │ • updateLikeCounts(counts)          │                │
│         │ • toggleLike(id)                    │                │
│         │ • getLikeCount(id, fallback?)       │                │
│         │ • isLikeInProgress(id)              │                │
│         │                                      │                │
│         └──────────────────┬───────────────────┘                │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    codeFeedService
                             │
                 ┌───────────┴───────────┐
                 │                       │
          checkUserLikes()        toggleLike()
                 │                       │
                 ▼                       ▼
┌──────────────────────────────────────────────────────────┐
│            Supabase (Backend)                             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐     │
│  │   code_likes         │  │  code_snippets       │     │
│  │  ────────────────   │  │  ───────────────────  │     │
│  │  id (UUID)          │  │  id (UUID)            │     │
│  │  user_id (FK)       │  │  user_id (FK)         │     │
│  │  snippet_id (FK)    │  │  title                │     │
│  │  created_at         │  │  code                 │     │
│  │                     │  │  language             │     │
│  │  UNIQUE(user_id,    │  │  likes_count ⭐       │     │
│  │          snippet_id)│  │  comments_count       │     │
│  │                     │  │  views_count          │     │
│  │                     │  │  created_at           │     │
│  │                     │  │  updated_at           │     │
│  └──────────────────────┘  └──────────────────────┘     │
│                                                           │
│  Operations:                                              │
│  • SELECT snippet_id FROM code_likes                     │
│    WHERE user_id = ? AND snippet_id IN (...)            │
│  • SELECT COUNT(*) FROM code_likes                       │
│    WHERE snippet_id = ?                                  │
│  • INSERT INTO code_likes (id, user_id, snippet_id)     │
│  • DELETE FROM code_likes WHERE id = ?                   │
│  • UPDATE code_snippets SET likes_count = ? WHERE id = ? │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Flow Diagrams

### 1. Initial Page Load - Like State

```
┌─────────────────────────────────────────────────────────┐
│ User opens Feed Page                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ getPublicSnippets()    │
        │ (fetch 20 snippets)    │
        └────────────┬───────────┘
                     │
                     ▼
        ┌───────────────────────────────────────┐
        │ Response with likes_count for each    │
        │ Example:                              │
        │ [                                     │
        │   { id: 'abc123', likes_count: 42 }, │
        │   { id: 'def456', likes_count: 15 }, │
        │   { id: 'ghi789', likes_count: 8 }   │
        │ ]                                     │
        └────────────┬────────────────────────┘
                     │
                     ▼
            ┌─────────────────────────────────┐
            │ syncLikes(['abc123',             │
            │             'def456',            │
            │             'ghi789'])           │
            └────────────┬────────────────────┘
                         │
            ┌────────────▼───────────┐
            │ checkUserLikes(        │
            │   userId,              │
            │   [abc, def, ghi]      │
            │ )                      │
            └────────────┬───────────┘
                         │
            Supabase Query:
            SELECT snippet_id FROM code_likes
            WHERE user_id = 'user123'
              AND snippet_id IN ('abc123', 'def456', 'ghi789')
                         │
                         ▼
            Response: ['abc123']  ← User liked only abc123
                         │
            ┌────────────▼───────────────────┐
            │ setLikedSnippets(new Set(      │
            │   ['abc123']                   │
            │ ))                             │
            └────────────┬────────────────────┘
                         │
                         ▼
            ┌─────────────────────────────────┐
            │ updateLikeCounts({              │
            │   'abc123': 42,                 │
            │   'def456': 15,                 │
            │   'ghi789': 8                   │
            │ })                              │
            └────────────┬────────────────────┘
                         │
                         ▼
            ┌────────────────────────────────┐
            │ setSnippetLikeCounts(           │
            │   Map([                         │
            │     ['abc123', 42],            │
            │     ['def456', 15],            │
            │     ['ghi789', 8]              │
            │   ])                           │
            │ )                              │
            └────────────┬────────────────────┘
                         │
                         ▼
            ┌────────────────────────────────┐
            │ UI Ready!                      │
            │ • Heart icon: filled (red)     │
            │ • Count: 42                    │
            │   for 'abc123'                 │
            │ • Hearts: outline (gray)       │
            │ • Counts: 15, 8                │
            │   for 'def456', 'ghi789'      │
            └────────────────────────────────┘
```

### 2. Like Toggle Flow - Optimistic Update

```
┌──────────────────────────────────┐
│ User clicks ♡ on snippet 'abc123'│
│ (currently not liked)             │
└─────────────────┬────────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │ toggleLike('abc123')        │
    │ called in AppContext        │
    └────────────┬────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ Check for duplicates:         │
    │ • likesInProgressRef.has()    │
    │ • likeCooldownRef.has()       │
    │ → both empty, proceed         │
    └────────────┬──────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ OPTIMISTIC UPDATE (instant) │
    │                             │
    │ setLikedSnippets(prev =>    │
    │   new Set([...abc123])      │
    │ )                           │
    │                             │
    │ setSnippetLikeCounts(       │
    │   Map([..., [abc, 43], ...])│
    │ )                           │
    └────────────┬────────────────┘
                 │
                 ▼ [UI immediately shows: ❤ 43]
    ┌─────────────────────────────┐
    │ Server Request Sent:        │
    │ toggleLikeService(          │
    │   'user123',                │
    │   'abc123'                  │
    │ )                           │
    └────────────┬────────────────┘
                 │
├─────────────────────────────────────────────────────┤
│ Supabase operations:                                 │
│                                                      │
│ 1. SELECT id FROM code_likes                        │
│    WHERE user_id = 'user123' AND snippet_id='abc123'│
│    → NULL (no like exists)                          │
│                                                      │
│ 2. INSERT INTO code_likes                           │
│    VALUES (uuid(), 'user123', 'abc123', now())      │
│                                                      │
│ 3. SELECT COUNT(*) FROM code_likes                  │
│    WHERE snippet_id = 'abc123'                      │
│    → 43                                             │
│                                                      │
│ 4. UPDATE code_snippets                             │
│    SET likes_count = 43                             │
│    WHERE id = 'abc123'                              │
│                                                      │
│ Returns: { liked: true, newCount: 43, error: null } │
├─────────────────────────────────────────────────────┤
                 │
                 ▼
    ┌─────────────────────────────┐
    │ Update with server count:   │
    │                             │
    │ setSnippetLikeCounts(       │
    │   Map([..., [abc, 43], ...])│
    │ )                           │
    │ (count already 43, no change)│
    │                             │
    │ ✅ Success - keep UI as is  │
    └─────────────────────────────┘
```

### 3. Like Toggle Flow - Error Rollback

```
┌──────────────────────────────────┐
│ User clicks ♡ on snippet 'abc123'│
│ (currently not liked)             │
└─────────────────┬────────────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │ toggleLike('abc123')        │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ OPTIMISTIC UPDATE           │
    │ UI shows: ❤ 43              │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ toggleLikeService() called   │
    └────────────┬─────────────────┘
                 │
        ❌ NETWORK ERROR OR
           DB CONSTRAINT VIOLATION
                 │
                 ▼
    ┌──────────────────────────────┐
    │ ROLLBACK:                    │
    │                              │
    │ setLikedSnippets(            │
    │   remove 'abc123'            │
    │ )                            │
    │                              │
    │ setSnippetLikeCounts(        │
    │   Map([..., [abc, 42], ...]) │
    │ )                            │
    │                              │
    │ UI reverts: ♡ 42             │
    └──────────────────────────────┘
```

## State Update Patterns

### Pattern 1: setLikedSnippets

```typescript
// Adding a like
setLikedSnippets((prev) => {
  const next = new Set(prev);
  next.add(snippetId);
  return next;
});

// Removing a like
setLikedSnippets((prev) => {
  const next = new Set(prev);
  next.delete(snippetId);
  return next;
});

// Checking if liked
const isLiked = likedSnippets.has(snippetId);

// Syncing from DB
setLikedSnippets((prev) => {
  const next = new Set(prev);
  for (const id of snippetIds) {
    if (dbLikedSet.has(id)) {
      next.add(id);
    } else {
      next.delete(id);
    }
  }
  return next;
});
```

### Pattern 2: setSnippetLikeCounts

```typescript
// Incrementing count (optimistic)
setSnippetLikeCounts((prev) => {
  const next = new Map(prev);
  const current = next.get(snippetId) ?? 0;
  next.set(snippetId, Math.max(0, current + 1));
  return next;
});

// Updating from server
setSnippetLikeCounts((prev) => {
  const next = new Map(prev);
  next.set(snippetId, serverCount);
  return next;
});

// Bulk update from feed load
setSnippetLikeCounts((prev) => {
  const next = new Map(prev);
  for (const [id, count] of Object.entries(counts)) {
    next.set(id, count);
  }
  return next;
});

// Getting a count
const likeCount = snippetLikeCounts.get(snippetId) ?? 0;
```

## Call Stack Example

```
CodeFeedScreen Component
  │
  ├─ useApp() hook
  │  ├─ toggleLike: (snippetId: string) => Promise<void>
  │  ├─ syncLikes: (snippetIds: string[]) => Promise<void>
  │  ├─ updateLikeCounts: (counts: Record<string, number>) => void
  │  ├─ getLikeCount: (snippetId: string, fallback?: number) => number
  │  ├─ likedSnippets: Set<string>
  │  └─ snippetLikeCounts: Map<string, number>
  │
  ├─ On Page Load:
  │  ├─ getPublicSnippets() [codeFeedService]
  │  │  └─ returns array with likes_count
  │  │
  │  ├─ syncLikes(ids) [AppContext]
  │  │  └─ checkUserLikes(userId, ids) [codeFeedService]
  │  │     └─ Supabase query: SELECT snippet_id FROM code_likes
  │  │        └─ setLikedSnippets()
  │  │
  │  └─ updateLikeCounts(counts) [AppContext]
  │     └─ setSnippetLikeCounts()
  │
  ├─ Render <SnippetCard>
  │  ├─ liked={likedSnippets.has(item.id)}
  │  └─ snippet={{ ...item, likes_count: getLikeCount(item.id) }}
  │
  ├─ User clicks like button
  │  ├─ handleLike(snippetId)
  │  │  └─ globalToggleLike(snippetId) [AppContext]
  │  │     ├─ setLikedSnippets(), setSnippetLikeCounts() (optimistic)
  │  │     ├─ toggleLikeService(userId, snippetId) [codeFeedService]
  │  │     │  ├─ Check existing like
  │  │     │  ├─ INSERT/DELETE code_likes
  │  │     │  ├─ SELECT COUNT(*) FROM code_likes
  │  │     │  ├─ UPDATE code_snippets.likes_count
  │  │     │  └─ return { liked, newCount, error }
  │  │     │
  │  │     └─ if success: update count from server
  │  │        else if error: rollback both Set & Map
  │  │
  │  └─ UI instantly reflects change via re-render
```

## UI Component Integration

```tsx
// In SnippetCard component
<TouchableOpacity
  onPress={() => onLike()} // Calls toggleLike in AppContext
>
  <MaterialIcons
    name={liked ? 'favorite' : 'favorite-border'}
    color={liked ? '#ef4444' : '#9ca3af'}
  />
  <Text>{likesCount}</Text>
</TouchableOpacity>

// Receives from parent:
// liked={likedSnippets.has(item.id)}
// likesCount={getLikeCount(item.id, item.likes_count)}
```

## Data Flow Summary

```
┌─ Read Path ─────────────────────────────────┐
│                                              │
│  DB (code_likes) ──SQL──> Supabase API    │
│         │                      │             │
│         │              checkUserLikes()     │
│         │                      │             │
│         └──────────> Set<snippetId>        │
│                           │                 │
│                    setLikedSnippets()       │
│                           │                 │
│                      JSX rendering         │
│                   ♡ (if in Set)            │
│                                              │
├─ Write Path ────────────────────────────────┤
│                                              │
│  toggleLike() --optimistic--> Set & Map   │
│         │                                    │
│    toggleLikeService()                     │
│         │                                    │
│    Supabase API ──SQL──> code_likes      │
│         │                                    │
│    Count & Update                          │
│         │                                    │
│    Supabase API ──SQL──> code_snippets   │
│         │                                    │
│    Return new count                        │
│         │                                    │
│    setSnippetLikeCounts() ──> update Map   │
│         │                                    │
│      JSX rendering                         │
│    ♡ 42 (if success)                      │
│                                              │
│    If error: Rollback both Set & Map      │
│                                              │
└──────────────────────────────────────────────┘
```
