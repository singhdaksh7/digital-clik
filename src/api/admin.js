import { fetchApi, setAuthToken, getAuthToken } from './client.js';

export async function adminLogin(email, password) {
  const res = await fetchApi('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res;
}

export async function getAdminMe() {
  return await fetchApi('/admin/auth/me');
}

export function adminLogout() {
  setAuthToken('');
}

export async function getDashboardMetrics() {
  return await fetchApi('/admin/dashboard');
}

// Homepage Sections
export async function getHomepageSections() {
  return await fetchApi('/admin/homepage/sections');
}

export async function updateHomepageSection(id, data) {
  return await fetchApi(`/admin/homepage/sections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Hero Media
export async function getHeroMedia() {
  return await fetchApi('/admin/homepage/hero-media');
}

export async function createHeroMedia(data) {
  return await fetchApi('/admin/homepage/hero-media', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateHeroMedia(id, data) {
  return await fetchApi(`/admin/homepage/hero-media/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteHeroMedia(id) {
  return await fetchApi(`/admin/homepage/hero-media/${id}`, {
    method: 'DELETE'
  });
}

// Services
export async function getAdminServices() {
  return await fetchApi('/admin/services');
}

export async function createService(data) {
  return await fetchApi('/admin/services', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateService(id, data) {
  return await fetchApi(`/admin/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteService(id) {
  return await fetchApi(`/admin/services/${id}`, {
    method: 'DELETE'
  });
}

// Projects
export async function getAdminProjects() {
  return await fetchApi('/admin/projects');
}

export async function createProject(data) {
  return await fetchApi('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateProject(id, data) {
  return await fetchApi(`/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteProject(id) {
  return await fetchApi(`/admin/projects/${id}`, {
    method: 'DELETE'
  });
}

// Industries
export async function getAdminIndustries() {
  return await fetchApi('/admin/industries');
}

export async function createIndustry(data) {
  return await fetchApi('/admin/industries', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateIndustry(id, data) {
  return await fetchApi(`/admin/industries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteIndustry(id) {
  return await fetchApi(`/admin/industries/${id}`, {
    method: 'DELETE'
  });
}

// Testimonials
export async function getAdminTestimonials() {
  return await fetchApi('/admin/testimonials');
}

export async function createTestimonial(data) {
  return await fetchApi('/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateTestimonial(id, data) {
  return await fetchApi(`/admin/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteTestimonial(id) {
  return await fetchApi(`/admin/testimonials/${id}`, {
    method: 'DELETE'
  });
}

// Process Steps
export async function getAdminProcessSteps() {
  return await fetchApi('/admin/process');
}

export async function updateProcessStep(id, data) {
  return await fetchApi(`/admin/process/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Media
export async function getMediaItems() {
  return await fetchApi('/admin/media');
}

export async function uploadMediaFile(file) {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('http://localhost:5000/api/admin/media/upload', {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || 'Upload failed');
  }
  return data;
}

export async function deleteMediaItem(id) {
  return await fetchApi(`/admin/media/${id}`, {
    method: 'DELETE'
  });
}

// Leads
export async function getProjectEnquiries() {
  return await fetchApi('/admin/leads/enquiries');
}

export async function updateEnquiryStatus(id, status, notes) {
  return await fetchApi(`/admin/leads/enquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  });
}

export async function getContactLeads() {
  return await fetchApi('/admin/leads/contacts');
}

export async function updateContactStatus(id, status, notes) {
  return await fetchApi(`/admin/leads/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes })
  });
}

// Site Settings
export async function updateSiteSettings(data) {
  return await fetchApi('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function updateAnnouncementBar(data) {
  return await fetchApi('/admin/settings/announcement', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Audit Logs
export async function getAuditLogs() {
  return await fetchApi('/admin/audit-logs');
}
