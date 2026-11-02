import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Eye, CheckCircle, AlertCircle,
  MoveUp, MoveDown, Trash2, Copy, EyeOff, Layout, Type, Image,
  Grid, HelpCircle, Settings, History, Globe, Bookmark, Monitor,
  Tablet, Smartphone, Check, HelpCircle as HelpIcon, FileText, Layers
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  getPage, updatePage, addBlock, updateBlock, deleteBlock,
  duplicateBlock, reorderBlocks, getPagePreviewToken, getPageRevisions, restorePageRevision
} from '../api/admin';
import RichTextEditor from './RichTextEditor';

const BLOCK_TYPES = [
  { type: 'HERO', label: 'Hero Header', icon: Layout, desc: 'Headline, subtitle, buttons & visual tags' },
  { type: 'RICH_TEXT', label: 'Rich Text Article', icon: Type, desc: 'Headings, lists, quotes & formatted copy' },
  { type: 'TEXT_IMAGE', label: 'Text + Image (Right)', icon: Image, desc: 'Story narrative with media on the right' },
  { type: 'IMAGE_TEXT', label: 'Image + Text (Left)', icon: Image, desc: 'Story narrative with media on the left' },
  { type: 'CARD_GRID', label: 'Cards / Capabilities', icon: Grid, desc: '3-column cards with icons and descriptions' },
  { type: 'TWO_COLUMN', label: 'Two Column Layout', icon: Grid, desc: 'Dual-column editorial or technical text' },
  { type: 'THREE_COLUMN', label: 'Three Column Layout', icon: Grid, desc: 'Tri-column structured feature blocks' },
  { type: 'FOUR_COLUMN', label: 'Four Column Grid', icon: Grid, desc: 'Wide matrix for logos or fast highlights' },
  { type: 'FAQ', label: 'FAQ Accordion', icon: HelpCircle, desc: 'Collapsible Q&A accordion list' },
  { type: 'STATS', label: 'Key Metrics & Numbers', icon: Grid, desc: 'Numerical proof & credibility counters' },
  { type: 'PRICING', label: 'Pricing Matrix', icon: Grid, desc: 'Tier cards with feature checklists & CTAs' },
  { type: 'CONTACT_FORM', label: 'Lead / Contact Form', icon: FileText, desc: 'Direct lead capture form with honeypot' },
  { type: 'LOGO_CLOUD', label: 'Partner Logo Cloud', icon: Layers, desc: 'Brand logo display with grayscale styling' },
  { type: 'CTA', label: 'Conversion Box (CTA)', icon: Layout, desc: 'High-conversion box with direct action' },
  { type: 'QUOTE', label: 'Editorial Testimonial', icon: Type, desc: 'Client praise or leadership perspective' },
  { type: 'VIDEO', label: 'Video Showcase', icon: Image, desc: 'YouTube, Vimeo, or direct MP4 video embed' }
];

