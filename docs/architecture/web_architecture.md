# Frontend Architecture & Design Patterns

This document defines the architectural standards for the `notes-app` frontend (Next.js). We follow a **layered architecture** that separates **business domains** from **UI features**, with a pragmatic **MVVM** pattern at the presentation level.

## 1. Core Principles

1.  **Separation of Concerns:** UI (View) must never contain Business Logic.
2.  **Strict Unidirectional Flow:** `Page (app/)` -> `Screen Hook (features/)` -> `Repository (domains/)` -> `Generated API (data/)`.
3.  **Local State First:** State must live as close to the consumer as possible. Global state is the last resort.
4.  **Agnostic Design System:** The UI Library (`notesDS`) knows nothing about the application domain.
5.  **Domain-Driven Organization:** Business logic is organized by domain (what the business cares about), not by UI screen.

---

## 2. Domains vs. Features

This is the most important architectural distinction. Getting this wrong leads to tangled code.

### What is a Domain?

A **domain** represents a real-world business concept that exists independently of any UI. Domains are defined by the business, not by screens.

| Domain       | What it represents                                    | Examples                                             |
| ------------ | ----------------------------------------------------- | ---------------------------------------------------- |
| `notes`      | Note lifecycle (creation, editing, content management) | Note entity, date formatting rules, note repository  |
| `categories` | Note categorization and color coding                  | Category entity, default categories, category repository |
| `users`      | User identity and authentication                      | User entity, user repository                         |

**Key property:** Domains do **not** know about screens or UI. A `notes` domain doesn't know whether its data is displayed on the notes list screen, a preview card, or the note editor.

### What is a Feature?

A **feature** represents a **UI concern** — a screen, a user flow, or a section of the app. Features consume one or more domains.

| Feature       | What it represents                                       | Domains it consumes  |
| ------------- | -------------------------------------------------------- | -------------------- |
| `notes-list`  | Main screen displaying all note preview cards            | notes, categories    |
| `note-editor` | Single note editing view (title, content, category)      | notes, categories    |
| `auth`        | Sign up / login flow                                     | users                |

### When does something get its own Feature?

A feature module exists for **each distinct screen or flow** in the app. When a screen aggregates data from multiple domains (like the notes list pulling from notes + categories), it gets its own feature module — it does not live inside any single domain.

---

## 3. Directory Structure

