# Student Assignment & Review Dashboard

A client-side assignment tracker built with React 19, React Router, Vite, and Tailwind CSS 4. It uses demo accounts and browser storage; it does not require a backend.

## Setup

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The sign-in page lists all demo accounts and passwords; choose an account to fill the form, then sign in. Use **Switch account** in the dashboard header to change roles or demo users.

## Validation

```sh
npm test
npm run lint
npm run build
```

The tests use Node's built-in test runner, so no additional test dependencies are needed.

## Demo accounts

There are two admin accounts and five student accounts. All accounts and their demo passwords are displayed in the sign-in page under **View demo accounts**.

## Folder structure

```text
src/
  auth/          Mock sign-in, session context, and role-based route guards
  assignments/  Assignment storage, provider, and authorization/business rules
  components/   Shared dashboard, dialog, search, filter, progress, and theme UI
  data/         Demo accounts and seeded assignments
  pages/         Sign-in, admin dashboard, and student dashboard
  App.jsx        Shared theme state, providers, and application routes
  index.css      Light glassmorphism design, dark theme, and motion preferences
tests/           Node tests for login, route access, creation, and submission rules
```

## Architecture and design choices

- Authentication is a local mock. The session stores the selected demo email in `localStorage`; route guards keep student and admin dashboards separate.
- Assignment creation, editing, deletion, and submission are validated in the assignment provider and persisted in `localStorage`. Admin views are filtered by creator; student views are filtered by assignee.
- Seed assignments supply the initial data. Submission updates are stored separately so a student's completion state survives refreshes and assignment edits.
- The light theme retains the existing glass surfaces and cyan accents. Shared theme state in `App.jsx` drives the login and dashboard toggles and remembers the preference. Reduced-motion preferences disable animations and smooth scrolling.
- Assignment data is read synchronously from local storage, so there is no asynchronous loading phase. Empty lists have dedicated empty states; storage and save failures are reported in the interface.
