# Environment Configuration Reference

This document describes all environment variables used by the DigitalClik platform.

---

## 1. Environment Variables Table

| Variable Name | Required | Default / Format | Description |
|---------------|----------|------------------|-------------|
| `DATABASE_URL` | **Yes** | `postgresql://postgres:postgres@localhost:5432/digitalclik?schema=public` | PostgreSQL database connection string (**PostgreSQL-only strategy**). |
| `PORT` | No | `5000` | Node.js Express server listening port. |
| `NODE_ENV` | No | `development` | Runtime environment (`development` / `production`). |
| `APP_URL` | No | `http://localhost:5000` | Backend API base URL for static file serving. |
| `FRONTEND_URL` | No | `http://localhost:5173` | Allowed CORS origin for web client. |
| `JWT_SECRET` | **Yes** | Secret string | Secret string for signing 15-minute access tokens. |
| `REFRESH_TOKEN_SECRET` | **Yes** | Secret string | Secret string for signing 7-day rotated refresh tokens. |
| `SEED_ADMIN_EMAIL` | No | `admin@digitalclik.com` | Email address for initial seeded administrator. |
| `SEED_ADMIN_PASSWORD` | **Yes** (in prod) | Password string | Initial administrator password. |
| `STORAGE_PROVIDER` | No | `local` | Media storage provider (`local` or `r2`). |
| `UPLOAD_DIR` | No | `uploads` | Directory for local file storage. |
| `R2_ACCOUNT_ID` | If R2 enabled | Cloudflare Account ID | Cloudflare R2 Account ID. |
| `R2_ACCESS_KEY_ID` | If R2 enabled | Key ID string | Cloudflare R2 Access Key ID. |
| `R2_SECRET_ACCESS_KEY` | If R2 enabled | Secret Key string | Cloudflare R2 Secret Access Key. |
| `R2_BUCKET` | If R2 enabled | `digitalclik-media` | Cloudflare R2 bucket name. |
| `R2_PUBLIC_URL` | If R2 enabled | `https://media.digitalclik.com` | Public CDN URL for Cloudflare R2 bucket assets. |
| `REDIS_URL` | If cluster PM2 | `redis://localhost:6379` | Redis connection URL for distributed rate limiting. |
| `REDIS_HOST` | If cluster PM2 | `127.0.0.1` | Redis host. |
| `REDIS_PORT` | If cluster PM2 | `6379` | Redis port. |
| `SMTP_HOST` | No | `smtp.sendgrid.net` | SMTP host for lead email notifications. |
| `SMTP_PORT` | No | `587` | SMTP port. |
| `SMTP_USER` | No | User string | SMTP username. |
| `SMTP_PASS` | No | Pass string | SMTP password. |
| `SMTP_FROM` | No | `hello@digitalclik.com` | From email address for lead notifications. |
| `NOTIFICATION_EMAIL` | No | `leads@digitalclik.com` | Admin recipient address for new leads. |