```text
src/
├── app/                              # 1. ROUTING LAYER (Next.js App Router)
│   ├── layout.tsx                    #    - Root layout. NO logic here.
│   ├── page.tsx                      #    - Notes list screen entry point.
│   ├── auth/
│   │   ├── login/page.tsx            #    - Login screen.
│   │   └── signup/page.tsx           #    - Sign up screen.
│   └── notes/[id]/page.tsx           #    - Note editor screen.
│
├── data/                             # 2. DATA LAYER (Auto-generated, DO NOT edit)
│   └── generated/                    #    ← Orval output
│       ├── [tag]/[tag].ts            #      - TanStack Query hooks per API tag
│       ├── [tag]/[tag].msw.ts        #      - MSW mock handlers per API tag
│       └── models/                   #      - Auto-generated DTOs
│           ├── index.ts              #        Barrel export
│           └── *.ts                  #        Individual DTO interfaces
│
├── domains/                          # 3. DOMAIN LAYER (Business Logic)
│   ├── notes/                        #    Business domain: Notes
│   │   ├── repositories/             #      - Data access hooks (wrap generated API)
│   │   │   └── notes.repository.ts
│   │   ├── entities/                 #      - TypeScript interfaces (business objects)
│   │   │   └── note.entity.ts
│   │   ├── schemas/                  #      - Zod validation schemas
│   │   │   └── note.schema.ts
│   │   └── rules/                    #      - Pure functions (business calculations)
│   │       └── noteDate.rules.ts
│   │
│   ├── categories/                   #    Business domain: Categories
│   │   ├── repositories/
│   │   │   └── categories.repository.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   └── rules/
│   │       └── categoryDefaults.rules.ts
│   │
│   └── users/                        #    Business domain: Users
│       ├── repositories/
│       ├── entities/
│       └── ...
│
├── features/                         # 4. FEATURE LAYER (UI / Screens)
│   ├── notes-list/                   #    Feature: Notes list screen (AGGREGATOR)
│   │   ├── components/               #      - Aggregates notes + categories domains
│   │   │   ├── NotePreviewCard.tsx
│   │   │   ├── CategorySidebar.tsx
│   │   │   └── EmptyState.tsx
│   │   └── hooks/
│   │       └── useNotesList.ts       #      - Notes list screen hook
│   │
│   ├── note-editor/                  #    Feature: Note editor screen
│   │   ├── components/
│   │   │   ├── NoteTitle.tsx
│   │   │   ├── NoteContent.tsx
│   │   │   └── CategorySelector.tsx
│   │   └── hooks/
│   │       └── useNoteEditor.ts      #      - Note editor screen hook
│   │
│   └── auth/                         #    Feature: Auth flow
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   ├── SignUpForm.tsx
│       │   └── PasswordToggle.tsx
│       └── hooks/
│           └── useAuth.ts
│
├── notesDS/                            # 5. DESIGN SYSTEM (Shared UI)
│   ├── tailwind.css                  #    - @theme tokens (oklch colors, spacing, radii)
│   ├── components/                   #    - Atomic components (Button, Input)
│   ├── primitives/                   #    - Layout primitives (Stack, Row, Container)
│   ├── variants/                     #    - CVA variant definitions
│   ├── hooks/                        #    - UI-only hooks (useAnimation)
│   └── utils/                        #    - UI utilities (cn)
│
└── lib/                              # 6. CROSS-CUTTING CONCERNS
    ├── query/                        #    - QueryClient, QueryContextProvider
    ├── monitoring/                   #    - Sentry error reporting
    └── auth/                         #    - Auth providers, ProtectedRoute
```

---

## 4. Data Flow

```
app/page.tsx → features/*/hooks/useScreen.ts → domains/*/repositories/*.repository.ts → data/generated/[tag]/[tag].ts
```

