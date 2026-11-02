import React from 'react';

// Design tokens
export const WIDTH_PRESETS = {
  Narrow: 'max-w-3xl mx-auto px-4 sm:px-6',
  Standard: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
  Wide: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  Full: 'w-full px-4 sm:px-6 lg:px-8'
};

export const PADDING_PRESETS = {
  None: 'py-0',
  Small: 'py-6 sm:py-8',
  Medium: 'py-12 sm:py-16',
  Large: 'py-16 sm:py-24',
  'Extra Large': 'py-24 sm:py-32'
};

export const BACKGROUND_PRESETS = {
  White: 'bg-white text-gray-900',
  'Soft Gray': 'bg-[#F9FAFB] text-gray-900 border-y border-gray-100',
  Black: 'bg-[#0A0A0A] text-white',
  Purple: 'bg-[#5C3BFF] text-white'
};

export const ALIGN_PRESETS = {
  Left: 'text-left',
  Center: 'text-center mx-auto',
  Right: 'text-right ml-auto'
};

export const TYPOGRAPHY_SIZES = {
  XS: 'text-xs',
  SM: 'text-sm',
  BASE: 'text-base',
  LG: 'text-lg',
  XL: 'text-xl',
  '2XL': 'text-2xl',
  '3XL': 'text-3xl',
  '4XL': 'text-4xl',
  '5XL': 'text-5xl',
  DISPLAY: 'text-6xl font-extrabold tracking-tight leading-tight'
};

export function parseBlockSettings(settings) {
  if (!settings) return {};
  if (typeof settings === 'object') return settings;
  try {
    return JSON.parse(settings);
  } catch {
    return {};
  }
}

