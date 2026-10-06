# Backend Architecture

## Overview
The DigitalClik backend is built using Node.js, Express, TypeScript, and Prisma ORM.

### Architecture Highlights
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Development supported with SQLite / Prisma)
- **ORM**: Prisma ORM with type-safe schema and query execution
- **Authentication**: JWT authentication with Argon2id password hashing
- **Validation**: Zod schema validation for public form endpoints
- **Security**: Helmet headers, CORS policies, strict request body limits, file MIME type checking
- **Storage**: Abstracted local disk storage adapter serving assets under `/uploads/`

---

## Directory Structure
```
server/
├── src/
│   ├── app.ts                 # Express application configuration
│   ├── server.ts              # Entry point starting HTTP server
│   ├── lib/
│   │   └── prisma.ts          # Singleton Prisma client instance
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication & role authorization
│   │   └── errorHandler.ts    # Centralized error handler middleware
│   ├── routes/
│   │   ├── public.ts          # Public REST API routes for website frontend
│   │   └── admin.ts           # Admin CMS REST API routes
│   └── utils/
│       └── auth.ts            # Argon2id hashing and JWT sign/verify
└── tsconfig.json              # TypeScript configuration
```

---

## Security Protocols
1. **Argon2id Password Hashing**: State-of-the-art password security resistant to GPU cracking.
2. **JWT Authorization**: Bearer tokens passed via standard authorization headers (`Authorization: Bearer <token>`).
3. **Role-based Access Control (RBAC)**: Supports `SUPER_ADMIN`, `ADMIN`, and `EDITOR` roles.
4. **Audit Logging**: All administrative mutations (`CREATE`, `UPDATE`, `DELETE`) automatically write to `AuditLog`.