| Layer         | Responsibility                                                    | Imports from                   |
| ------------- | ----------------------------------------------------------------- | ------------------------------ |
| **app/**      | Routing. Calls a screen hook. **NO logic.**                       | `@/features/*`                 |
| **features/** | Screen hooks + presentational components. Orchestrates domains.   | `@/domains/*`, `@/notesDS/*`     |
| **domains/**  | Business entities, rules, repositories. Framework-agnostic logic. | `@/data/*`, `@/lib/*`          |
| **data/**     | Auto-generated API hooks + DTOs. **Never edited manually.**       | (external: axios, react-query) |
| **notesDS/**    | Pure UI components. **Knows nothing about business.**             | (only itself + tailwind)       |
| **lib/**      | Cross-cutting: auth, monitoring, query client.                    | (external libs)                |

### Import Rules (Dependency Direction)

```
app/ → features/ → domains/ → data/
                 → notesDS/
```

- `app/` imports from `features/` only.
- `features/` imports from `domains/` and `notesDS/`. **Never from `data/`.**
- `domains/` imports from `data/` and `lib/`. **Never from `features/` or `notesDS/`.**
- `data/` is auto-generated. **Never import from anything above it.**
- `notesDS/` imports from nothing except itself. **Never from `domains/`, `features/`, or `data/`.**

---

## 5. Domain Layer (`domains/`)

### Repositories

Repositories are the **single data access abstraction** consumed by features. They wrap Orval-generated hooks and expose a domain-specific interface.

**Responsibilities:**

1. **Wrap generated hooks** — Consume Orval hooks internally, expose domain methods.
2. **Transform data** — Map API DTOs to Domain Entities.
3. **Encapsulate mutations** — Expose named actions (`createNote`, `updateNote`) instead of raw `mutateAsync`.
4. **Manage cache invalidation** — Centralize query key invalidation on mutation success.

**Anatomy of a Repository:**

```tsx
// domains/notes/repositories/notes.repository.ts
import type { NoteResponseDto } from '@/data/generated/models';
import {
  useNotesControllerFindAll,
  useNotesControllerCreate,
  useNotesControllerUpdate,
} from '@/data/generated/notes/notes';
import type { NoteEntity } from '@/domains/notes/entities/note.entity';
import { queryClient } from '@/lib/query';

const toEntity = (dto: NoteResponseDto): NoteEntity => ({
  id: dto.id,
  title: dto.title ?? '',
  content: dto.content ?? '',
  categoryId: dto.categoryId,
  lastEditedAt: new Date(dto.lastEditedAt),
});

const QUERY_KEY = '/api/v1/notes';
const invalidate = () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

export const useNotesRepository = (input?: { categoryId?: string }) => {
  const { data, isLoading } = useNotesControllerFindAll({
    category_id: input?.categoryId,
  });

  const { mutateAsync: createMutation } = useNotesControllerCreate({
    mutation: { onSuccess: invalidate },
  });

  const { mutateAsync: updateMutation } = useNotesControllerUpdate({
    mutation: { onSuccess: invalidate },
  });

  return {
    notes: data?.map(toEntity) ?? [],
    isLoading,
    createNote: () => createMutation({ data: {} }),
    updateNote: (noteId: string, payload: { title?: string; content?: string; categoryId?: string }) =>
      updateMutation({ id: noteId, data: payload }),
  };
};

useNotesRepository.invalidate = invalidate;
```

**Rules:**

1. One repository per domain resource (e.g., `notes.repository.ts`, `categories.repository.ts`).
2. Repositories are shared — multiple features consume the same repository.
3. No business logic in repositories. They transform and delegate — rules live in `domains/*/rules/`.

4. Export the Entity type from `domains/*/entities/`, not from generated schemas.
5. Attach `invalidate` as a static property for cross-repository invalidation.

### Entities

TypeScript interfaces representing business objects. These are the types that features work with.

```tsx
// domains/notes/entities/note.entity.ts
export type NoteEntity = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  lastEditedAt: Date;
};
```

**Rule:** Features import entities, never DTOs. The entity is the contract between domain and presentation.

### Schemas

Zod validation schemas for domain inputs (form data, mutation payloads).

```tsx
// domains/notes/schemas/note.schema.ts
import { z } from 'zod';

export const updateNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  categoryId: z.string().uuid().optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
```

### Rules

Pure functions containing business logic. No hooks, no side effects, no framework dependencies.

```tsx
// domains/notes/rules/noteDate.rules.ts
import type { NoteEntity } from '@/domains/notes/entities/note.entity';

export const formatNoteDate = (date: Date, now: Date = new Date()): string => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const noteDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (noteDay.getTime() === today.getTime()) return 'Today';
  if (noteDay.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const truncateContent = (content: string, maxLength: number): string =>
  content.length > maxLength ? `${content.slice(0, maxLength)}...` : content;
```

---

## 6. Feature Layer (`features/`)

### Screen Hooks

Every screen has exactly one screen hook. It orchestrates domain repositories and manages presentation state.

```tsx
// features/notes-list/hooks/useNotesList.ts
import { useState } from 'react';
import { useNotesRepository } from '@/domains/notes/repositories/notes.repository';
import { useCategoriesRepository } from '@/domains/categories/repositories/categories.repository';
import { formatNoteDate, truncateContent } from '@/domains/notes/rules/noteDate.rules';

export const useNotesList = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { notes, isLoading, createNote } = useNotesRepository({
    categoryId: selectedCategoryId ?? undefined,
  });
  const { categories } = useCategoriesRepository();

  const previewCards = notes.map((note) => ({
    ...note,
    displayDate: formatNoteDate(note.lastEditedAt),
    contentPreview: truncateContent(note.content, 120),
    categoryName: categories.find((c) => c.id === note.categoryId)?.name ?? '',
  }));

  return {
    previewCards,
    categories,
    selectedCategoryId,
    isLoading,
    isEmpty: notes.length === 0,
    selectCategory: setSelectedCategoryId,
    createNote,
  };
};
```

**Rule:** The screen hook returns **presentation-ready data**. Components receive it as props and render — no logic.

### Components

Organized by feature. Components can be flat or grouped by page section.

```text
features/note-editor/
  components/
    CategorySelector.tsx           # Flat: reusable within this feature
    noteEditor/                    # Grouped: components for the editor section
      NoteTitle.tsx
      NoteContent.tsx
```

**Naming rules:**

- Flat components: `PascalCase.tsx`
- Grouped directories: `camelCase/` containing `PascalCase.tsx` files
- Screen hooks: `use[ScreenName].ts` (e.g., `useNotesList.ts`, `useNoteEditor.ts`)

### Page Entry Point Pattern

Pages are thin. They call the screen hook and pass data to components.

```tsx
// app/page.tsx
'use client';
import { useNotesList } from '@/features/notes-list/hooks/useNotesList';
import { NotePreviewCard } from '@/features/notes-list/components/NotePreviewCard';
import { CategorySidebar } from '@/features/notes-list/components/CategorySidebar';
import { EmptyState } from '@/features/notes-list/components/EmptyState';
import { Row, Stack } from '@/notesDS/primitives';

export default function NotesPage() {
  const { previewCards, categories, selectedCategoryId, isEmpty, selectCategory, createNote } =
    useNotesList();

  return (
    <Row gap={6}>
      <CategorySidebar
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={selectCategory}
      />
      <Stack gap={4}>
        {isEmpty ? (
          <EmptyState onCreateNote={createNote} />
        ) : (
          previewCards.map((card) => <NotePreviewCard key={card.id} note={card} />)
        )}
      </Stack>
    </Row>
  );
}
```

---

## 7. State Management Strategy

We follow a strict "Bottom-Up" approach. **Context is not a dumping ground.**

1.  **Level 1: Local State (The Default)**
    - `useState`, `useReducer`, or `useForm` inside the **Screen Hook**.
    - _Use case:_ Note title/content inputs, password visibility toggle.

2.  **Level 2: Lifted State (Composition)**
    - Pass state down via props from a parent Page/Container to children.
    - _Use case:_ Sharing selected category between CategorySidebar and notes list.

3.  **Level 3: URL State (The Truth)**
    - Store state in URL Search Params (`?page=1&filter=red`).
    - _Use case:_ Selected category filter (`?category=personal`). (Persist on refresh).

4.  **Level 4: Server State**
    - TanStack Query (accessed via Repositories).
    - _Use case:_ Async data from the backend.

5.  **Level 5: Global State (Last Resort)**
    - React Context.
    - _Use case:_ User Session, Global Theme, Toast Notifications.
    - **Warning:** Do not use Context for business data.

---

## 8. Design System (`notesDS/`)

- **Location:** Path alias `@/notesDS/*`.
- **Purpose:** Pure UI components (The "LEGO" blocks).
- **Constraint:** These components **MUST NOT** import anything from `domains/`, `features/`, or `data/`. They must remain completely decoupled from business logic.

```text
notesDS/
├── tailwind.css              # @theme tokens (oklch colors, spacing, radii, shadows)
├── utils/
│   └── cn.ts                 # clsx + tailwind-merge utility
├── primitives/               # Layout Primitives (structure only, no visual styling)
│   ├── stack.tsx
│   ├── row.tsx
│   ├── container.tsx
│   ├── section.tsx
│   └── cardShell.tsx
├── components/               # Variant Components (atoms with visual states)
│   └── ui/                   # shadcn/ui components live here
│       ├── button.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       ├── tabs.tsx
│       ├── alert.tsx
│       └── typography.tsx    # Named text exports (H1–H4, P, Large, Small, Muted, Lead, Overline)
├── hooks/                    # UI-only hooks (useMediaQuery, useAnimation)
└── variants/                 # Shared CVA variant definitions (if reused across components)
```

### 8A. Layout Primitives (Structure)

**Rule: No div soup.** Raw `<div>` tags with ad-hoc Tailwind classes for structural layout are prohibited. All positioning and spacing must go through strictly defined Layout Primitives.

Layout Primitives live in `notesDS/primitives/`. They handle **structure only** — spacing, alignment, overflow, responsive stacking. They carry **no visual styling** (no colors, borders, shadows, typography).

| Primitive   | Purpose                                            | Key Props                               |
| ----------- | -------------------------------------------------- | --------------------------------------- |
| `Stack`     | Vertical flex container with consistent gap        | `gap`, `align`, `justify`, `as`         |
| `Row`       | Horizontal flex container with consistent gap      | `gap`, `align`, `justify`, `wrap`, `as` |
| `Container` | Centered max-width wrapper with horizontal padding | `size` (`sm`, `md`, `lg`, `xl`, `full`) |
| `Section`   | Semantic `<section>` with vertical padding         | `gap`, `as`                             |
| `CardShell` | Bordered rounded surface (visual container)        | `padding` (`sm`, `md`, `lg`, `none`)    |

**Usage pattern:**

```tsx
// CORRECT — structured, readable, consistent
<Container size="lg">
  <Stack gap={6}>
    <Section>
      <Row gap={4} align="center" justify="between">
        <h1>Title</h1>
        <Button>Action</Button>
      </Row>
    </Section>
    <CardShell padding="md">
      <Stack gap={3}>
        <Input label="Name" />
        <Input label="Email" />
      </Stack>
    </CardShell>
  </Stack>
</Container>

// WRONG — div soup, inconsistent spacing, unreadable
<div className="mx-auto max-w-5xl px-4">
  <div className="flex flex-col gap-6">
    <div className="py-4">
      <div className="flex items-center justify-between gap-4">
        <h1>Title</h1>
        <Button>Action</Button>
      </div>
    </div>
  </div>
</div>
```

**Implementation rules:**

1. Every primitive accepts an optional `className` prop (merged via `cn()`) for one-off overrides.
2. Every primitive accepts an `as` prop for polymorphic rendering (`as="article"`, `as="nav"`).
3. Primitives use `cva` internally for their size/gap/padding variants — no arbitrary Tailwind values.
4. `gap` props map to the Tailwind spacing scale (e.g., `gap={4}` → `gap-4`). Do **not** accept arbitrary pixel values.

### 8B. Variant Components (Atoms)

**Rule: All visual states use `cva`.** Any component with more than one visual appearance (size, color, state) **must** define its variants with `class-variance-authority`. No ternary-chained Tailwind strings.

Variant Components live in `notesDS/components/ui/` (shadcn/ui convention).

**Anatomy of a Variant Component:**

```tsx
// notesDS/components/ui/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/notesDS/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input text-foreground',
        warning: 'bg-warning text-warning-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

**Implementation rules:**

1. **Export both the component and its `*Variants` const.**
2. **`defaultVariants` is mandatory.**
3. **Colors reference `@theme` tokens only.** Never hardcode oklch/hex values in variant definitions.
4. **The `className` prop is always last** in the `cn()` call, so consumer overrides win.
5. **No conditional Tailwind strings.** Use `cva` variants instead of ternaries.

### 8C. Typography Components (Text)

**Rule: No raw heading/paragraph soup.** Raw `<h1>`–`<h6>`, `<p>`, and standalone `<span>` elements with ad-hoc Tailwind typography classes are prohibited. All text must go through the named Typography exports from `notesDS/components/ui/typography.tsx`.

Typography components are **not** CVA-based — each export is a single fixed style with no variants. Consumers override defaults via `className` (merged with `cn()`).

| Export     | Element  | Default Styles                                              |
| ---------- | -------- | ----------------------------------------------------------- |
| `H1`       | `<h1>`   | `text-3xl font-bold tracking-tight`                         |
| `H2`       | `<h2>`   | `text-2xl font-bold tracking-tight`                         |
| `H3`       | `<h3>`   | `text-xl font-bold`                                         |
| `H4`       | `<h4>`   | `text-lg font-semibold`                                     |
| `P`        | `<p>`    | `text-sm`                                                   |
| `Large`    | `<p>`    | `text-base font-bold`                                       |
| `Small`    | `<p>`    | `text-xs text-caption`                                      |
| `Muted`    | `<p>`    | `text-sm text-muted-foreground`                             |
| `Lead`     | `<p>`    | `text-lg text-muted-foreground leading-relaxed`             |
| `Overline` | `<span>` | `text-xs font-semibold uppercase tracking-wider text-caption`|

**Usage pattern:**

```tsx
// CORRECT — consistent, semantic, overridable
<Overline className="mb-3">Category</Overline>
<H2 className="text-primary">My Note Title</H2>
<P className="font-medium">Note content goes here...</P>
<Small className="text-muted-foreground">Today</Small>

// WRONG — ad-hoc classes, inconsistent across screens
<p className="text-xs font-semibold uppercase tracking-wider text-caption">Category</p>
<h2 className="text-2xl font-bold text-primary">My Note Title</h2>
<p className="text-sm font-medium">Note content goes here...</p>
<p className="text-xs text-muted-foreground">Today</p>
```

**When raw `<span>` is acceptable:** Inline text fragments inside other elements (e.g., a span wrapping a value inside a flex row with icons) may remain raw since they are not standalone text blocks.

---

## 9. Code Guidelines

### Do's

- **Do** use Zod schemas in `domains/*/schemas/` to validate all inputs.
- **Do** use Repositories for all data access. Never call generated hooks directly from features.
- **Do** use domain rules (`domains/*/rules/`) for business calculations. Keep them pure.
- **Do** use Server Actions for all mutations.

### Don'ts

- **Don't** write business logic inside `tsx` (JSX) files or screen hooks. Extract to domain rules.
- **Don't** import DTOs from `@/data/` in features or components. Use entities from `@/domains/*/entities/`.
- **Don't** use `useEffect` for data fetching. Use React Query via Repositories.
- **Don't** import from `@/data/` in features. Go through `@/domains/*/repositories/`.
- **Don't** import from `@/features/` in domains. Domains must not know about UI.

---

## 10. API Client Generation (Orval)

We use **[Orval](https://orval.dev)** to auto-generate type-safe HTTP clients from the backend OpenAPI specification.

### Generation Pipeline

```bash
npm generate:api    # Generates hooks from local OpenAPI spec
```

Orval reads from `openapi-spec.json` at the project root and generates TanStack Query hooks into `data/generated/`.

### Output Structure

```text
data/generated/
├── [tag]/[tag].ts       # Query/mutation hooks per API tag (e.g., notes/notes.ts)
├── [tag]/[tag].msw.ts   # MSW mock handlers per API tag (auto-generated)
└── models/              # All DTO types (auto-generated)
    ├── index.ts         # Barrel export
    └── *.ts             # Individual DTO interfaces
```

### Rules

1.  **Never hand-write API calls.** All HTTP functions are generated by Orval.
2.  **Never edit generated files.** They will be overwritten. Customizations go in Repositories.
3.  **Only Repositories import from `@/data/generated/`.** Features and components never touch generated code.
4.  **Use TanStack Query as the client.** Orval is configured with `react-query` to generate query/mutation hooks.
