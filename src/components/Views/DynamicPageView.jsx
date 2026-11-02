import React, { useEffect, useState } from 'react';
import BlockRenderer from '../Blocks/BlockRenderer';

export default function DynamicPageView({ slug, previewId, previewToken, onOpenAuditModal }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const endpoint = previewId
      ? `/api/pages/preview/${previewId}?token=${previewToken}`
      : `/api/pages/${slug}`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Page not found' : 'Failed to load page');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data.success && data.redirect) {
            window.location.replace(data.redirect.targetPath);
            return;
          }
          if (data.success && data.data) {
            setPage(data.data);
            applyPageSEO(data.data);
          } else {
            setError(data.error?.message || 'Page not found');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, previewId, previewToken]);

  const applyPageSEO = (p) => {
    // 1. Page Title
    document.title = p.metaTitle || p.title || 'DigitalClik';

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = p.metaDescription || p.excerpt || '';

    // 3. Robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    const robotsDirectives = [];
    if (p.noIndex) robotsDirectives.push('noindex');
    else robotsDirectives.push('index');
    if (p.noFollow) robotsDirectives.push('nofollow');
    else robotsDirectives.push('follow');
    metaRobots.content = robotsDirectives.join(', ');

    // 4. Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = p.canonicalUrl || `${window.location.origin}/${p.slug}`;

    // 5. OpenGraph
    updateMetaTag('og:title', p.ogTitle || p.metaTitle || p.title);
    updateMetaTag('og:description', p.ogDescription || p.metaDescription || p.excerpt || '');
    if (p.ogImage || p.featuredImageUrl) {
      updateMetaTag('og:image', p.ogImage || p.featuredImageUrl);
    }

    // 6. Twitter
    updateMetaTag('twitter:title', p.twitterTitle || p.ogTitle || p.title);
    updateMetaTag('twitter:description', p.twitterDescription || p.ogDescription || p.metaDescription || '');
    if (p.twitterImage || p.ogImage || p.featuredImageUrl) {
      updateMetaTag('twitter:image', p.twitterImage || p.ogImage || p.featuredImageUrl);
    }

    // 7. JSON-LD Schema
    let scriptSchema = document.getElementById('digitalclik-schema-json');
    if (!scriptSchema) {
      scriptSchema = document.createElement('script');
      scriptSchema.id = 'digitalclik-schema-json';
      scriptSchema.type = 'application/ld+json';
      document.head.appendChild(scriptSchema);
    }

    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': p.schemaType || 'WebPage',
      name: p.title,
      description: p.metaDescription || p.excerpt || '',
      url: `${window.location.origin}/${p.slug}`
    };
    scriptSchema.textContent = JSON.stringify(schemaObj);
  };

  const updateMetaTag = (property, content) => {
    let tag = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(property.startsWith('twitter:') ? 'name' : 'property', property);
      document.head.appendChild(tag);
    }
    tag.content = content || '';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 font-medium animate-pulse">Loading content...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mb-8">
          The page you are looking for doesn't exist, has been moved, or is currently unpublished.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded-lg bg-[#5C3BFF] text-white font-medium hover:bg-[#4828E0] transition-colors"
        >
          Return Home
        </a>
      </div>
    );
  }

  return (
    <article className="min-h-screen">
      {previewId && (
        <div className="bg-amber-500 text-black px-4 py-2 text-center text-xs font-bold tracking-wider uppercase sticky top-0 z-50 shadow-md">
          Draft Preview Mode &bull; Content is not yet published to public visitors
        </div>
      )}

      {/* Render All Blocks Sequentially */}
      {Array.isArray(page.blocks) && page.blocks.length > 0 ? (
        page.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))
      ) : (
        <div className="max-w-4xl mx-auto py-24 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          <p className="text-gray-500">This page has no content blocks yet.</p>
        </div>
      )}
    </article>
  );
}
