# Productivity Platform

An integrated productivity platform that unifies task planning, calendar scheduling, AI assistance, and email management in a single cohesive environment. Inspired by Sunsama, Linear, and Notion with the polished design aesthetic of Attio.

## Features

- **Unified Navigation**: Seamless switching between AI, Tasks, Calendar, and Mail views
- **Task Management**: Comprehensive task management with drag-and-drop functionality and time-blocking
- **Modern Design**: Clean typography, subtle shadows, and intuitive interactions
- **Responsive Layout**: Adapts to different screen sizes with collapsible sidebar

## Tech Stack

- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn/ui component library
- **State Management**: Zustand (planned)
- **Drag & Drop**: @dnd-kit (planned)
- **Database**: PostgreSQL with Prisma ORM (planned)
- **Authentication**: NextAuth.js (planned)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── ai/                # AI Assistant module
│   ├── calendar/          # Calendar module
│   ├── mail/              # Email module
│   └── tasks/             # Task management module
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── tasks/            # Task-specific components
│   └── ui/               # shadcn/ui components
└── lib/                  # Utilities and types
    ├── stores/           # Zustand stores (planned)
    ├── types/            # TypeScript type definitions
    └── api/              # API utilities (planned)
```

## Design System

The application uses a custom design system inspired by Attio, Linear, and Notion:

- **Colors**: Predominantly white canvas with light grey panels
- **Typography**: Inter font family with clean, readable styling
- **Spacing**: Generous padding to prevent cramped layouts
- **Borders**: Rounded corners (rounded-xl, rounded-2xl) consistently applied
- **Shadows**: Subtle shadows for depth without overwhelming the interface
- **Accent Colors**: Blues used sparingly for active elements only

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Current Status

This is the initial project foundation setup. The following modules are currently placeholders:
- AI Assistant (Coming Soon)
- Calendar (Coming Soon) 
- Mail (Coming Soon)
- Tasks (Basic layout implemented)

## Next Steps

Refer to the implementation plan in `.kiro/specs/productivity-platform/tasks.md` for the detailed roadmap.
