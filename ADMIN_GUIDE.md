# Admin CMS User Guide

Welcome to the DigitalClik Administrator User Guide.

---

## 🔑 Accessing the Admin Panel
1. Open your browser and navigate to `http://localhost:5173/admin` (or your domain `/admin`).
2. Log in with your administrator credentials:
   - **Default Email**: `admin@digitalclik.com` (or value of SEED_ADMIN_EMAIL)
   - **Password**: Set via `SEED_ADMIN_PASSWORD` environment variable (defaults to `DevPassword123!` in local development)

---

## 🛠 CMS Modules

### 1. Dashboard
- View total incoming leads, total active services, total portfolio projects, and total testimonials.
- Quick navigation shortcuts to core website sections.

### 2. Homepage Manager
- **Section Visibility & Ordering**: Toggle sections on/off or reorder them.
- **Hero & Content Editor**: Update headlines, eyebrows, descriptions, and CTA button labels and URLs in real-time.

### 3. Service Management
- Add, edit, or remove services.
- Update titles, slugs, short descriptions, capabilities list, icons, and homepage featured status.

### 4. Portfolio Projects
- Manage portfolio items shown in the Featured Work showcase.
- Edit client names, project titles, summary, strategy, solution, results, and project gallery images.

### 5. Media Library
- Upload new images and videos.
- Edit alt text for accessibility and SEO.
- Copy image URLs to use in section editors.

### 6. Lead Management
- View incoming **Contact Messages** and **Project Audit Enquiries**.
- Filter by lead status (`NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`).
- Add internal administrator notes to leads.

### 7. Site Settings
- Control company contact email, phone number, address, and social links (LinkedIn, X, Instagram, etc.).
- Update site SEO title and meta description.
