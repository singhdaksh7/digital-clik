# API Documentation

## Public Endpoints (`/api/*`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/site-settings` | Fetch global company settings, contact info, social links, SEO metadata |
| GET | `/api/navigation` | Fetch active navigation menus and items |
| GET | `/api/homepage` | Fetch ordered, visible homepage sections and hero media items |
| GET | `/api/services` | Fetch list of published services |
| GET | `/api/services/:slug` | Fetch single service by slug with its custom sections |
| GET | `/api/industries` | Fetch list of published industries |
| GET | `/api/projects` | Fetch published portfolio projects with galleries |
| GET | `/api/testimonials` | Fetch visible executive testimonials |
| GET | `/api/process` | Fetch 6-step agency discovery process steps |
| POST | `/api/contact` | Submit contact form inquiry |
| POST | `/api/project-enquiries` | Submit project audit audit/enquiry modal |
| POST | `/api/newsletter` | Subscribe to newsletter |

---

## Admin Endpoints (`/api/admin/*`)
*All admin endpoints require `Authorization: Bearer <JWT_TOKEN>` header.*

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Admin user login |
| GET | `/api/admin/auth/me` | Fetch authenticated user profile |
| GET | `/api/admin/dashboard` | Fetch CMS dashboard statistics |
| GET/PUT | `/api/admin/homepage/sections` | Fetch / Update homepage sections & ordering |
| GET/POST/PUT/DEL | `/api/admin/services` | CRUD for agency services |
| GET/POST/PUT/DEL | `/api/admin/projects` | CRUD for portfolio projects |
| GET/POST/PUT/DEL | `/api/admin/testimonials` | CRUD for testimonials |
| GET/POST/DEL | `/api/admin/media` | Upload and manage media assets |
| GET/PUT | `/api/admin/leads/*` | Manage project enquiries and contact leads |
| PUT | `/api/admin/settings` | Update company settings and global SEO |
