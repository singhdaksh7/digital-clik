# DigitalClik Platform Deployment & Operations Guide

> ⚠️ **STATUS: LOCAL COMPLETION & FREEZE PHASE**.
> Do NOT connect to production VPS (200.97.164.171) until explicitly authorized. This guide provides pre-deployment specifications and procedures.

---

## 1. Database Architecture (PostgreSQL-Only)
The DigitalClik platform uses a **unified single-provider PostgreSQL architecture** across development, testing, and production environments.

- **Prisma Provider**: `postgresql`
- **ORM Schema**: `prisma/schema.prisma`
- **Driver**: `@prisma/client` v6.4+
- **Migrations**: Standardized in `prisma/migrations/20261006000000_init`

---

## 2. PostgreSQL Backup & Restore Procedures

### Database Backup (`pg_dump`)
Run timestamped PostgreSQL dumps using custom binary format:
```bash
pg_dump -U postgres -h localhost -p 5432 -d digitalclik -F c -b -v -f "/var/backups/digitalclik_pg_$(date +%Y%m%d_%H%M%S).dump"
```
Or SQL plain text format:
```bash
pg_dump -U postgres -h localhost -p 5432 -d digitalclik -f "/var/backups/digitalclik_pg_$(date +%Y%m%d_%H%M%S).sql"
```

### Database Restore (`pg_restore` / `psql`)
To restore from binary dump:
```bash
pg_restore -U postgres -h localhost -p 5432 -d digitalclik -v "/var/backups/digitalclik_pg_20261006_120000.dump"
```
To restore from SQL plain text:
```bash
psql -U postgres -h localhost -p 5432 -d digitalclik -f "/var/backups/digitalclik_pg_20261006_120000.sql"
```

### Media Assets Backup (Local & R2)
- **Local Storage**:
  ```bash
  tar -czvf /var/backups/digitalclik_uploads_$(date +%Y%m%d).tar.gz uploads/
  ```
- **Cloudflare R2 Storage**:
  Use `rclone` or AWS CLI S3 sync for automated bucket replication:
  ```bash
  aws s3 sync s3://digitalclik-media s3://digitalclik-media-backup --endpoint-url https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
  ```

---

## 3. Auth Architecture & Security
- **Access Tokens**: Short-lived (15 minutes expiry) signed JWTs. Contains `userId`, `email`, `role`, and `tokenVersion`.
- **Refresh Tokens**: Long-lived (7 days expiry) rotated tokens stored in PostgreSQL `RefreshToken` table with `family` tracking.
- **Stolen Refresh Token Reuse Detection**: If a revoked refresh token is presented, all refresh tokens sharing that token's `family` are immediately revoked.
- **Password Invalidation**: Password changes increment `tokenVersion` on `AdminUser` and revoke all active refresh tokens in the database.
- **Role Control (RBAC)**:
  - `SUPER_ADMIN`: Full access (User management, system settings, audit logs, content CRUD).
  - `ADMIN`: Site settings, leads, audit logs, content CRUD.
  - `EDITOR`: Content CRUD only (Services, Projects, Blog, Testimonials, Process, FAQs).

---

## 4. Media Storage Architecture
Dynamic storage provider selectable by environment variable `STORAGE_PROVIDER`:

- **Local Storage (`STORAGE_PROVIDER=local`)**:
  - Files saved to `uploads/` directory.
  - Served via Express static middleware at `/uploads/*`.
- **Cloudflare R2 / S3 (`STORAGE_PROVIDER=r2`)**:
  - S3-compatible client via `@aws-sdk/client-s3`.
  - Objects uploaded to Cloudflare R2 bucket (`R2_BUCKET`).
  - Public URLs served via Cloudflare R2 custom domain (`R2_PUBLIC_URL`).
- **Upload Security**:
  - File extension & MIME type validation.
  - Magic byte header verification (rejects fake image extensions containing PHP/executables).
  - Safe sanitized object key generation (`dc-${Date.now()}-${uuid}.${ext}`).

---

## 5. Rate Limiting Strategy
- **Redis-Backed Rate Limiting**: Enabled when `REDIS_URL` or `REDIS_HOST` is configured. Required for multi-process PM2 cluster mode.
- **In-Memory Fallback**: Automatic fallback to local memory map when Redis is unavailable or unconfigured (single PM2 instance mode).

---

## 6. Vite SPA SEO Limitation Note
The DigitalClik public interface is built as a **Vite Single Page Application (SPA)**.
- Meta tags (`title`, `description`, `canonical`, `og:image`) are rendered client-side dynamically per route.
- Search engine crawlers with JavaScript execution (Googlebot) fully parse all dynamic meta tags and content.
- Legacy crawlers without JavaScript execution see the initial SPA `index.html` container shell.
- If raw server-rendered HTML meta tags are required in future phases, a pre-rendering solution (Prerender.io) or SSR framework migration can be implemented without changing the backend API.

---

## 7. Production Process & Reverse Proxy Templates

### PM2 Configuration (`ecosystem.config.cjs`)
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
```

### Nginx Reverse Proxy Template (`nginx.conf.template`)
Includes SSL termination, proxy pass to PM2 (port 5000), static asset caching, and security headers.
