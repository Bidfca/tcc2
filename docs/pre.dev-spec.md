## Executive Summary

Minimal Todo web app with user authentication and a CRUD API. Build on existing workspace (C:\TCC2). Use Next.js + TypeScript, latest stable packages. Core features: user sign-up/login (email+password), JWT session, create/read/update/delete todos per user, server-side API routes, basic responsive UI, input validation, and tests. Expected outcomes: working auth, secure per-user todo storage, automated tests, CI setup, and concise docs for local setup. Keep scope minimal for test connectivity.

## Core Functionalities

- **User Authentication**: Secure registration, login, session management, and password reset for users (Priority: **High**)
- **Todo CRUD API**: RESTful API for creating, reading, updating, and deleting todo items with validation and error handling (Priority: **High**)
- **Frontend Todo UI**: Responsive web interface for viewing and managing todos, with client-side form validation and auth flows (Priority: **High**)
- **Persistence & Data Layer**: Database integration using latest packages for storing users and todos with migrations and simple access layer (Priority: **Medium**)
- **Testing & CI**: Automated unit/integration tests and CI pipeline using latest tooling for builds and test runs (Priority: **Low**)

## Tech Stack

- **Frontend**: Next.js, React
- **Frontend/Backend**: TypeScript
- **Backend**: Node.js
- **Database**: Postgres, Prisma
- **Authentication**: NextAuth.js
- **API communication**: tRPC
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Security**: bcrypt
- **Validation**: zod
- **Code Quality**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest

## Development Guidelines & Best Practices

Follow these guidelines while implementing the project:

