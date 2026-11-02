import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Eye, CheckCircle, AlertCircle, Plus,
  MoveUp, MoveDown, Trash2, Copy, EyeOff, Layout, Type, Image,
  Grid, HelpCircle, FileText, Settings, History, Globe
} from 'lucide-react';
import {
  getPage, updatePage, addBlock, updateBlock, deleteBlock,
  duplicateBlock, reorderBlocks, getPagePreviewToken, getPageRevisions, restorePageRevision
} from '../api/admin';
import RichTextEditor from './RichTextEditor';

const BLOCK_TYPES = [
  { type: 'HERO', label: 'Hero Header', icon: Layout, desc: 'Prominent header with headline, subtitle & CTA buttons' },
  { type: 'RICH_TEXT', label: 'Rich Text Article', icon: Type, desc: 'Formatted typography, headings, lists & blockquotes' },
  { type: 'TEXT_IMAGE', label: 'Text + Image (Right)', icon: Image, desc: 'Feature story with media placed on the right' },
  { type: 'IMAGE_TEXT', label: 'Image + Text (Left)', icon: Image, desc: 'Feature story with media placed on the left' },
  { type: 'CARD_GRID', label: 'Cards / Capabilities Grid', icon: Grid, desc: '3-column cards with icons, titles & summaries' },
  { type: 'FAQ', label: 'FAQ Accordion', icon: HelpCircle, desc: 'Expandable Q&A accordion list' },
  { type: 'STATS', label: 'Key Metrics & Numbers', icon: Grid, desc: 'Numerical credibility data points' },
  { type: 'CTA', label: 'Conversion Call To Action', icon: Layout, desc: 'High-impact conversion box with direct CTA' },
  { type: 'QUOTE', label: 'Editorial Quote / Testimonial', icon: Type, desc: 'Client praise or team perspective' }
];

