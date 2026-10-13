# User activity in kodax-admin

Two independent minute-resolution timestamps are visible to administrators:

- **آخر فتح للتطبيق** / `last_app_open_at`: explicitly recorded by the updated
  app on authenticated foreground entry, including reopening a saved session.
  Browser visibility changes and native AppState changes are observed once by
  AuthProvider. No heartbeat, token-refresh tracking or online indicator.
  Android needs a build containing the tracker; the web picks it up on deployment.
- **آخر تفاعل** / `last_interaction_at`: works immediately with existing clients,
  observing persisted user actions on the server. This includes content edits,
  comments, likes, follows, blocks, sent/read messages, read notifications,
  verified learning, challenge attempts, AI use, ads, goals, course unlocks,
  reports, support, profile edits and notification preferences.

Historical timestamps are recovered from known authored actions. Sign-in times,
profile update times, notification delivery, social counters, moderation and frozen
streak days are not used as evidence of interaction. Some historical operations
(for example AI use aggregated by day) lack a timestamp and cannot be recovered.
Offline actions appear after synchronization. Visits/navigation that leave no
server write cannot be inferred. A streak proves learning activity, but a missing
or frozen streak does not prove the app was not opened.

The table `user_app_activity` is readable only by administrators. Clients cannot
set timestamps or another user's ID. `record_app_open()` derives identity and time
on the server; interaction triggers derive the actor from the authorized action.
Minute deduplication avoids repeated writes. These observers do not grant XP,
coins, streak days or notification rewards.

Validation: `app-open-tracking.test.ts`, `app-open-db.test.ts`, and
`interaction-activity-db.test.ts` under `scripts/challenge-audit`, plus application
type checking and a Next.js production build of kodax-admin.