- **Placeholder Images**: Use [Unsplash](https://unsplash.com) or [Picsum Photos](https://picsum.photos) for placeholder images
  - Example: `https://source.unsplash.com/random/800x600?nature`
  - Example: `https://picsum.photos/800/600`
- **Code Quality**: Write clean, maintainable code with proper comments and documentation
- **Testing**: Test each feature thoroughly before marking it as complete
- **Commit Messages**: Use clear, descriptive commit messages that reference the task/story ID
- **Error Handling**: Implement proper error handling and user-friendly error messages
- **Responsive Design**: Ensure all UI components work across mobile, tablet, and desktop devices
- **Accessibility**: Follow WCAG guidelines for accessible UI components
- **Performance**: Optimize images, minimize bundle sizes, and implement lazy loading where appropriate
- **Security**: Never commit API keys or sensitive credentials; use environment variables
- **API & Model Versions**: Always use the latest available APIs and models unless the user explicitly specifies a different version
- **Progress Updates**: Update task checkboxes in real-time as you work through the plan

## Project Timeline

This plan lays out your roadmap in **Milestones**, **Stories** with acceptance criteria, and **Subtasks**. Follow the plan task by task and update progress on milestones, stories, and subtasks immediately as you work on them based on the legend below.

**Progress Legend:**
- `- [ ]` = To-do (not started)
- `- [~]` = In progress (currently working on)
- `- [x]` = Completed (finished)
- `- [/]` = Skipped (not needed)

Tasks are categorized by complexity to guide time estimations: XS, S, M, L, XL, XXL.

### - [ ] **Milestone 1**: **Authentication and onboarding: implement user registration, login, roles (User/Admin), and settings.**

- [ ] **Login** - (S): As a: registered user, I want to: log in to the system using my credentials, So that: I can access my personalized dashboard and protected features
  - **Acceptance Criteria:**
    - [ ] User can successfully login with valid credentials
System rejects invalid credentials with clear error
Session token is issued and stored securely
Login attempts are tracked for security
Edge case: remember-me persists session if selected
- [ ] **Register** - (M): As a: new visitor, I want to: create an account with email and password, So that: I can access personalized features and save my preferences
  - **Acceptance Criteria:**
    - [ ] User can register with valid email and password
System validates email format and password strength
Duplicate emails are rejected with proper message
Confirmation email is sent after successful registration
User data stored securely with encryption
- [ ] **Password Reset** - (M): As a: registered user, I want to: reset my password via secure flow, So that: I can regain access if I forget credentials
  - **Acceptance Criteria:**
    - [ ] User requests password reset with registered email
Reset token is generated and expires
User can set new password with strength validation
Password data stored securely
Reset flow handles rate limiting and abuse prevention
- [ ] **Logout** - (XS): As a: registered user, I want to: log out of the application, So that: I terminate the session and protect my account from unauthorized access
  - **Acceptance Criteria:**
    - [ ] User can log out from any session
Session is invalidated on server
Client UI reflects logged-out state
No active tokens remain for the user
Logout action is idempotent
- [ ] **Session Persistence** - (S): As a: registered user, I want to: maintain session across page reloads and navigation, So that: I stay logged in and retain preferences
  - **Acceptance Criteria:**
    - [ ] Session persists across page reloads
Token refresh mechanism works without user intervention
No sensitive data exposed in persistence layer
Logout clears persisted sessions on sign-out
- [ ] **Manage Todos (inScope: true)** - (S): As a: user, I want to: create, edit, and complete todos within the Settings context, So that: I can track tasks related to configuration and preferences.
  - **Acceptance Criteria:**
    - [ ] User can create todos with title, due date, and status.
Todos can be edited and marked as complete.
Todos are filtered by status and searched by keywords.
Todos persist and sync across sessions.
- [ ] **User Auth (inScope: true)** - (M): As a: user, I want to: manage authentication methods (password, OAuth) and session management, So that: I can control how I log in and maintain secure sessions.
  - **Acceptance Criteria:**
    - [ ] Users can choose between password and OAuth login options.
Active sessions listed with ability to logout others.
Password/OAuth changes require re-authentication.
Security best practices enforced for session handling.

### - [ ] **Milestone 2**: **Core Todo functionality: list, create, read, update, delete todos and todo detail view.**

- [ ] **Update Todo** - (S): As a: end user, I want to: update the details of a todo item (title, description, due date, status), So that: I can keep tasks accurate and reflect progress
  - **Acceptance Criteria:**
    - [ ] User can edit title, description, due date, and status
Validation ensures due date is not in the past
Changes persist to backend and update UI
Edge case: partial updates handled gracefully
Unauthorized updates blocked by authentication
- [ ] **List Todos** - (XS): As a: end user, I want to: list all my todos with status and due dates, So that: I can see and manage my tasks
  - **Acceptance Criteria:**
    - [ ] User can view a list of todos with status and due date fields
List supports filtering by status (open/completed)
List updates in real-time or on refresh to reflect changes
Edge case: no todos present shows an empty state
Data is retrieved from backend with correct authentication token
- [ ] **Toggle Complete** - (S): As a: user, I want to: toggle the completion status of a todo item, So that: I can mark tasks as done or not done to track progress
  - **Acceptance Criteria:**
    - [ ] User can toggle status from Todo detail view
Status persists in backend and updates in UI within 1s
Toggles handle optimistic UI updates with rollback on failure
Edge case: toggling on non-existent item is gracefully handled
- [ ] **View Todo** - (XS): As a: user, I want to: view details of a specific todo item, So that: I can review content, due date, and status to manage my tasks effectively
  - **Acceptance Criteria:**
    - [ ] User can open a todo from the list and see title, description, due date, and status
Status reflects current completion state and is read-only on view
System loads todo details quickly (under 200ms for cached data)
Edge case: non-existent todo id returns a clear error without crash
- [ ] **Create Todo** - (M): As a: user, I want to: create a new todo item, So that: I can manage tasks I need to complete
  - **Acceptance Criteria:**
    - [ ] User can enter title, due date, and priority
Todo is saved to database and reflected in list
Validation prevents empty title
Edge case: duplicate identical todo titles allowed
Technical: API creates todo and returns ID
- [ ] **Edit Todo** - (M): As a: user, I want to: edit an existing todo item, So that: I can update task details
  - **Acceptance Criteria:**
    - [ ] User can modify title, due date, priority, and status
Changes saved to database and reflected in UI
Validation ensures valid data
Edge case: editing non-existent item shows proper error
Technical: PATCH API updates todo
- [ ] **User Login** - (M): As a: user, I want to: log in to my account, So that: I can access personalized features
  - **Acceptance Criteria:**
    - [ ] User can enter valid credentials
Session token is stored securely
Invalid credentials show error
User is redirected to dashboard on success
Technical: authentication via API validates credentials
- [ ] **User Signup** - (M): As a: new user, I want to: sign up for an account, So that: I can access personalized features
  - **Acceptance Criteria:**
    - [ ] User can enter email, password, and name
Account created and confirmation email sent
User is redirected to dashboard after signup
Validation for email format and password strength
Technical: user creation API and email service
- [ ] **Create Todo API** - (S): As a: developer, I want to: create a todo via API, So that: frontend can persist new tasks
  - **Acceptance Criteria:**
    - [ ] API creates todo and returns new ID
Validation on input data
Auth-protected endpoint
Error handling for invalid data
- [ ] **Update Todo API** - (S): As a: developer, I want to: update a todo via API, So that: frontend can modify tasks
  - **Acceptance Criteria:**
    - [ ] API updates todo and returns success
Validation of input
Auth-protected endpoint
Edge case: update non-existent item
- [ ] **Delete Todo API** - (S): As a: developer, I want to: delete a todo via API, So that: frontend can remove tasks
  - **Acceptance Criteria:**
    - [ ] API deletes todo and returns confirmation
Auth-protected endpoint
Error handling for non-existent id
Edge case: batch delete not supported
- [ ] **Auth Middleware** - (M): As a: developer, I want to: enforce auth across routes, So that: only authenticated users can access protected resources
  - **Acceptance Criteria:**
    - [ ] Middleware checks for valid auth token on protected routes
Redirects or errors on missing/invalid token
Tests cover protected and unprotected routes
Security best practices enforced
- [ ] **Delete Todo** - (S): As a: user, I want to: delete a todo item, So that: I can remove completed or irrelevant tasks
  - **Acceptance Criteria:**
    - [ ] User can delete a todo and UI updates immediately
Backend deletes record and UI reflects change
Confirmation prompt before deletion
Edge case: delete non-existent item handled gracefully
Technical: API DELETE call with optimistic UI
- [ ] **View Todos API** - (S): As a: developer, I want to: fetch list of todos via API, So that: frontend can render tasks
  - **Acceptance Criteria:**
    - [ ] API returns list of todos with proper schema
Pagination/limit handling
Auth-protected endpoint
Error handling for empty responses
- [ ] **View Dashboard** - (S): As a: user, I want to: view the dashboard, So that: I can see an overview of my tasks and status
  - **Acceptance Criteria:**
    - [ ] User can access the dashboard page
Dashboard loads within 2 seconds
UI shows at-a-glance metrics (tasks count, completed, overdue)
Edge case: unauthorized user is redirected to login
Technical: dashboard data is fetched from API with valid auth token
