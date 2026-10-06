import { fetchApi } from './client.js';

export async function getSiteSettings() {
  return await fetchApi('/site-settings');
}

export async function getNavigation() {
  return await fetchApi('/navigation');
}

export async function getHomepageData() {
  return await fetchApi('/homepage');
}

export async function getServices() {
  return await fetchApi('/services');
}

export async function getServiceBySlug(slug) {
  return await fetchApi(`/services/${slug}`);
}

export async function getIndustries() {
  return await fetchApi('/industries');
}

export async function getProjects() {
  return await fetchApi('/projects');
}

export async function getCaseStudies() {
  return await fetchApi('/case-studies');
}

export async function getTestimonials() {
  return await fetchApi('/testimonials');
}

export async function getProcessSteps() {
  return await fetchApi('/process');
}

export async function getFaqs() {
  return await fetchApi('/faqs');
}

export async function submitContact(data) {
  return await fetchApi('/contact', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function submitProjectEnquiry(data) {
  return await fetchApi('/project-enquiries', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function subscribeNewsletter(email) {
  return await fetchApi('/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}
