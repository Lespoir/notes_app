# Product Features

## Status Legend

- ✅ Implemented
- 🟡 Planned
- ❌ Out of scope

---

## 1. Authentication

**Figma:**
- Sign up: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=34-889
- Login: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=34-831

| # | Feature | Status |
|---|---------|--------|
| 1.1 | Sign up screen with email and password fields | ✅ |
| 1.2 | Login screen with email and password fields | ✅ |
| 1.3 | Toggle password visibility (show/hide) on both sign up and login | ✅ |
| 1.4 | Navigation between sign up and login screens | ✅ |
| 1.5 | Redirect to notes screen after successful sign up or login | ✅ |

## 2. Notes List Screen

**Figma:**
- Home with notes: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=1-2
- Home empty state: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=12-486
- Home filtered by category: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=6-17333

| # | Feature | Status |
|---|---------|--------|
| 2.1 | Display all notes as preview cards | 🟡 |
| 2.2 | Empty state when user has no notes | 🟡 |
| 2.3 | Preview card shows: last edited date, category name, title, and content preview | 🟡 |
| 2.4 | Truncate content in preview card when it overflows | 🟡 |
| 2.5 | "New note" button/icon to create a note | 🟡 |
| 2.6 | Category sidebar displayed on the left side | 🟡 |

## 3. Note Creation

**Figma:**
- Upsert note screen: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=2-8568

| # | Feature | Status |
|---|---------|--------|
| 3.1 | Create a new note by clicking the "new note" icon | 🟡 |
| 3.2 | Note is automatically created on click (no explicit save action) | 🟡 |
| 3.3 | New note opens immediately for editing | 🟡 |

## 4. Note Editing

**Figma:**
- Upsert note screen: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=2-8568
- Change note category: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=6-16949

| # | Feature | Status |
|---|---------|--------|
| 4.1 | Edit note title inline | 🟡 |
| 4.2 | Edit note content inline | 🟡 |
| 4.3 | Auto-save on edit (no manual save button) | 🟡 |
| 4.4 | Last edited timestamp updates automatically as user types | 🟡 |
| 4.5 | Change note category via dropdown selector | 🟡 |
| 4.6 | Note background color changes to match the selected category color | 🟡 |
| 4.7 | Close note to return to the notes list screen | 🟡 |

## 5. Categories

**Figma:**
- Category sidebar (visible in Home): https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=1-2

| # | Feature | Status |
|---|---------|--------|
| 5.1 | Three default categories auto-created for new users: Random Thoughts, School, Personal | ✅ |
| 5.2 | Each category has an associated color | ✅ |
| 5.3 | Category sidebar displays: color indicator, category title, and note count | 🟡 |
| 5.4 | "All categories" option to view all notes | 🟡 |
| 5.5 | Click a category to filter notes by that category | 🟡 |
| 5.6 | Click "All categories" to remove the filter and show all notes | 🟡 |

## 6. Voice Input

**Figma:**
- Voice input control: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=7759-574

| # | Feature | Status |
|---|---------|--------|
| 6.1 | Microphone button on the note editing screen to start voice input | 🟡 |
| 6.2 | Real-time speech-to-text transcription using the browser Web Speech API | 🟡 |
| 6.3 | Transcribed text is appended to the note content field | 🟡 |
| 6.4 | Stop button to end the voice recording session | 🟡 |
| 6.5 | Visual recording status indicator (green dot) while actively recording | 🟡 |

## 7. Date Display

**Figma:**
- Visible in Home screens: https://www.figma.com/design/PvH7hLwBEQYmV9kOAA1r85/Notes-Taking-App-Challenge?node-id=1-2

| # | Feature | Status |
|---|---------|--------|
| 7.1 | Display "Today" for notes edited today | 🟡 |
| 7.2 | Display "Yesterday" for notes edited yesterday | 🟡 |
| 7.3 | Display "Month Day" (e.g., "Mar 5") for notes older than yesterday | 🟡 |
| 7.4 | Never display the year | 🟡 |
