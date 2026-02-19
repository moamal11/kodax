# 🚀 Kodax - Production-Ready Code Editor

**Advanced AI-powered code editor with full backend integration, Monaco Editor, real-time execution, and gamification**

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Components Documentation](#components-documentation)
- [Services Documentation](#services-documentation)
- [Database Schema](#database-schema)
- [API Integration](#api-integration)
- [Usage Guide](#usage-guide)

---

## 🌟 Overview

Kodax is a production-ready, AI-powered programming education platform featuring:
- **Monaco Editor** for web (industry-standard)
- **Multi-language support** (JavaScript, TypeScript, Python, Java, C++, and more)
- **Real code execution** via Piston API
- **AI code review** powered by GPT-4/5.2
- **Gamification system** with XP, levels, achievements
- **Real-time notifications**
- **Snippet management** with version history
- **Beautiful UI** with Glass morphism and Red/Pink/Purple theme

---

## ✨ Features

### Code Editor
- ✅ **Monaco Editor** on web with IntelliSense, syntax highlighting, auto-complete
- ✅ **Mobile fallback** with line numbers and basic highlighting
- ✅ **13+ programming languages** supported
- ✅ **Real-time code execution** with Piston API
- ✅ **Output console** with logs, errors, and execution time
- ✅ **Test runner** with visual test case validation
- ✅ **Code formatting** and syntax validation

### AI Integration
- ✅ **AI Code Review** with GPT-4/5.2 API
- ✅ **Code suggestions** with line-specific feedback
- ✅ **Quality score** (0-100)
- ✅ **Strengths, improvements, and optimizations**
- ✅ **Fallback demo mode** for development

### Snippet Management
- ✅ **Save/Load snippets** with Supabase
- ✅ **Version history** tracking
- ✅ **Public/Private** snippets
- ✅ **Tags and search**
- ✅ **Like, view, and fork** counting
- ✅ **Snippet drawer** with filtering

### Gamification
- ✅ **XP system** with animated particles
- ✅ **Level progression** (500 XP per level)
- ✅ **Achievements** system
- ✅ **Streak tracking**
- ✅ **Leaderboards**
- ✅ **Visual celebrations** on level up

### Notifications
- ✅ **Real-time notifications** badge
- ✅ **Achievement unlocks**
- ✅ **Likes and comments**
- ✅ **System messages**
- ✅ **Mark as read** functionality

---

## 🛠 Tech Stack

### Frontend
- **Expo SDK 54** - Cross-platform framework
- **React Native** - Mobile/web development
- **TypeScript** - Type safety
- **NativeWind 4.x** - Tailwind CSS for React Native
- **React Native Reanimated 3/4** - 60fps animations
- **Expo Router 6.0.22** - File-based navigation

### UI Components
- **expo-linear-gradient** - Gradient effects
- **expo-blur** - Glass morphism
- **react-native-svg** - SVG graphics
- **@expo/vector-icons** - Material icons

### Backend
- **Supabase** - PostgreSQL, Auth, Storage, Realtime
- **Piston API** - Code execution (https://emkc.org)
- **GPT-4/5.2 API** - AI code review

### State & Data
- **React Hooks** - State management
- **Supabase Client** - Real-time subscriptions

---

## 📁 Project Structure

```
kodax/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Home page
│   │   ├── code.tsx            # ⭐ Code Editor page (MAIN)
│   │   ├── learn.tsx           # Learning page
│   │   ├── ai.tsx              # AI Assistant page
│   │   └── profile.tsx         # Profile page
│   └── _layout.tsx             # Root layout
├── src/
│   ├── components/
│   │   ├── ui/                 # 10 UI components
│   │   │   ├── ParticleBackground.tsx
│   │   │   ├── CosmicCard.tsx
│   │   │   ├── AnimatedButton.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── BadgeComponent.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── gamification/       # 6 gamification components
│   │   │   ├── LevelUpModal.tsx
│   │   │   ├── StreakCounter.tsx
│   │   │   ├── AchievementUnlock.tsx
│   │   │   ├── LeaderboardCard.tsx
│   │   │   ├── ChallengeTimer.tsx
│   │   │   └── XPParticles.tsx
│   │   └── editor/             # ⭐ Code Editor components
│   │       ├── LanguageSelector.tsx
│   │       ├── OutputConsole.tsx
│   │       ├── EditorToolbar.tsx
│   │       ├── CodeSnippetCard.tsx
│   │       ├── MonacoEditor.tsx        # ⭐ NEW
│   │       ├── TestRunner.tsx          # ⭐ NEW
│   │       ├── SnippetListDrawer.tsx   # ⭐ NEW
│   │       └── NotificationButton.tsx  # ⭐ NEW
│   └── services/               # ⭐ Backend services
│       ├── codeExecution.ts    # ⭐ Piston API integration
│       ├── aiReview.ts         # ⭐ GPT-4/5.2 integration
│       └── snippetService.ts   # ⭐ Supabase CRUD
├── DATABASE_SCHEMA.sql         # ⭐ Complete database schema
└── README_CODE_EDITOR.md       # ⭐ This file
```

---

## 🚀 Setup Instructions

### 1. Prerequisites
```bash
node -v  # v18+ required
npm -v   # v9+ required
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create `.env` file:
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API (GPT-4/5.2)
EXPO_PUBLIC_AI_API_ENDPOINT=your_gpt_api_endpoint
EXPO_PUBLIC_AI_API_KEY=your_gpt_api_key

# Piston API (optional, uses public endpoint by default)
EXPO_PUBLIC_PISTON_API_URL=https://emkc.org/api/v2/piston
```

### 4. Database Setup
Run the SQL schema in your Supabase dashboard:
```bash
# Copy contents of DATABASE_SCHEMA.sql to Supabase SQL Editor
# Execute the entire schema
```

This creates:
- 📦 `code_snippets` table
- 📦 `snippet_versions` table  
- 📦 `snippet_likes` table
- 📦 `notifications` table
- 📦 `user_stats` table
- 📦 `achievements` table
- 📦 `user_achievements` table
- 📦 `code_execution_history` table
- 📦 `ai_reviews` table
- 🔒 Row Level Security policies
- ⚡ Triggers for auto-updates
- 🎯 Sample achievements

### 5. Run the App

**Web:**
```bash
npm run web
# Opens at http://localhost:8082
```

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

---

## 📦 Components Documentation

### MonacoEditor.tsx
**Location:** `src/components/editor/MonacoEditor.tsx`

**Purpose:** Professional code editor with Monaco on web, TextInput fallback on mobile

**Props:**
```typescript
interface MonacoEditorProps {
  value: string;           // Current code
  onChange: (value: string) => void;  // Code change handler
  language: string;        // Programming language
  readOnly?: boolean;      // Read-only mode
  height?: number;         // Editor height
}
```

**Features:**
- Monaco Editor via CDN (web)
- IntelliSense and auto-complete
- Syntax highlighting
- vs-dark theme
- Line numbers
- TextInput fallback (mobile)

**Usage:**
```tsx
<MonacoEditor
  value={code}
  language="javascript"
  onChange={setCode}
  height={400}
/>
```

---

### TestRunner.tsx
**Location:** `src/components/editor/TestRunner.tsx`

**Purpose:** Visual test case execution and validation

**Props:**
```typescript
interface TestRunnerProps {
  tests: TestCase[];       // Array of test cases
}

interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}
```

**Features:**
- Test case cards
- Pass/fail indicators
- Progress bar
- Input/Expected/Actual output display
- Execution time tracking
- Empty state

**Usage:**
```tsx
<TestRunner tests={testCases} />
```

---

### SnippetListDrawer.tsx
**Location:** `src/components/editor/SnippetListDrawer.tsx`

**Purpose:** Drawer for browsing and loading saved snippets

**Props:**
```typescript
interface SnippetListDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSelectSnippet: (snippet: CodeSnippet) => void;
  userId: string;
}
```

**Features:**
- Search snippets
- Filter by language
- Load/Delete actions
- Animated drawer
- Empty state

**Usage:**
```tsx
<SnippetListDrawer
  visible={drawerVisible}
  onClose={() => setDrawerVisible(false)}
  onSelectSnippet={handleSelectSnippet}
  userId={userId}
/>
```

---

### NotificationButton.tsx
**Location:** `src/components/editor/NotificationButton.tsx`

**Purpose:** Real-time notifications with badge and dropdown

**Props:**
```typescript
interface NotificationButtonProps {
  userId: string;
  onNotificationPress?: (notification: Notification) => void;
}
```

**Features:**
- Badge count
- Bell animation
- Notification cards
- Mark as read
- Mark all as read
- Empty state

**Usage:**
```tsx
<NotificationButton userId={userId} />
```

---

## 🔧 Services Documentation

### codeExecution.ts
**Location:** `src/services/codeExecution.ts`

**Purpose:** Execute code via Piston API

**Functions:**
```typescript
// Execute code
async function executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult>

// Simulate execution (demo)
function simulateExecution(code: string, language: string): CodeExecutionResult
```

**Supported Languages:**
- JavaScript (Node.js 20.17.0)
- TypeScript (Deno 1.32.3)
- Python (3.12.0)
- Java (OpenJDK 17.0.5)
- C++ (GCC 13.2.0)
- C (GCC 13.2.0)
- C# (Mono 6.12.0)
- Go (1.21.0)
- Rust (1.73.0)
- Ruby (3.2.2)
- PHP (8.3.0)
- Swift (5.9.0)
- Kotlin (1.9.0)

**Usage:**
```typescript
const result = await executeCode({
  code: 'console.log("Hello World");',
  language: 'javascript'
});

if (result.success) {
  console.log(result.output);
}
```

---

### aiReview.ts
**Location:** `src/services/aiReview.ts`

**Purpose:** AI code review with GPT-4/5.2

**Functions:**
```typescript
// Review code with AI
async function reviewCode(request: AIReviewRequest): Promise<AIReviewResult>

// Simulate AI review (demo)
function simulateAIReview(request: AIReviewRequest): AIReviewResult
```

**Response:**
```typescript
interface AIReviewResult {
  success: boolean;
  review?: {
    score: number;              // 0-100
    summary: string;
    suggestions: Array<{
      line?: number;
      severity: 'info' | 'warning' | 'error';
      message: string;
      fix?: string;
    }>;
    strengths: string[];
    improvements: string[];
    optimizations: string[];
  };
  error?: string;
}
```

**Usage:**
```typescript
const review = await reviewCode({
  code: 'function add(a, b) { return a + b; }',
  language: 'javascript'
});

console.log(review.review?.score);  // 85
```

---

### snippetService.ts
**Location:** `src/services/snippetService.ts`

**Purpose:** Supabase integration for snippet management

**Functions:**
```typescript
// Save new snippet
async function saveSnippet(data: SnippetData): Promise<SaveSnippetResult>

// Update existing snippet
async function updateSnippet(snippetId: string, updates: Partial<SnippetData>): Promise<SaveSnippetResult>

// Load user snippets
async function loadUserSnippets(userId: string): Promise<LoadSnippetsResult>

// Publish/unpublish snippet
async function publishSnippet(snippetId: string): Promise<SaveSnippetResult>

// Delete snippet
async function deleteSnippet(snippetId: string): Promise<{ success: boolean; error?: string }>

// Create snippet version
async function createSnippetVersion(snippetId: string, code: string, description?: string): Promise<{ success: boolean; error?: string }>

// Get snippet versions
async function getSnippetVersions(snippetId: string): Promise<{ success: boolean; versions?: any[]; error?: string }>
```

**Usage:**
```typescript
// Save snippet
const result = await saveSnippet({
  title: 'My Snippet',
  code: 'console.log("Hello");',
  language: 'javascript',
  userId: 'user_123',
  isPublic: true
});

// Load snippets
const snippets = await loadUserSnippets('user_123');
```

---

## 🗄 Database Schema

**File:** `DATABASE_SCHEMA.sql`

### Tables
1. **code_snippets** - User code snippets
2. **snippet_versions** - Version history
3. **snippet_likes** - Likes tracking
4. **notifications** - Real-time notifications
5. **user_stats** - XP, level, streak
6. **achievements** - Available achievements
7. **user_achievements** - Unlocked achievements
8. **code_execution_history** - Execution logs
9. **ai_reviews** - AI review history

### Functions
- `update_user_streak(p_user_id UUID)` - Update daily streak
- `award_xp(p_user_id UUID, p_xp INTEGER)` - Award XP and level up

### Policies
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Public snippets viewable by everyone

---

## 🔌 API Integration

### Piston API (Code Execution)
**Endpoint:** `https://emkc.org/api/v2/piston/execute`

**Request:**
```json
{
  "language": "javascript",
  "version": "20.17.0",
  "files": [{ "content": "console.log('Hello');" }]
}
```

**Response:**
```json
{
  "run": {
    "stdout": "Hello\n",
    "stderr": "",
    "code": 0
  }
}
```

---

### GPT-4/5.2 API (AI Review)
**Endpoint:** Your GPT API endpoint

**Request:**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert code reviewer..."
    },
    {
      "role": "user",
      "content": "Review this code:\nfunction add(a, b) { return a + b; }"
    }
  ]
}
```

---

## 📖 Usage Guide

### Basic Code Editing
1. Open Code Editor tab
2. Select language from dropdown
3. Write code in Monaco Editor
4. Click ▶️ Run to execute
5. View output in console

### AI Code Review
1. Write your code
2. Click 🤖 AI Review button
3. Wait for analysis (2-3 seconds)
4. View score, suggestions, and improvements

### Snippet Management
1. Click 📁 folder icon to open drawer
2. Browse saved snippets
3. Click snippet to load it
4. Click 💾 Save to save current code
5. Click 🔗 Share to publish snippet

### Test Runner
1. Switch to "Tests" tab
2. View test cases
3. Run code to execute tests
4. See pass/fail results

### Gamification
- Earn 25 XP on successful execution
- Earn 10 XP on snippet publish
- Earn 15 XP on AI review
- Level up every 500 XP
- Unlock achievements

---

## 🎨 Color Theme
- **Primary Red:** `#ff0844`
- **Secondary Pink:** `#ff6b9d`
- **Accent Purple:** `#c471ed`
- **Dark Background:** `#0f0f1e`

---

## 📝 Notes

### Current Status
✅ All TypeScript errors fixed
✅ Code editor fully functional
✅ AI review integrated
✅ Snippet management working
✅ Gamification system live
✅ Notifications implemented
✅ Database schema ready

### Next Steps (Optional Enhancements)
- [ ] Add more test cases
- [ ] Implement collaborative editing
- [ ] Add code diff viewer
- [ ] Create snippet templates
- [ ] Build challenge system
- [ ] Add social features (comments, profiles)

---

## 🤝 Contributing
This is a production-ready codebase. Feel free to:
- Add more programming languages
- Improve AI prompts
- Enhance UI animations
- Optimize performance

---

## 📄 License
MIT License - Feel free to use in your projects!

---

**Built with ❤️ for Kodax**
