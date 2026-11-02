import React from 'react';

// Preset styles for width
export const WIDTH_PRESETS = {
  Narrow: 'max-w-3xl mx-auto px-4 sm:px-6',
  Standard: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
  Wide: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  Full: 'w-full px-4 sm:px-6 lg:px-8'
};

// Preset styles for padding
export const PADDING_PRESETS = {
  None: 'py-0',
  Small: 'py-6 sm:py-8',
  Medium: 'py-12 sm:py-16',
  Large: 'py-16 sm:py-24',
  'Extra Large': 'py-24 sm:py-32'
};

// Preset styles for backgrounds
export const BACKGROUND_PRESETS = {
  White: 'bg-white text-gray-900',
  'Soft Gray': 'bg-[#F9FAFB] text-gray-900 border-y border-gray-100',
  Black: 'bg-[#0A0A0A] text-white',
  Purple: 'bg-[#5C3BFF] text-white'
};

// Preset alignment
export const ALIGN_PRESETS = {
  Left: 'text-left',
  Center: 'text-center mx-auto',
  Right: 'text-right ml-auto'
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

  return (
    <div className={`relative ${alignClass} max-w-4xl`}>
      {c.eyebrow && (
        <span className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full mb-4 bg-purple-100 text-purple-700">
          {c.eyebrow}
        </span>
      )}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
        {c.title || 'Page Heading'}
      </h1>
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
            className="rounded-xl shadow-lg w-full object-cover max-h-[480px] border border-gray-100"
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
        {c.videoUrl && c.videoUrl.includes('youtube.com') ? (
          <iframe
            src={c.videoUrl}
            title={c.title || 'Video'}
            className="w-full h-full"
            allowFullScreen
          />
        ) : c.videoUrl ? (
          <video controls src={c.videoUrl} className="w-full h-full object-cover">
            Your browser does not support video.
          </video>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No video URL provided
          </div>
        )}
      </div>
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

// 11. CUSTOM CONTENT (Super Admin only, pre-sanitized)
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
      blockComponent = <CardGridBlock content={block.content} />;
      break;
    case 'FAQ':
      blockComponent = <FAQBlock content={block.content} />;
      break;
    case 'STATS':
      blockComponent = <StatsBlock content={block.content} />;
      break;
    case 'QUOTE':
      blockComponent = <QuoteBlock content={block.content} />;
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
