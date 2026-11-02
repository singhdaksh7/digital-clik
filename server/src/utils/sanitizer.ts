import sanitizeHtml from 'sanitize-html';

export const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'blockquote', 'hr',
    'ul', 'ol', 'li',
    'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'code', 'pre',
    'a', 'span', 'br'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title'],
    span: ['class', 'style'],
    p: ['class', 'style'],
    h1: ['class', 'style'],
    h2: ['class', 'style'],
    h3: ['class', 'style'],
    h4: ['class', 'style'],
    h5: ['class', 'style'],
    h6: ['class', 'style'],
    blockquote: ['class', 'style'],
    ul: ['class', 'style'],
    ol: ['class', 'style'],
    li: ['class', 'style']
  },
  allowedStyles: {
    '*': {
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      'font-weight': [/^\d+$/, /^bold$/, /^normal$/],
      'font-style': [/^italic$/, /^normal$/],
      'text-decoration': [/^underline$/, /^line-through$/, /^none$/]
    }
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto', 'tel']
  },
  transformTags: {
    a: (tagName, attribs) => {
      const newAttribs = { ...attribs };
      if (newAttribs.target === '_blank') {
        newAttribs.rel = 'noopener noreferrer';
      }
      return {
        tagName,
        attribs: newAttribs
      };
    }
  }
};

/**
 * Sanitize rich text HTML to remove any potential XSS attacks.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return '';
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

/**
 * Super Admin safe HTML sanitizer (permits iframes for YouTube/Vimeo embeds, SVG icons).
 */
export function sanitizeCustomHtml(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return '';
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'iframe', 'img', 'svg', 'path', 'g', 'circle', 'rect', 'line', 'polygon', 'polyline',
      'video', 'source', 'audio', 'button', 'input', 'form'
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'class', 'style'],
      svg: ['xmlns', 'viewBox', 'width', 'height', 'fill', 'stroke', 'class'],
      path: ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
      '*': ['class', 'id', 'style']
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'www.google.com']
  });
}

/**
 * Clean URL slug generator
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