function SortableBlockItem({
  block, index, isSelected, onSelect, onMove, onToggleVis, onDuplicate, onDelete
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const content = typeof block.content === 'string' ? JSON.parse(block.content || '{}') : block.content;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(block.id)}
      className={`relative rounded-xl border-2 transition p-4 bg-white shadow-sm cursor-pointer ${
        isSelected ? 'border-[#5C3BFF] ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'
      } ${!block.isVisible ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 text-xs">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 bg-gray-100 rounded text-gray-400 hover:text-gray-700 font-mono text-[10px]"
            title="Drag to reorder"
          >
            ⠿
          </span>
          <span className="font-bold text-gray-800 uppercase tracking-wide text-[10px] px-2 py-0.5 bg-gray-100 rounded">
            {block.type}
          </span>
          <span className="text-gray-500 truncate max-w-xs">
            {content.title || content.eyebrow || 'Untitled Section'}
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMove(index, 'up')}
            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Move Up"
          >
            <MoveUp size={14} />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Move Down"
          >
            <MoveDown size={14} />
          </button>
          <button
            onClick={() => onToggleVis(block)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
            title={block.isVisible ? 'Hide Section' : 'Show Section'}
          >
            {block.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={() => onDuplicate(block.id)}
            className="p-1 text-gray-400 hover:text-[#5C3BFF] rounded hover:bg-gray-100"
            title="Duplicate Block"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
            title="Delete Block"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Snapshot Preview */}
      <div className="text-xs text-gray-600">
        {block.type === 'HERO' && (
          <div className="text-center py-3 bg-gray-50 rounded-lg">
            <h3 className="font-extrabold text-sm text-gray-900">{content.title || 'Page Heading'}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">{content.subtitle}</p>
          </div>
        )}
        {block.type === 'RICH_TEXT' && (
          <div
            className="prose prose-xs line-clamp-2 text-gray-500"
            dangerouslySetInnerHTML={{ __html: content.bodyHtml || '<p>Empty text block</p>' }}
          />
        )}
        {(block.type === 'TEXT_IMAGE' || block.type === 'IMAGE_TEXT') && (
          <div className="flex gap-3 items-center bg-gray-50 p-2 rounded-lg">
            <div className="w-12 h-10 bg-gray-200 rounded object-cover overflow-hidden flex-shrink-0">
              {content.imageUrl && <img src={content.imageUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="truncate">
              <div className="font-bold text-gray-800">{content.title || 'Feature Title'}</div>
            </div>
          </div>
        )}
        {block.type === 'CARD_GRID' && (
          <div className="text-gray-500 italic text-[11px]">{(content.cards || []).length} Cards configured</div>
        )}
        {block.type === 'FAQ' && (
          <div className="text-gray-500 italic text-[11px]">{(content.items || []).length} FAQ Questions</div>
        )}
        {block.type === 'CTA' && (
          <div className="py-2 bg-purple-50 text-center rounded font-semibold text-purple-900 text-[11px]">
            CTA: {content.title}
          </div>
        )}
        {block.type === 'CONTACT_FORM' && (
          <div className="py-2 bg-gray-50 text-center rounded text-gray-700 font-semibold text-[11px]">
            Lead Form: {content.title || 'Inquiry Form'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PageBuilderCMS({ pageId, onBack }) {
  const [activeTab, setActiveTab] = useState('CONTENT'); // CONTENT, SEO, SETTINGS, REVISIONS
  const [devicePreview, setDevicePreview] = useState('Desktop'); // Desktop, Tablet, Mobile
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved, saving, unsaved
  const [seoWarnings, setSeoWarnings] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load page data
  const loadPageData = async () => {
    try {
      setLoading(true);
      const res = await getPage(pageId);
      if (res.success && res.data) {
        setPage(res.data);
        setBlocks(res.data.blocks || []);
        if (res.data.blocks && res.data.blocks.length > 0 && !selectedBlockId) {
          setSelectedBlockId(res.data.blocks[0].id);
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [pageId]);

  // Load revisions
  useEffect(() => {
    if (activeTab === 'REVISIONS') {
      getPageRevisions(pageId).then((res) => {
        if (res.success) setRevisions(res.data);
      });
    }
  }, [activeTab, pageId]);

  // Unsaved changes protection
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Autosave timer (every 12 seconds if unsaved)
  useEffect(() => {
    if (!hasUnsavedChanges || !page) return;

    const timer = setTimeout(() => {
      handleSavePage(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, page]);

  // Validate SEO
  useEffect(() => {
    if (!page) return;
    const warnings = [];
    if (!page.metaTitle) {
      warnings.push('Meta title is missing.');
    } else if (page.metaTitle.length < 30 || page.metaTitle.length > 65) {
      warnings.push(`Meta title length (${page.metaTitle.length} chars) is outside optimal 50–60 range.`);
    }

    if (!page.metaDescription) {
      warnings.push('Meta description is missing.');
    } else if (page.metaDescription.length < 120 || page.metaDescription.length > 165) {
      warnings.push(`Meta description length (${page.metaDescription.length} chars) is outside optimal 140–160 range.`);
    }

    const heroCount = blocks.filter((b) => b.type === 'HERO').length;
    if (heroCount === 0) {
      warnings.push('No primary Hero/H1 section found on page.');
    } else if (heroCount > 1) {
      warnings.push('Multiple Hero sections found. Keep 1 primary H1 per page.');
    }

    setSeoWarnings(warnings);
  }, [page, blocks]);

  const handlePageFieldChange = (field, value) => {
    setPage((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');
  };

  const handleSavePage = async (isAutosave = false) => {
    try {
      setSaveStatus('saving');
      const res = await updatePage(pageId, page);
      if (res.success) {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      setSaveStatus('unsaved');
      if (!isAutosave) alert(err.message);
    }
  };

  // Add block
  const handleAddBlock = async (type) => {
    try {
      const defaultContent =
        type === 'HERO'
          ? { title: page.title, subtitle: 'Grounded subtitle here', ctaText: 'Contact Us', ctaLink: '/contact' }
          : type === 'RICH_TEXT'
          ? { bodyHtml: '<h2>Section Heading</h2><p>Provide clear, practical details here.</p>' }
          : type === 'TEXT_IMAGE' || type === 'IMAGE_TEXT'
          ? { title: 'Focused Feature', bodyHtml: '<p>Explain your system or service clearly.</p>', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' }
          : type === 'CARD_GRID'
          ? { title: 'Core Capabilities', cards: [{ title: 'Engineering & UI', description: 'Production-ready code.' }, { title: 'Automation', description: 'Custom operational pipelines.' }] }
          : type === 'TWO_COLUMN'
          ? { columns: [{ title: 'System Architecture', bodyHtml: '<p>Robust backend workflows.</p>' }, { title: 'Frontend Velocity', bodyHtml: '<p>Sub-second interaction speed.</p>' }] }
          : type === 'PRICING'
          ? { title: 'Transparent Retainers', tiers: [{ name: 'Sprint', price: '₹75,000', description: 'Fast execution for specific modules.', features: ['Dedicated PM', 'Weekly sprints'] }] }
          : type === 'CONTACT_FORM'
          ? { title: 'Get a Technical Proposal', subtitle: 'Direct line to our senior team.', buttonText: 'Send Request' }
          : type === 'FAQ'
          ? { title: 'Frequently Asked Questions', items: [{ question: 'How quickly do you ship?', answer: '<p>Typically 2 to 6 weeks.</p>' }] }
          : type === 'STATS'
          ? { stats: [{ value: '45+', label: 'Shipped Systems' }, { value: '99.9%', label: 'Uptime Reliability' }] }
          : type === 'CTA'
          ? { title: 'Ready to build something solid?', subtitle: 'Talk to an engineer or founder today.', ctaText: 'Talk to Us', ctaLink: '/contact' }
          : { title: 'New Section', bodyHtml: '<p>Content</p>' };

      const res = await addBlock(pageId, {
        type,
        settings: { width: 'Standard', padding: 'Medium', background: 'White', alignment: 'Left', headingTag: 'h2', headingSize: '3XL' },
        content: defaultContent
      });

      if (res.success && res.data) {
        setBlocks((prev) => [...prev, res.data]);
        setSelectedBlockId(res.data.id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateSelectedBlock = async (updatedSettings, updatedContent) => {
    const selected = blocks.find((b) => b.id === selectedBlockId);
    if (!selected) return;

    try {
      setSaveStatus('saving');
      const payload = {};
      if (updatedSettings !== undefined) payload.settings = updatedSettings;
      if (updatedContent !== undefined) payload.content = updatedContent;

      const res = await updateBlock(selectedBlockId, payload);
      if (res.success) {
        setBlocks((prev) => prev.map((b) => (b.id === selectedBlockId ? res.data : b)));
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      setSaveStatus('unsaved');
      alert(err.message);
    }
  };

  // Reorder via Drag and Drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    const reordered = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(reordered);

    try {
      await reorderBlocks(pageId, reordered.map((b) => b.id));
    } catch {
      setBlocks(blocks); // Rollback
      alert('Failed to reorder blocks');
    }
  };

  const handleMoveBlock = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const reordered = arrayMove(blocks, index, targetIndex);
    setBlocks(reordered);
    try {
      await reorderBlocks(pageId, reordered.map((b) => b.id));
    } catch {
      setBlocks(blocks);
    }
  };

  const handleToggleBlockVisibility = async (block) => {
    try {
      const res = await updateBlock(block.id, { isVisible: !block.isVisible });
      if (res.success) {
        setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, isVisible: !b.isVisible } : b)));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDuplicateBlock = async (id) => {
    try {
      const res = await duplicateBlock(id);
      if (res.success) loadPageData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteBlock = async (id) => {
    if (!window.confirm('Delete this block?')) return;
    try {
      const res = await deleteBlock(id);
      if (res.success) {
        const remaining = blocks.filter((b) => b.id !== id);
        setBlocks(remaining);
        if (selectedBlockId === id) {
          setSelectedBlockId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenPreview = async () => {
    try {
      const res = await getPagePreviewToken(pageId);
      if (res.success && res.previewUrl) {
        window.open(res.previewUrl, '_blank');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRestore = async (revisionId) => {
    if (!window.confirm('Restore this snapshot?')) return;
    try {
      const res = await restorePageRevision(pageId, revisionId);
      if (res.success) {
        loadPageData();
        alert('Revision restored successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading Page Builder...</div>;
  if (!page) return <div className="p-12 text-center text-red-500">Page not found.</div>;

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedSettings = selectedBlock
    ? typeof selectedBlock.settings === 'string'
      ? JSON.parse(selectedBlock.settings || '{}')
      : selectedBlock.settings
    : {};
  const selectedContent = selectedBlock
    ? typeof selectedBlock.content === 'string'
      ? JSON.parse(selectedBlock.content || '{}')
      : selectedBlock.content
    : {};

  const previewWidthClass =
    devicePreview === 'Mobile' ? 'max-w-[390px]' : devicePreview === 'Tablet' ? 'max-w-[768px]' : 'max-w-3xl';

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Leave anyway?')) return;
              onBack();
            }}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="Back to Pages"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-900 text-sm leading-none">{page.title}</h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  page.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {page.status}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono mt-0.5">/{page.slug}</div>
          </div>
        </div>

        {/* Tabs & Breakpoint Preview Toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'CONTENT', label: 'Canvas', icon: Layout },
              { id: 'SEO', label: 'SEO & Schema', icon: Globe },
              { id: 'SETTINGS', label: 'Settings', icon: Settings },
              { id: 'REVISIONS', label: 'Revisions', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'CONTENT' && (
            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setDevicePreview('Desktop')}
                className={`p-1.5 rounded text-xs ${devicePreview === 'Desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                title="Desktop 1440px"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setDevicePreview('Tablet')}
                className={`p-1.5 rounded text-xs ${devicePreview === 'Tablet' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                title="Tablet 768px"
              >
                <Tablet size={14} />
              </button>
              <button
                onClick={() => setDevicePreview('Mobile')}
                className={`p-1.5 rounded text-xs ${devicePreview === 'Mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                title="Mobile 390px"
              >
                <Smartphone size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            {saveStatus === 'saving' ? (
              <span className="text-amber-500">Autosaving...</span>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle size={12} className="text-green-500" /> Saved
              </>
            ) : (
              <span className="text-gray-400">Unsaved changes</span>
            )}
          </span>

          <button
            onClick={handleOpenPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <Eye size={14} /> Preview Draft
          </button>

          <button
            onClick={() => handleSavePage(false)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#5C3BFF] hover:bg-[#4828E0] text-white rounded-lg transition shadow-sm"
          >
            <Save size={14} /> Save Page
          </button>
        </div>
      </header>

      {/* Main Canvas / Panes */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'CONTENT' && (
          <>
            {/* Left Block Library */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4 overflow-y-auto">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Add Section</h2>
              <div className="space-y-1.5">
                {BLOCK_TYPES.map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.type}
                      onClick={() => handleAddBlock(bt.type)}
                      className="w-full flex items-start gap-2.5 p-2 text-left rounded-lg border border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 transition group"
                    >
                      <div className="p-1.5 bg-gray-100 group-hover:bg-purple-100 text-gray-600 group-hover:text-[#5C3BFF] rounded">
                        <Icon size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{bt.label}</div>
                        <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{bt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Center Canvas with dnd-kit Sortable */}
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-gray-100 transition-all">
              <div className={`w-full ${previewWidthClass} space-y-4 pb-20 transition-all duration-200`}>
                {blocks.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">No blocks added yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Select a section block from the left to start building.</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      {blocks.map((block, index) => (
                        <SortableBlockItem
                          key={block.id}
                          block={block}
                          index={index}
                          isSelected={block.id === selectedBlockId}
                          onSelect={setSelectedBlockId}
                          onMove={handleMoveBlock}
                          onToggleVis={handleToggleBlockVisibility}
                          onDuplicate={handleDuplicateBlock}
                          onDelete={handleDeleteBlock}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </main>

            {/* Right Settings & Formatting Panel */}
            <aside className="w-96 bg-white border-l border-gray-200 flex flex-col p-5 overflow-y-auto">
              {selectedBlock ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Section Settings</h2>
                    <h3 className="text-sm font-bold text-gray-900 mt-0.5">{selectedBlock.type} Block</h3>
                  </div>

                  {/* Layout & Typography Controls */}
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Semantic Tag</label>
                        <select
                          value={selectedSettings.headingTag || 'h2'}
                          onChange={(e) =>
                            handleUpdateSelectedBlock({ ...selectedSettings, headingTag: e.target.value }, selectedContent)
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="h1">H1 (Primary Heading)</option>
                          <option value="h2">H2 (Sub-section)</option>
                          <option value="h3">H3</option>
                          <option value="h4">H4</option>
                          <option value="p">P (Paragraph)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Visual Size</label>
                        <select
                          value={selectedSettings.headingSize || '3XL'}
                          onChange={(e) =>
                            handleUpdateSelectedBlock({ ...selectedSettings, headingSize: e.target.value }, selectedContent)
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="SM">Small</option>
                          <option value="BASE">Base</option>
                          <option value="LG">Large</option>
                          <option value="XL">Extra Large</option>
                          <option value="2XL">2XL</option>
                          <option value="3XL">3XL</option>
                          <option value="4XL">4XL</option>
                          <option value="DISPLAY">DISPLAY (Hero size)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Width</label>
                        <select
                          value={selectedSettings.width || 'Standard'}
                          onChange={(e) =>
                            handleUpdateSelectedBlock({ ...selectedSettings, width: e.target.value }, selectedContent)
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="Narrow">Narrow (max-w-3xl)</option>
                          <option value="Standard">Standard (max-w-6xl)</option>
                          <option value="Wide">Wide (max-w-7xl)</option>
                          <option value="Full">Full Width</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Padding</label>
                        <select
                          value={selectedSettings.padding || 'Medium'}
                          onChange={(e) =>
                            handleUpdateSelectedBlock({ ...selectedSettings, padding: e.target.value }, selectedContent)
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                        >
                          <option value="None">None</option>
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                          <option value="Extra Large">Extra Large</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Background Preset</label>
                      <select
                        value={selectedSettings.background || 'White'}
                        onChange={(e) =>
                          handleUpdateSelectedBlock({ ...selectedSettings, background: e.target.value }, selectedContent)
                        }
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="White">White</option>
                        <option value="Soft Gray">Soft Gray (#F9FAFB)</option>
                        <option value="Black">Black (#0A0A0A)</option>
                        <option value="Purple">Brand Purple (#5C3BFF)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Alignment</label>
                      <select
                        value={selectedSettings.alignment || 'Left'}
                        onChange={(e) =>
                          handleUpdateSelectedBlock({ ...selectedSettings, alignment: e.target.value }, selectedContent)
                        }
                        className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Left">Left</option>
                        <option value="Center">Center</option>
                        <option value="Right">Right</option>
                      </select>
                    </div>
                  </div>

                  {/* Section Content Fields */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Content Fields</h4>

                    {selectedContent.eyebrow !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Eyebrow</label>
                        <input
                          type="text"
                          value={selectedContent.eyebrow || ''}
                          onChange={(e) =>
                            handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, eyebrow: e.target.value })
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}

                    {selectedContent.title !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Headline</label>
                        <input
                          type="text"
                          value={selectedContent.title || ''}
                          onChange={(e) =>
                            handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, title: e.target.value })
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg font-semibold"
                        />
                      </div>
                    )}

                    {selectedContent.subtitle !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Subtitle</label>
                        <textarea
                          rows={2}
                          value={selectedContent.subtitle || ''}
                          onChange={(e) =>
                            handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, subtitle: e.target.value })
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}

                    {selectedContent.bodyHtml !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Rich Text Content</label>
                        <RichTextEditor
                          content={selectedContent.bodyHtml || ''}
                          onChange={(html) =>
                            handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, bodyHtml: html })
                          }
                        />
                      </div>
                    )}

                    {/* Image Controls: URL, Alt, Aspect Ratio, Focal Point */}
                    {selectedContent.imageUrl !== undefined && (
                      <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <label className="block text-xs font-bold text-gray-800">Image Asset Controls</label>
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={selectedContent.imageUrl || ''}
                          onChange={(e) =>
                            handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, imageUrl: e.target.value })
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Required Alt Description"
                          value={selectedContent.imageAlt || ''}
                          onChange={(e) =>
                            handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, imageAlt: e.target.value })
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                        />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[11px] text-gray-500">Aspect Ratio</label>
                            <select
                              value={selectedContent.aspectRatio || 'auto'}
                              onChange={(e) =>
                                handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, aspectRatio: e.target.value })
                              }
                              className="w-full text-xs p-1.5 border rounded bg-white"
                            >
                              <option value="auto">Auto</option>
                              <option value="16/9">16:9 Landscape</option>
                              <option value="4/3">4:3 Standard</option>
                              <option value="1/1">1:1 Square</option>
                              <option value="3/4">3:4 Portrait</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-500">Focal Point Y (%)</label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={selectedContent.focalY || 50}
                              onChange={(e) =>
                                handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, focalY: Number(e.target.value) })
                              }
                              className="w-full text-xs p-1.5 border rounded bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    {selectedContent.ctaText !== undefined && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={selectedContent.ctaText || ''}
                            onChange={(e) =>
                              handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, ctaText: e.target.value })
                            }
                            className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Button URL</label>
                          <input
                            type="text"
                            value={selectedContent.ctaLink || ''}
                            onChange={(e) =>
                              handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, ctaLink: e.target.value })
                            }
                            className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Select a section from the canvas to edit its layout presets and content.
                </div>
              )}
            </aside>
          </>
        )}

        {/* SEO Tab */}
        {activeTab === 'SEO' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">SEO & SERP Management</h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure search engine visibility, OpenGraph cards, structured schema and canonical settings.
              </p>
            </div>

            {/* Google SERP Preview */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Google SERP Preview</h3>
              <div className="font-sans max-w-2xl bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-700 truncate flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#5C3BFF] text-[9px] text-white flex items-center justify-center font-bold">
                    D
                  </span>
                  <span>digitalclik.com</span>
                  <span className="text-gray-400">&rsaquo;</span>
                  <span className="text-gray-500">{page.slug}</span>
                </div>
                <div className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug">
                  {page.metaTitle || page.title || 'DigitalClik Agency'}
                </div>
                <div className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                  {page.metaDescription || 'Add a meta description to control how this page appears in search results.'}
                </div>
              </div>
            </div>

            {/* SEO Warnings Checklist */}
            {seoWarnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-2">
                  <AlertCircle size={16} /> SEO Quality Checks
                </div>
                <ul className="list-disc pl-5 text-xs text-amber-700 space-y-1">
                  {seoWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fields */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">SEO Meta Title</label>
                  <span
                    className={`text-[11px] font-mono ${
                      (page.metaTitle || '').length >= 50 && (page.metaTitle || '').length <= 60
                        ? 'text-green-600 font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {(page.metaTitle || '').length} / 60 chars (Optimal: 50–60)
                  </span>
                </div>
                <input
                  type="text"
                  value={page.metaTitle || ''}
                  onChange={(e) => handlePageFieldChange('metaTitle', e.target.value)}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">Meta Description</label>
                  <span
                    className={`text-[11px] font-mono ${
                      (page.metaDescription || '').length >= 140 && (page.metaDescription || '').length <= 160
                        ? 'text-green-600 font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {(page.metaDescription || '').length} / 160 chars (Optimal: 140–160)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={page.metaDescription || ''}
                  onChange={(e) => handlePageFieldChange('metaDescription', e.target.value)}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={page.canonicalUrl || ''}
                    onChange={(e) => handlePageFieldChange('canonicalUrl', e.target.value)}
                    placeholder="Auto-derived if blank"
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Schema Type</label>
                  <select
                    value={page.schemaType || 'WebPage'}
                    onChange={(e) => handlePageFieldChange('schemaType', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="WebPage">WebPage</option>
                    <option value="Service">Service</option>
                    <option value="Article">Article</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="AboutPage">AboutPage</option>
                    <option value="ContactPage">ContactPage</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'SETTINGS' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Page Configuration & Publishing</h2>
              <p className="text-xs text-gray-500 mt-1">Manage URL routing, scheduled publication, and template presets.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Page Title *</label>
                <input
                  type="text"
                  value={page.title || ''}
                  onChange={(e) => handlePageFieldChange('title', e.target.value)}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL Slug *</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-xs text-gray-500 font-mono">
                    /
                  </span>
                  <input
                    type="text"
                    value={page.slug || ''}
                    onChange={(e) => handlePageFieldChange('slug', e.target.value)}
                    className="flex-1 text-sm p-2.5 border border-gray-300 rounded-r-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={page.status || 'DRAFT'}
                    onChange={(e) => handlePageFieldChange('status', e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Editorial Status</label>
                  <select
                    value={page.editorialStatus || 'IN_PROGRESS'}
                    onChange={(e) => handlePageFieldChange('editorialStatus', e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="READY_FOR_REVIEW">Ready for Review</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Publishing */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-800 mb-2">Scheduled Publication (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Publish At</label>
                    <input
                      type="datetime-local"
                      value={page.publishAt ? new Date(page.publishAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handlePageFieldChange('publishAt', e.target.value ? new Date(e.target.value) : null)}
                      className="w-full text-xs p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Unpublish At</label>
                    <input
                      type="datetime-local"
                      value={page.unpublishAt ? new Date(page.unpublishAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handlePageFieldChange('unpublishAt', e.target.value ? new Date(e.target.value) : null)}
                      className="w-full text-xs p-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revisions Tab */}
        {activeTab === 'REVISIONS' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Revision History</h2>
              <p className="text-xs text-gray-500 mt-1">Audit past snapshots and restore any version with one click.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
              {revisions.map((rev) => (
                <div key={rev.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <div className="text-xs font-bold text-gray-800">{rev.note || 'Snapshot'}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {rev.author || 'Admin'} &bull; {new Date(rev.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(rev.id)}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-[#5C3BFF] rounded-lg transition"
                  >
                    Restore Snapshot
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
