# DigitalClik CMS Platform

Welcome to the **DigitalClik CMS Platform** — a fully dynamic, database-driven, production-ready agency web application.

---

## 🌟 Overview

- **Frozen Public Frontend**: High-performance responsive web platform built with Vite, React, and CSS design system (`#FFFFFF` White, `#0A0A0A` Near Black, `#762F77` DigitalClik Purple).
- **PostgreSQL Database Strategy**: 100% standardized on **PostgreSQL** for development, testing, and production managed via Prisma ORM.
- **Hardened Admin Panel**: Accessible at `/admin` featuring short-lived access tokens (15m), refresh token rotation (7d), stolen token reuse detection, server-side RBAC (`SUPER_ADMIN`, `ADMIN`, `EDITOR`), audit logging, lead management, and media library.

---

## 🚀 Quick Start (Local Development)

### 1. Requirements
- Node.js >= 18.x
- PostgreSQL database (e.g. local instance or Docker container)

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/digitalclik?schema=public"
```

### 3. Database Migration & Seeding
```bash
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### 4. Running Development Servers
To launch both Vite frontend (`http://localhost:5173`) and Express backend (`http://localhost:5000`):
```bash
npm run dev
```

---

## 🔑 Default Seed Admin Credentials

- **URL**: `http://localhost:5173/admin`
- **Email**: `admin@digitalclik.com`
- **Password**: Configured via `SEED_ADMIN_PASSWORD` (defaults to `DevPassword123!` in local dev)

---

## 📚 Documentation Links
- [Backend Architecture](BACKEND_ARCHITECTURE.md)
- [CMS Architecture](CMS_ARCHITECTURE.md)
- [Admin Guide](ADMIN_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Environment Configuration](ENVIRONMENT.md)
