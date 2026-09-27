# NCLEX Amplified IT HelpDesk & Knowledge Base System

A responsive React/Vite student support portal with student and administrator workspaces, searchable support content, ticket workflows, notifications, appearance settings, and Firebase-ready configuration.

## Run in GitHub Codespaces

```bash
npm install
cp .env.example .env.local
npm run dev -- --host 0.0.0.0
```

Open the forwarded Vite port. With no Firebase values, the app runs in local demo mode so the UI and workflows can be evaluated immediately. Demo administrator access is `admin@nclexamplified.edu` / `admin1234`.

## Firebase setup

1. Create a Firebase project and enable Email/Password Authentication.
2. Create a Firestore database.
3. Copy the Web app configuration into `.env.local` using the keys in `.env.example`.
4. Deploy `firestore.rules` with `firebase deploy --only firestore:rules`.
5. Create administrator documents at `admins/{firebase-auth-uid}`. The document ID must be the authorized Firebase Auth UID. There is intentionally no public administrator registration.
6. Account deletion is Spark-compatible. Student self-deletion uses the Firebase client Auth SDK, then removes the own profile with the pre-captured ID token through the Firestore REST API because Auth deletion signs out the client. Admin deletion removes only the student profile and writes a restricted `deletedStudentAccounts/{uid}` marker so the remaining Auth user cannot recreate a profile and sign in. Ticket history and all other records are retained.
7. Firebase Auth is already used by the login, registration, verification, logout, and password-reset handlers when the environment values are present. The remaining ticket/content demo data uses local persistence until Firestore reads and writes are connected to the project collections. The fallback never stores passwords.

Administrator sign-in is intentionally unavailable until `.env.local` contains all six Firebase values and the administrator's Auth UID has a matching document in `admins/{uid}`. Never add Firebase values or administrator credentials to source control.

## Data model

- `students/{uid}`: name, email, createdAt, verification metadata, and active/deactivated account state. Administrators can review and update these records; ticket history is retained when a student record is removed.
- `admins/{uid}`: authorization marker; access is controlled by document existence.
- `articles/{id}`: title, category, summary, content, author, published, createdAt, updatedAt.
- `faqs/{id}`: question, answer, category, order, visible, createdAt, updatedAt.
- `announcements/{id}`: title, summary, content, category, priority, publisher, published, date.
- `tickets/{id}`: owner email/UID, subject, category, description, priority, status, assignee, timestamps.
- `ticketMessages/{id}`: ticket ID, owner, author, body, and server timestamp.
- `ticketStatus/{id}`: ticket ID, owner, status, actor, and server timestamp for immutable history.
- `notifications/{id}`: owner, title, message, read state, related record ID, and timestamp.

## Current limitations

The included experience is deliberately runnable without credentials and therefore uses local content/ticket persistence for UI testing. Configure Firebase before production use: without it, real student authentication, email verification, password reset, administrator authorization, and Firebase student management are unavailable. Ticket attachments currently validate image type and size and retain safe metadata only; Firebase Storage wiring is still required to persist image bytes securely.
