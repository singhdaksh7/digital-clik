# CMS Architecture

## Design Philosophy
The DigitalClik CMS separates **content, ordering, and visibility** from **visual presentation and layout**.
Administrators can edit text, upload media, adjust reordering, toggle visibility, and create new services or projects without breaking the approved frozen visual design system.

---

## Core Data Models
- **HomepageSection**: Stores section configuration (`HERO`, `MANIFESTO`, `SERVICES`, `FEATURED_WORK`, `PROCESS`, `INDUSTRIES`, `TESTIMONIALS`, `CTA`), text fields, sort order, and visibility toggle.
- **HeroMedia**: Dynamic collage items rendered inside the asymmetrical Hero frame.
- **Service & ServiceCategory**: Complete service catalog with slugs, capabilities, icons, sort orders, and detail sections.
- **Industry**: Industry sectors with hero titles, challenges, overview, and featured flags.
- **Project & ProjectMedia**: Portfolio project management with client names, case study details, strategy, results, and dynamic image/video galleries.
- **Testimonial**: Executive testimonials with photo, client name, title, quote, and homepage featured toggle.
- **ProcessStep**: 6-step agency discovery process steps with titles, descriptions, step numbers, and visibility toggle.
- **Lead Management**: `ProjectEnquiry`, `ContactSubmission`, and `NewsletterSubscriber` capturing all public incoming form leads.
- **MediaItem**: Centralized media asset repository storing metadata, URLs, sizes, and alt tags.
- **SiteSettings**: Global configuration (company details, contact numbers, address, social links, SEO metadata).

---

## Frontend Integration Layer
The React frontend uses standard API wrappers (`src/api/public.js` and `src/api/admin.js`) with fallback values:
- `getSiteSettings()`
- `getHomepageData()`
- `getServices()`
- `getProjects()`
- `getTestimonials()`
- `getProcessSteps()`
- `submitContactForm()`
- `submitAuditForm()`