export function parseBlockContent(content) {
  if (!content) return {};
  if (typeof content === 'object') return content;
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// 1. HERO BLOCK
export function HeroBlock({ content, settings }) {
  const c = parseBlockContent(content);
  const s = parseBlockSettings(settings);
  const alignClass = ALIGN_PRESETS[s.alignment] || 'text-center mx-auto';
  const sizeClass = TYPOGRAPHY_SIZES[s.headingSize] || 'text-4xl sm:text-5xl lg:text-6xl font-extrabold';

  const HeadingTag = s.headingTag || 'h1';

  return (
    <div className={`relative ${alignClass} max-w-4xl`}>
      {c.eyebrow && (
        <span className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full mb-4 bg-purple-100 text-purple-700">
          {c.eyebrow}
        </span>
      )}
      <HeadingTag className={`${sizeClass} tracking-tight mb-6 leading-tight`}>
        {c.title || 'Page Heading'}
      </HeadingTag>
      {c.subtitle && (
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          {c.subtitle}
        </p>
      )}
      {(c.ctaText || c.secondaryCtaText) && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {c.ctaText && (
            <a
              href={c.ctaLink || '#'}
              className="px-6 py-3.5 rounded-lg bg-[#5C3BFF] text-white font-medium hover:bg-[#4828E0] transition-colors shadow-sm"
            >
              {c.ctaText}
            </a>
          )}
          {c.secondaryCtaText && (
            <a
              href={c.secondaryCtaLink || '#'}
              className="px-6 py-3.5 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
            >
              {c.secondaryCtaText}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// 2. RICH TEXT BLOCK
export function RichTextBlock({ content, settings }) {
  const c = parseBlockContent(content);
  const s = parseBlockSettings(settings);
  const alignClass = ALIGN_PRESETS[s.alignment] || 'text-left';

  return (
    <div
      className={`prose prose-lg max-w-none ${alignClass}`}
      dangerouslySetInnerHTML={{ __html: c.bodyHtml || '<p>Start typing rich text...</p>' }}
    />
  );
}

// 3. TEXT + IMAGE BLOCK
export function TextImageBlock({ content, settings, imageOnLeft = false }) {
  const c = parseBlockContent(content);
  const s = parseBlockSettings(settings);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${s.mobileStack === 'reverse' ? 'flex-col-reverse' : ''}`}>
      <div className={imageOnLeft ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}>
        {c.eyebrow && (
          <span className="text-xs uppercase tracking-widest font-semibold text-[#5C3BFF] mb-2 block">
            {c.eyebrow}
          </span>
        )}
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {c.title}
        </h2>
        <div
          className="prose text-gray-600 mb-6 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: c.bodyHtml || c.description || '' }}
        />
        {c.ctaText && (
          <a
            href={c.ctaLink || '#'}
            className="inline-block px-5 py-2.5 rounded-lg bg-[#5C3BFF] text-white font-medium hover:bg-[#4828E0] transition-colors"
          >
            {c.ctaText}
          </a>
        )}
      </div>
      <div className={imageOnLeft ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}>
        {c.imageUrl ? (
          <img
            src={c.imageUrl}
            alt={c.imageAlt || c.title || 'DigitalClik Content'}
            loading="lazy"
            style={{
              objectPosition: `${c.focalX || 50}% ${c.focalY || 50}%`,
              aspectRatio: c.aspectRatio || 'auto'
            }}
            className={`w-full object-cover max-h-[480px] shadow-lg border border-gray-100 ${
              s.borderRadius === 'Large' ? 'rounded-2xl' : s.borderRadius === 'Small' ? 'rounded-md' : 'rounded-xl'
            }`}
          />
        ) : (
          <div className="w-full h-80 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
            Image placeholder
          </div>
        )}
      </div>
    </div>
  );
}

// 4. IMAGE GALLERY BLOCK
export function ImageGalleryBlock({ content }) {
  const c = parseBlockContent(content);
  const images = Array.isArray(c.images) ? c.images : [];

  return (
    <div>
      {c.title && <h2 className="text-3xl font-bold text-center mb-8">{c.title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, i) => (
          <div key={i} className="group relative overflow-hidden rounded-xl bg-gray-100 shadow-sm border border-gray-100">
            <img
              src={img.url}
              alt={img.alt || `Gallery item ${i + 1}`}
              loading="lazy"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {img.caption && (
              <div className="p-3 bg-white text-xs text-gray-600 border-t border-gray-100">
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. VIDEO BLOCK
export function VideoBlock({ content }) {
  const c = parseBlockContent(content);

  return (
    <div className="max-w-4xl mx-auto">
      {c.title && <h2 className="text-3xl font-bold text-center mb-6">{c.title}</h2>}
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-black">
        {c.videoUrl && (c.videoUrl.includes('youtube.com') || c.videoUrl.includes('youtu.be')) ? (
          <iframe
            src={c.videoUrl.replace('watch?v=', 'embed/')}
            title={c.title || 'Video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : c.videoUrl && c.videoUrl.includes('vimeo.com') ? (
          <iframe
            src={c.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
            title={c.title || 'Vimeo'}
            className="w-full h-full"
            allowFullScreen
          />
        ) : c.videoUrl ? (
          <video
            controls={c.controls !== false}
            autoPlay={Boolean(c.autoplay)}
            muted={Boolean(c.muted)}
            loop={Boolean(c.loop)}
            poster={c.posterUrl}
            src={c.videoUrl}
            className="w-full h-full object-cover"
          >
            Your browser does not support video.
          </video>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No video URL provided
          </div>
        )}
      </div>
      {c.caption && <p className="text-center text-xs text-gray-500 mt-2">{c.caption}</p>}
    </div>
  );
}

// 6. CTA BLOCK
export function CTABlock({ content, settings }) {
  const c = parseBlockContent(content);
  const s = parseBlockSettings(settings);
  const isDark = s.background === 'Black' || s.background === 'Purple';

  return (
    <div className="text-center max-w-3xl mx-auto py-6">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        {c.title || 'Ready to move forward?'}
      </h2>
      {c.subtitle && (
        <p className={`text-lg mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {c.subtitle}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {c.ctaText && (
          <a
            href={c.ctaLink || '/contact'}
            className={`px-8 py-3.5 rounded-lg font-semibold transition-all shadow-md ${
              isDark
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-[#5C3BFF] text-white hover:bg-[#4828E0]'
            }`}
          >
            {c.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}

// 7. CARD GRID / FEATURE GRID
export function CardGridBlock({ content }) {
  const c = parseBlockContent(content);
  const cards = Array.isArray(c.cards) ? c.cards : [];

  return (
    <div>
      {c.eyebrow && (
        <span className="text-xs uppercase tracking-widest font-semibold text-[#5C3BFF] text-center block mb-2">
          {c.eyebrow}
        </span>
      )}
      {c.title && <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">{c.title}</h2>}
      {c.subtitle && <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">{c.subtitle}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <div key={i} className="p-8 rounded-xl border border-gray-200 bg-white hover:border-purple-300 transition-all shadow-sm">
            {card.icon && <div className="text-2xl mb-4 text-[#5C3BFF]">{card.icon}</div>}
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <div
              className="text-gray-600 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: card.description || '' }}
            />
            {card.link && (
              <a href={card.link} className="inline-block mt-4 text-xs font-semibold text-[#5C3BFF] hover:underline">
                Learn more &rarr;
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 8. FAQ BLOCK
export function FAQBlock({ content }) {
  const c = parseBlockContent(content);
  const items = Array.isArray(c.items) ? c.items : [];
  const [openIndex, setOpenIndex] = React.useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="max-w-3xl mx-auto">
      {c.title && <h2 className="text-3xl font-bold text-center mb-8">{c.title}</h2>}
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {items.map((item, i) => (
          <div key={i} className="py-5">
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-center justify-between text-left font-semibold text-lg hover:text-[#5C3BFF] transition-colors"
            >
              <span>{item.question}</span>
              <span className="text-2xl ml-4">{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && (
              <div
                className="mt-3 text-gray-600 text-sm leading-relaxed prose"
                dangerouslySetInnerHTML={{ __html: item.answer || '' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 9. STATS BLOCK
export function StatsBlock({ content }) {
  const c = parseBlockContent(content);
  const stats = Array.isArray(c.stats) ? c.stats : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((s, i) => (
        <div key={i} className="p-4">
          <div className="text-4xl sm:text-5xl font-extrabold text-[#5C3BFF] mb-2">{s.value}</div>
          <div className="text-sm font-semibold uppercase tracking-wider text-gray-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// 10. QUOTE BLOCK
export function QuoteBlock({ content }) {
  const c = parseBlockContent(content);

  return (
    <div className="max-w-3xl mx-auto text-center py-6">
      <blockquote className="text-2xl sm:text-3xl italic font-serif text-gray-800 leading-snug mb-6">
        &ldquo;{c.quote || 'Quality is doing it right when no one is looking.'}&rdquo;
      </blockquote>
      {c.author && <div className="font-bold text-gray-900">{c.author}</div>}
      {c.role && <div className="text-sm text-gray-500">{c.role}</div>}
    </div>
  );
}

// 11. COLUMNS (2, 3, 4 COLUMNS)
export function ColumnsBlock({ content, cols = 2 }) {
  const c = parseBlockContent(content);
  const columns = Array.isArray(c.columns) ? c.columns : [];

  const colClass = cols === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : cols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`grid ${colClass} gap-8`}>
      {columns.map((col, i) => (
        <div key={i} className="space-y-3">
          {col.title && <h3 className="text-xl font-bold">{col.title}</h3>}
          <div
            className="prose text-gray-600 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: col.bodyHtml || '' }}
          />
        </div>
      ))}
    </div>
  );
}

// 12. LOGO CLOUD BLOCK
export function LogoCloudBlock({ content }) {
  const c = parseBlockContent(content);
  const logos = Array.isArray(c.logos) ? c.logos : [];

  return (
    <div className="text-center">
      {c.title && <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">{c.title}</p>}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-75">
        {logos.map((l, i) => (
          <img key={i} src={l.url} alt={l.alt || 'Partner'} className="h-8 max-w-[120px] object-contain grayscale hover:grayscale-0 transition" />
        ))}
      </div>
    </div>
  );
}

// 13. PRICING BLOCK
export function PricingBlock({ content }) {
  const c = parseBlockContent(content);
  const tiers = Array.isArray(c.tiers) ? c.tiers : [];

  return (
    <div>
      {c.title && <h2 className="text-3xl font-bold text-center mb-4">{c.title}</h2>}
      {c.subtitle && <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">{c.subtitle}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((t, i) => (
          <div key={i} className={`p-8 rounded-2xl border ${t.featured ? 'border-[#5C3BFF] shadow-xl bg-purple-50/20' : 'border-gray-200 bg-white'}`}>
            <h3 className="text-xl font-bold mb-2">{t.name}</h3>
            <div className="text-3xl font-extrabold mb-4">{t.price}</div>
            <p className="text-xs text-gray-500 mb-6">{t.description}</p>
            <ul className="space-y-2 mb-8 text-sm">
              {(t.features || []).map((f, fi) => (
                <li key={fi} className="flex items-center gap-2">
                  <span className="text-[#5C3BFF] font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={t.ctaLink || '/contact'}
              className={`block text-center py-2.5 rounded-lg font-semibold text-sm ${
                t.featured ? 'bg-[#5C3BFF] text-white hover:bg-[#4828E0]' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {t.ctaText || 'Get Started'}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// 14. CONTACT / LEAD FORM BLOCK
export function ContactFormBlock({ content }) {
  const c = parseBlockContent(content);
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formName: c.formName || 'Page Lead Form',
          ...formData
        })
      });
      setSubmitted(true);
    } catch {
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-8 bg-green-50 rounded-2xl border border-green-200 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <h3 className="text-lg font-bold text-green-900">{c.successMessage || 'Thank you for reaching out!'}</h3>
        <p className="text-xs text-green-700 mt-1">Our team will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
      {c.title && <h2 className="text-2xl font-bold mb-2">{c.title}</h2>}
      {c.subtitle && <p className="text-sm text-gray-500 mb-6">{c.subtitle}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <input type="text" name="hp" style={{ display: 'none' }} onChange={(e) => setFormData({ ...formData, hp: e.target.value })} />

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name *</label>
          <input
            type="text"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full text-sm p-2.5 border rounded-lg focus:border-[#5C3BFF] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full text-sm p-2.5 border rounded-lg focus:border-[#5C3BFF] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full text-sm p-2.5 border rounded-lg focus:border-[#5C3BFF] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
          <textarea
            rows={3}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full text-sm p-2.5 border rounded-lg focus:border-[#5C3BFF] outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#5C3BFF] hover:bg-[#4828E0] text-white font-semibold rounded-lg transition"
        >
          {loading ? 'Submitting...' : c.buttonText || 'Submit Enquiry'}
        </button>
      </form>
    </div>
  );
}

// 15. CUSTOM CONTENT (Super Admin only, pre-sanitized)
export function CustomContentBlock({ content }) {
  const c = parseBlockContent(content);
  return (
    <div
      className="custom-content-block"
      dangerouslySetInnerHTML={{ __html: c.html || '<!-- Super Admin Custom HTML -->' }}
    />
  );
}

// BLOCK MAPPER COMPONENT
export default function BlockRenderer({ block }) {
  if (!block || !block.isVisible) return null;

  const s = parseBlockSettings(block.settings);
  const widthClass = WIDTH_PRESETS[s.width] || WIDTH_PRESETS.Standard;
  const paddingClass = PADDING_PRESETS[s.padding] || PADDING_PRESETS.Medium;
  const bgClass = BACKGROUND_PRESETS[s.background] || BACKGROUND_PRESETS.White;

  let blockComponent = null;

  switch (block.type) {
    case 'HERO':
      blockComponent = <HeroBlock content={block.content} settings={block.settings} />;
      break;
    case 'RICH_TEXT':
      blockComponent = <RichTextBlock content={block.content} settings={block.settings} />;
      break;
    case 'TEXT_IMAGE':
      blockComponent = <TextImageBlock content={block.content} settings={block.settings} imageOnLeft={false} />;
      break;
    case 'IMAGE_TEXT':
      blockComponent = <TextImageBlock content={block.content} settings={block.settings} imageOnLeft={true} />;
      break;
    case 'IMAGE_GALLERY':
      blockComponent = <ImageGalleryBlock content={block.content} />;
      break;
    case 'VIDEO':
      blockComponent = <VideoBlock content={block.content} />;
      break;
    case 'CTA':
      blockComponent = <CTABlock content={block.content} settings={block.settings} />;
      break;
    case 'CARD_GRID':
    case 'FEATURE_GRID':
    case 'SERVICE_GRID':
    case 'PROJECT_GRID':
      blockComponent = <CardGridBlock content={block.content} />;
      break;
    case 'FAQ':
    case 'ACCORDION':
      blockComponent = <FAQBlock content={block.content} />;
      break;
    case 'STATS':
      blockComponent = <StatsBlock content={block.content} />;
      break;
    case 'QUOTE':
    case 'TESTIMONIALS':
      blockComponent = <QuoteBlock content={block.content} />;
      break;
    case 'TWO_COLUMN':
      blockComponent = <ColumnsBlock content={block.content} cols={2} />;
      break;
    case 'THREE_COLUMN':
      blockComponent = <ColumnsBlock content={block.content} cols={3} />;
      break;
    case 'FOUR_COLUMN':
      blockComponent = <ColumnsBlock content={block.content} cols={4} />;
      break;
    case 'LOGO_CLOUD':
      blockComponent = <LogoCloudBlock content={block.content} />;
      break;
    case 'PRICING':
      blockComponent = <PricingBlock content={block.content} />;
      break;
    case 'CONTACT_FORM':
    case 'LEAD_FORM':
      blockComponent = <ContactFormBlock content={block.content} />;
      break;
    case 'CUSTOM_CONTENT':
      blockComponent = <CustomContentBlock content={block.content} />;
      break;
    case 'DIVIDER':
      blockComponent = <hr className="border-gray-200 my-4" />;
      break;
    case 'SPACER':
      blockComponent = <div className="h-12" />;
      break;
    default:
      blockComponent = <RichTextBlock content={block.content} settings={block.settings} />;
  }

  return (
    <section className={`w-full ${bgClass} ${paddingClass}`}>
      <div className={widthClass}>
        {blockComponent}
      </div>
    </section>
  );
}
