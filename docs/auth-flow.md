# Vecna AI Hive Mind OS - Authentication Flow

This document details the Supabase Authentication configurations, middleware routing blocks, and profile creations.

---

## 1. User Sign Up Flow

```
[User Input Credentials]
          ↓
[Supabase Auth Register]
          ↓
[Postgres Trigger public.handle_new_user()]
          ↓
[Automatic public.profiles Table Insertion]
          ↓
[Establish Client Session & Redirect to /dashboard]
```

---

## 2. Protected Route Guards & Middleware

A Next.js Middleware route guard (`middleware.ts`) secures authentication checks:
* **Guest Routes** (`/signin`, `/signup`, `/forgot-password`): Authenticated users are automatically intercepted and redirected to `/dashboard`.
* **Secured Routes** (`/dashboard`, `/profile`): Unauthenticated visitors are redirected to `/signin`.
* **Session Refreshes**: Middleware refreshes the token on every page transition.