export default function PageBuilderCMS({ pageId, onBack }) {
  const [activeTab, setActiveTab] = useState('CONTENT'); // CONTENT, SEO, SETTINGS, REVISIONS
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved, saving, unsaved
  const [seoWarnings, setSeoWarnings] = useState([]);
  const [revisions, setRevisions] = useState([]);

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

  // Load revisions when tab opens
  useEffect(() => {
    if (activeTab === 'REVISIONS') {
      getPageRevisions(pageId).then((res) => {
        if (res.success) setRevisions(res.data);
      });
    }
  }, [activeTab, pageId]);

  // Validate SEO on page change
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

    // Check for H1 blocks
    const heroCount = blocks.filter((b) => b.type === 'HERO').length;
    if (heroCount === 0) {
      warnings.push('No primary Hero/H1 section found on page.');
    } else if (heroCount > 1) {
      warnings.push('Multiple Hero sections found. Keep 1 primary H1 per page.');
    }

    setSeoWarnings(warnings);
  }, [page, blocks]);

  // Handle Page Update
  const handlePageFieldChange = (field, value) => {
    setPage((prev) => ({ ...prev, [field]: value }));
    setSaveStatus('unsaved');
  };

  const handleSavePage = async () => {
    try {
      setSaveStatus('saving');
      const res = await updatePage(pageId, page);
      if (res.success) {
        setSaveStatus('saved');
      }
    } catch (err) {
      setSaveStatus('unsaved');
      alert(err.message);
    }
  };

  // Block Actions
  const handleAddBlock = async (type) => {
    try {
      const defaultContent =
        type === 'HERO'
          ? { title: page.title, subtitle: 'Grounded subtitle here', ctaText: 'Contact Us', ctaLink: '/contact' }
          : type === 'RICH_TEXT'
          ? { bodyHtml: '<h2>Section Heading</h2><p>Provide detailed, clear content here.</p>' }
          : type === 'TEXT_IMAGE' || type === 'IMAGE_TEXT'
          ? { title: 'Focused Feature', bodyHtml: '<p>Explain your system or service clearly.</p>', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' }
          : type === 'CARD_GRID'
          ? { title: 'Core Capabilities', cards: [{ title: 'Design & Code', description: 'Real engineering and UI.' }, { title: 'Automation', description: 'Custom pipelines.' }] }
          : type === 'FAQ'
          ? { title: 'Frequently Asked Questions', items: [{ question: 'How quickly do you ship?', answer: '<p>Typically 2 to 6 weeks depending on project scope.</p>' }] }
          : type === 'STATS'
          ? { stats: [{ value: '45+', label: 'Shipped Systems' }, { value: '99.9%', label: 'Uptime Reliability' }] }
          : type === 'CTA'
          ? { title: 'Ready to build something solid?', subtitle: 'Talk to an engineer or founder today.', ctaText: 'Talk to Us', ctaLink: '/contact' }
          : { title: 'New Section', bodyHtml: '<p>Content</p>' };

      const res = await addBlock(pageId, {
        type,
        settings: { width: 'Standard', padding: 'Medium', background: 'White', alignment: 'Left' },
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
      }
    } catch (err) {
      setSaveStatus('unsaved');
      alert(err.message);
    }
  };

  const handleDuplicateBlock = async (id) => {
    try {
      const res = await duplicateBlock(id);
      if (res.success) {
        loadPageData();
      }
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

  const handleMoveBlock = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const reordered = [...blocks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setBlocks(reordered);
    try {
      await reorderBlocks(pageId, reordered.map((b) => b.id));
    } catch (err) {
      alert(err.message);
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
    if (!window.confirm('Restore this revision? Current unsaved work will be backed up.')) return;
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

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading Page Builder...</div>;
  }

  if (!page) {
    return <div className="p-12 text-center text-red-500">Page not found.</div>;
  }

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

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
      {/* TOP BAR */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
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

        {/* TABS */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'CONTENT', label: 'Blocks Canvas', icon: Layout },
            { id: 'SEO', label: 'SEO & Meta', icon: Globe },
            { id: 'SETTINGS', label: 'Page Settings', icon: Settings },
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

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            {saveStatus === 'saving' ? (
              <span className="text-amber-500">Saving...</span>
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
            onClick={handleSavePage}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#5C3BFF] hover:bg-[#4828E0] text-white rounded-lg transition shadow-sm"
          >
            <Save size={14} /> Save Page
          </button>
        </div>
      </header>

      {/* BODY CONTENT BY TAB */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============================================================== */}
        {/* 1. CONTENT CANVAS TAB (3-PANEL BUILDER) */}
        {/* ============================================================== */}
        {activeTab === 'CONTENT' && (
          <>
            {/* LEFT PANEL: BLOCK LIBRARY */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4 overflow-y-auto">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Add Section</h2>
              <div className="space-y-2">
                {BLOCK_TYPES.map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.type}
                      onClick={() => handleAddBlock(bt.type)}
                      className="w-full flex items-start gap-2.5 p-2.5 text-left rounded-lg border border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 transition group"
                    >
                      <div className="p-1.5 bg-gray-100 group-hover:bg-purple-100 text-gray-600 group-hover:text-[#5C3BFF] rounded">
                        <Icon size={16} />
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

            {/* CENTER PANEL: SECTION CANVAS */}
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              <div className="w-full max-w-3xl space-y-4 pb-20">
                {blocks.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">No blocks added yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Select a section block from the left to start building.</p>
                  </div>
                ) : (
                  blocks.map((block, index) => {
                    const isSelected = block.id === selectedBlockId;
                    const content =
                      typeof block.content === 'string' ? JSON.parse(block.content || '{}') : block.content;

                    return (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`relative rounded-xl border-2 transition p-4 bg-white shadow-sm cursor-pointer ${
                          isSelected ? 'border-[#5C3BFF] ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'
                        } ${!block.isVisible ? 'opacity-50' : ''}`}
                      >
                        {/* Section Header Controls */}
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 uppercase tracking-wide text-[10px] px-2 py-0.5 bg-gray-100 rounded">
                              {block.type}
                            </span>
                            <span className="text-gray-500 truncate max-w-xs">
                              {content.title || content.eyebrow || 'Untitled Section'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleMoveBlock(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                              title="Move Up"
                            >
                              <MoveUp size={14} />
                            </button>
                            <button
                              onClick={() => handleMoveBlock(index, 'down')}
                              disabled={index === blocks.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                              title="Move Down"
                            >
                              <MoveDown size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleBlockVisibility(block)}
                              className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                              title={block.isVisible ? 'Hide Section' : 'Show Section'}
                            >
                              {block.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                              onClick={() => handleDuplicateBlock(block.id)}
                              className="p-1 text-gray-400 hover:text-[#5C3BFF] rounded hover:bg-gray-100"
                              title="Duplicate Block"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                              title="Delete Block"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Visual Preview Snapshot */}
                        <div className="text-xs text-gray-600">
                          {block.type === 'HERO' && (
                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                              <h3 className="font-extrabold text-base text-gray-900">{content.title || 'Page Heading'}</h3>
                              <p className="text-xs text-gray-500 mt-1">{content.subtitle}</p>
                            </div>
                          )}
                          {block.type === 'RICH_TEXT' && (
                            <div
                              className="prose prose-xs line-clamp-3 text-gray-500"
                              dangerouslySetInnerHTML={{ __html: content.bodyHtml || '<p>Empty text block</p>' }}
                            />
                          )}
                          {(block.type === 'TEXT_IMAGE' || block.type === 'IMAGE_TEXT') && (
                            <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-lg">
                              <div className="w-16 h-12 bg-gray-200 rounded object-cover overflow-hidden flex-shrink-0">
                                {content.imageUrl && <img src={content.imageUrl} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="truncate">
                                <div className="font-bold text-gray-800">{content.title || 'Feature Title'}</div>
                                <div className="text-[11px] text-gray-400 truncate">{content.description || 'Feature narrative...'}</div>
                              </div>
                            </div>
                          )}
                          {block.type === 'CARD_GRID' && (
                            <div className="grid grid-cols-3 gap-2">
                              {(content.cards || []).slice(0, 3).map((c, i) => (
                                <div key={i} className="p-2 border rounded bg-gray-50 text-[11px]">
                                  <div className="font-bold">{c.title || `Card ${i + 1}`}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {block.type === 'FAQ' && (
                            <div className="text-[11px] text-gray-500 italic">
                              {(content.items || []).length} FAQ question(s) configured
                            </div>
                          )}
                          {block.type === 'CTA' && (
                            <div className="text-center py-3 bg-purple-50 rounded text-purple-900 font-semibold text-xs">
                              CTA Box: {content.title}
                            </div>
                          )}
                          {block.type === 'STATS' && (
                            <div className="flex justify-around py-2 bg-gray-50 rounded font-bold text-[#5C3BFF]">
                              {(content.stats || []).map((s, i) => (
                                <span key={i}>{s.value}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </main>

            {/* RIGHT PANEL: SELECTED BLOCK SETTINGS & RICH TEXT */}
            <aside className="w-96 bg-white border-l border-gray-200 flex flex-col p-5 overflow-y-auto">
              {selectedBlock ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Section Settings</h2>
                    <h3 className="text-sm font-bold text-gray-900 mt-0.5">{selectedBlock.type} Block</h3>
                  </div>

                  {/* Constrained Design Controls */}
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Section Width</label>
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Padding Spacing</label>
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Text Alignment</label>
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

                  {/* Section Content Controls */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Content Fields</h4>

                    {selectedContent.eyebrow !== undefined && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Eyebrow Tag</label>
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
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Heading Title</label>
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

                    {/* Rich Text Editor for Body Html */}
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

                    {/* Image URL & Alt */}
                    {selectedContent.imageUrl !== undefined && (
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-700">Image Asset</label>
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={selectedContent.imageUrl || ''}
                          onChange={(e) =>
                            handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, imageUrl: e.target.value })
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Required Alt Description (for SEO/Accessibility)"
                          value={selectedContent.imageAlt || ''}
                          onChange={(e) =>
                            handleUpdateSelectedBlock(selectedSettings, { ...selectedContent, imageAlt: e.target.value })
                          }
                          className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}

                    {/* Buttons */}
                    {selectedContent.ctaText !== undefined && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">CTA Label</label>
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
                          <label className="block text-xs font-semibold text-gray-700 mb-1">CTA URL</label>
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

        {/* ============================================================== */}
        {/* 2. SEO & METADATA MANAGEMENT TAB */}
        {/* ============================================================== */}
        {activeTab === 'SEO' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">SEO & SERP Management</h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure search engine visibility, OpenGraph social cards, structured data and canonical URLs.
              </p>
            </div>

            {/* Live Google Search Preview */}
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
                  <AlertCircle size={16} /> SEO Quality Suggestions
                </div>
                <ul className="list-disc pl-5 text-xs text-amber-700 space-y-1">
                  {seoWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Title & Description Fields */}
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
                  placeholder="e.g. Website Development Gurgaon | DigitalClik Studio"
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5C3BFF]"
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
                  placeholder="Grounded, click-worthy summary for search engines..."
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5C3BFF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Canonical URL (Optional)</label>
                  <input
                    type="text"
                    value={page.canonicalUrl || ''}
                    onChange={(e) => handlePageFieldChange('canonicalUrl', e.target.value)}
                    placeholder="https://digitalclik.com/original-url"
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Schema.org JSON-LD Type</label>
                  <select
                    value={page.schemaType || 'WebPage'}
                    onChange={(e) => handlePageFieldChange('schemaType', e.target.value)}
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="WebPage">WebPage (General)</option>
                    <option value="Service">Service</option>
                    <option value="Article">Article</option>
                    <option value="FAQPage">FAQPage</option>
                    <option value="AboutPage">AboutPage</option>
                    <option value="ContactPage">ContactPage</option>
                  </select>
                </div>
              </div>

              {/* Robots Directives */}
              <div className="flex gap-6 pt-3 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={!page.noIndex}
                    onChange={(e) => handlePageFieldChange('noIndex', !e.target.checked)}
                    className="rounded text-[#5C3BFF]"
                  />
                  Allow Indexing (index)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={!page.noFollow}
                    onChange={(e) => handlePageFieldChange('noFollow', !e.target.checked)}
                    className="rounded text-[#5C3BFF]"
                  />
                  Follow Links (follow)
                </label>
              </div>
            </div>

            {/* Social Share / OpenGraph */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Social Sharing (OpenGraph & Twitter)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Social Title</label>
                  <input
                    type="text"
                    value={page.ogTitle || ''}
                    onChange={(e) => handlePageFieldChange('ogTitle', e.target.value)}
                    placeholder="Defaults to Meta Title"
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Social Image URL</label>
                  <input
                    type="text"
                    value={page.ogImage || ''}
                    onChange={(e) => handlePageFieldChange('ogImage', e.target.value)}
                    placeholder="https://... 1200x630 px"
                    className="w-full text-xs p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. GENERAL PAGE SETTINGS TAB */}
        {/* ============================================================== */}
        {activeTab === 'SETTINGS' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Page Configuration</h2>
              <p className="text-xs text-gray-500 mt-1">Manage URL routing, publishing status, and layout template.</p>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL Path Slug *</label>
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
                <p className="text-xs text-gray-400 mt-1">
                  Changing a published slug will automatically create an active 301 redirect to avoid broken links.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Publishing Status</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Template Preset</label>
                  <select
                    value={page.template || 'DEFAULT'}
                    onChange={(e) => handlePageFieldChange('template', e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="DEFAULT">Default (Header + Footer)</option>
                    <option value="MINIMAL">Minimal (No Subnav)</option>
                    <option value="BLANK">Blank Landing Page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. REVISIONS & RESTORE TAB */}
        {/* ============================================================== */}
        {activeTab === 'REVISIONS' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Revision History</h2>
              <p className="text-xs text-gray-500 mt-1">
                Every save creates an automated snapshot. Restore any prior version with one click.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
              {revisions.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">No previous revisions recorded yet.</div>
              ) : (
                revisions.map((rev) => (
                  <div key={rev.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <div className="text-xs font-bold text-gray-800">{rev.note || 'Snapshot'}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Saved by {rev.author || 'Admin'} &bull; {new Date(rev.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestore(rev.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-[#5C3BFF] rounded-lg transition"
                    >
                      Restore This Snapshot
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
