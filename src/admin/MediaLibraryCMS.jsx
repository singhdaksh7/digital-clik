import React, { useEffect, useState, useRef } from 'react';
import {
  getMediaItems,
  uploadMediaFile,
  updateMediaItem,
  deleteMediaItem,
  restoreMediaItem,
  getMediaReferences,
  getMediaCollections,
  replaceMediaEverywhere,
  bulkMediaAction
} from '../api/admin';
import {
  Upload, Trash2, Copy, Check, Image as ImageIcon, Video, FileText,
  Search, Filter, Grid, List, AlertTriangle, RefreshCw, Folder, Tag,
  ExternalLink, X, ArrowUpDown, ShieldAlert, CheckSquare, Square
} from 'lucide-react';

export default function MediaLibraryCMS() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [collections, setCollections] = useState([]);
  const [missingAltOnly, setMissingAltOnly] = useState(false);
  const [largeFilesOnly, setLargeFilesOnly] = useState(false);
  const [trashedOnly, setTrashedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Selection & Details
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [itemReferences, setItemReferences] = useState(null);
  const [loadingRefs, setLoadingRefs] = useState(false);

  // Edit Drawer state
  const [editTitle, setEditTitle] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editCollection, setEditCollection] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  // Replace modal
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceTargetUrl, setReplaceTargetUrl] = useState('');
  const [replaceLoading, setReplaceLoading] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Bulk actions
  const [bulkCollectionName, setBulkCollectionName] = useState('');
  const [bulkAltPrefix, setBulkAltPrefix] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
    loadCollections();
  }, [search, typeFilter, collectionFilter, missingAltOnly, largeFilesOnly, trashedOnly, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMediaItems({
        search,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        collection: collectionFilter || undefined,
        missingAlt: missingAltOnly ? 'true' : undefined,
        largeFiles: largeFilesOnly ? 'true' : undefined,
        trashed: trashedOnly ? 'true' : undefined,
        sortBy,
        sortOrder
      });
      if (res.success) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const res = await getMediaCollections();
      if (res.success) {
        setCollections(res.data);
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
  };

  const handleOpenItem = async (item) => {
    setActiveItem(item);
    setEditTitle(item.title || '');
    setEditAlt(item.alt || '');
    setEditCaption(item.caption || item.description || '');
    setEditCollection(item.collection || '');
    setLoadingRefs(true);
    try {
      const res = await getMediaReferences(item.id);
      if (res.success) {
        setItemReferences(res.data);
      }
    } catch (err) {
      console.error(err);
      setItemReferences(null);
    } finally {
      setLoadingRefs(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!activeItem) return;
    setSavingMeta(true);
    try {
      const res = await updateMediaItem(activeItem.id, {
        title: editTitle,
        alt: editAlt,
        caption: editCaption,
        description: editCaption,
        collection: editCollection || null
      });
      if (res.success) {
        setItems(prev => prev.map(m => m.id === activeItem.id ? res.data : m));
        setActiveItem(res.data);
        loadCollections();
        alert('Asset metadata saved successfully.');
      }
    } catch (err) {
      alert(err.message || 'Failed to update asset metadata');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadMediaFile(file, {
        collection: collectionFilter || undefined
      });
      if (res.success) {
        setItems(prev => [res.data, ...prev]);
        loadCollections();
        handleOpenItem(res.data);
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url, id) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!activeItem) return;
    setDeleting(true);
    try {
      const res = await deleteMediaItem(activeItem.id, {
        permanent: trashedOnly || forceDelete,
        force: forceDelete
      });
      if (res.success) {
        setItems(prev => prev.filter(m => m.id !== activeItem.id));
        setActiveItem(null);
        setShowDeleteModal(false);
        setForceDelete(false);
        loadCollections();
      }
    } catch (err) {
      alert(err.message || 'Delete failed: asset may be in active use.');
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await restoreMediaItem(id);
      if (res.success) {
        setItems(prev => prev.filter(m => m.id !== id));
        if (activeItem?.id === id) setActiveItem(null);
      }
    } catch (err) {
      alert(err.message || 'Restore failed');
    }
  };

  const handleReplaceEverywhere = async () => {
    if (!activeItem || !replaceTargetUrl) return;
    setReplaceLoading(true);
    try {
      const res = await replaceMediaEverywhere(activeItem.url, replaceTargetUrl);
      if (res.success) {
        alert(`Media replaced successfully in ${res.data?.totalUpdates || 0} locations.`);
        setShowReplaceModal(false);
        setReplaceTargetUrl('');
        // Reload references
        handleOpenItem(activeItem);
      }
    } catch (err) {
      alert(err.message || 'Failed to replace media');
    } finally {
      setReplaceLoading(false);
    }
  };

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(m => m.id));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkMoveCollection = async () => {
    if (!bulkCollectionName) return;
    try {
      await bulkMediaAction({ action: 'move_collection', ids: selectedIds, collection: bulkCollectionName });
      loadData();
      loadCollections();
      setSelectedIds([]);
      setBulkCollectionName('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkAltPrefix = async () => {
    if (!bulkAltPrefix) return;
    try {
      await bulkMediaAction({ action: 'set_alt_prefix', ids: selectedIds, altPrefix: bulkAltPrefix });
      loadData();
      setSelectedIds([]);
      setBulkAltPrefix('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} items? Assets referenced in active pages will be protected.`)) return;
    try {
      const res = await bulkMediaAction({ action: 'delete', ids: selectedIds });
      alert(`Deleted ${res.data?.deletedCount || 0} items. Skipped ${res.data?.skippedInUse || 0} items because they are in active use.`);
      loadData();
      setSelectedIds([]);
      loadCollections();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Media Library Pro</h1>
          <p className="text-sm text-neutral-400">
            Manage media assets, responsive WebP variants, safe deletions, and cross-site asset references.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,.pdf,.svg"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Upload size={16} />
            <span>{uploading ? 'Processing & Optimizing...' : 'Upload Media'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename, alt text, title..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600"
          >
            <option value="all">All File Types</option>
            <option value="image">Images (PNG, JPG, WebP)</option>
            <option value="svg">Vector Graphics (SVG)</option>
            <option value="video">Videos (MP4, WebM)</option>
            <option value="document">Documents (PDF)</option>
          </select>

          {/* Collection Filter */}
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600"
          >
            <option value="">All Collections ({items.length})</option>
            {collections.map(c => (
              <option key={c.collection} value={c.collection}>
                {c.collection} ({c.count})
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neutral-600"
            >
              <option value="createdAt">Date Uploaded</option>
              <option value="filename">Filename</option>
              <option value="size">File Size</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-neutral-800 rounded-lg bg-neutral-950 text-neutral-400 hover:text-white"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown size={16} />
            </button>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMissingAltOnly(!missingAltOnly)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                missingAltOnly ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              ⚠️ Missing Alt Text
            </button>
            <button
              onClick={() => setLargeFilesOnly(!largeFilesOnly)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                largeFilesOnly ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              📦 Large Files (&gt;1MB)
            </button>
            <button
              onClick={() => setTrashedOnly(!trashedOnly)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                trashedOnly ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              🗑️ Trash Bin
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500">{items.length} assets found</span>
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
                title="Grid View"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
                title="List View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 text-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-300">{selectedIds.length} item(s) selected</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-neutral-400 hover:text-white underline"
            >
              Deselect All
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="New collection name"
                value={bulkCollectionName}
                onChange={e => setBulkCollectionName(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
              />
              <button
                onClick={handleBulkMoveCollection}
                disabled={!bulkCollectionName}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-lg disabled:opacity-40"
              >
                Move
              </button>
            </div>

            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Alt prefix (e.g. DigitalClik - )"
                value={bulkAltPrefix}
                onChange={e => setBulkAltPrefix(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
              />
              <button
                onClick={handleBulkAltPrefix}
                disabled={!bulkAltPrefix}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-lg disabled:opacity-40"
              >
                Apply Alt
              </button>
            </div>

            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs rounded-lg"
            >
              <Trash2 size={13} />
              <span>Safe Bulk Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Media Grid / List Content */}
      {loading ? (
        <div className="py-24 text-center text-neutral-500">Loading media library...</div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-neutral-800 rounded-xl">
          <ImageIcon className="mx-auto text-neutral-600 mb-3" size={40} />
          <h3 className="text-white font-medium">No media assets found</h3>
          <p className="text-sm text-neutral-500 mt-1">Upload images, videos, SVGs or documents to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => {
            const isSelected = selectedIds.includes(item.id);
            const isMissingAlt = (!item.alt || item.alt.trim() === '') && item.mimeType?.startsWith('image/');
            const isLarge = item.size > 1024 * 1024;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item)}
                className={`group relative bg-neutral-900 border rounded-xl overflow-hidden cursor-pointer transition flex flex-col ${
                  activeItem?.id === item.id
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : isSelected
                    ? 'border-neutral-600'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Select Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectItem(item.id);
                  }}
                  className="absolute top-2 left-2 z-10 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/90"
                  style={{ opacity: isSelected ? 1 : undefined }}
                >
                  {isSelected ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} />}
                </button>

                {/* Badges */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                  {isMissingAlt && (
                    <span className="px-1.5 py-0.5 bg-amber-500/90 text-neutral-950 font-bold text-[10px] rounded shadow" title="Missing Alt Text">
                      ALT
                    </span>
                  )}
                  {isLarge && (
                    <span className="px-1.5 py-0.5 bg-red-500/90 text-white font-semibold text-[10px] rounded shadow" title="File > 1MB">
                      &gt;1MB
                    </span>
                  )}
                </div>

                {/* Thumbnail Preview */}
                <div className="aspect-square w-full bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-neutral-800/60 relative">
                  {item.mimeType?.startsWith('image/') ? (
                    <img
                      src={item.variants?.thumbnail || item.url}
                      alt={item.alt || item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  ) : item.mimeType?.startsWith('video/') ? (
                    <Video size={36} className="text-neutral-500" />
                  ) : (
                    <FileText size={36} className="text-neutral-500" />
                  )}
                </div>

                {/* Meta details */}
                <div className="p-2.5 flex-1 flex flex-col justify-between text-xs">
                  <div className="truncate font-medium text-white" title={item.filename}>
                    {item.title || item.filename}
                  </div>
                  <div className="flex items-center justify-between text-neutral-500 mt-1.5 text-[11px]">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{item.dimensions?.width ? `${item.dimensions.width}×${item.dimensions.height}` : item.mimeType?.split('/')[1]?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-xs uppercase text-neutral-400">
              <tr>
                <th className="p-3 w-10">
                  <button onClick={toggleSelectAll} className="text-neutral-400 hover:text-white">
                    {selectedIds.length === items.length && items.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="p-3">Asset</th>
                <th className="p-3">Collection</th>
                <th className="p-3">Dimensions</th>
                <th className="p-3">Size</th>
                <th className="p-3">Alt Text</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-xs">
              {items.map(item => {
                const isSelected = selectedIds.includes(item.id);
                const isMissingAlt = (!item.alt || item.alt.trim() === '') && item.mimeType?.startsWith('image/');

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenItem(item)}
                    className={`hover:bg-neutral-800/40 cursor-pointer ${activeItem?.id === item.id ? 'bg-neutral-800/70' : ''}`}
                  >
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleSelectItem(item.id)} className="text-neutral-400 hover:text-white">
                        {isSelected ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-neutral-950 overflow-hidden shrink-0 flex items-center justify-center border border-neutral-800">
                        {item.mimeType?.startsWith('image/') ? (
                          <img src={item.variants?.thumbnail || item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={18} className="text-neutral-500" />
                        )}
                      </div>
                      <div className="truncate max-w-[200px]">
                        <div className="font-medium text-white truncate">{item.title || item.filename}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{item.filename}</div>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-400">{item.collection || '—'}</td>
                    <td className="p-3 text-neutral-400">
                      {item.dimensions?.width ? `${item.dimensions.width}×${item.dimensions.height}` : '—'}
                    </td>
                    <td className="p-3 text-neutral-400">{formatFileSize(item.size)}</td>
                    <td className="p-3">
                      {isMissingAlt ? (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[11px] font-semibold">Missing</span>
                      ) : (
                        <span className="text-neutral-400 truncate max-w-[150px] inline-block">{item.alt || '—'}</span>
                      )}
                    </td>
                    <td className="p-3 text-neutral-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleCopyUrl(item.url, item.id)}
                        className="p-1.5 hover:text-white text-neutral-400"
                        title="Copy URL"
                      >
                        {copiedId === item.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Detail Drawer (Sliding Side Panel) */}
      {activeItem && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-neutral-950 border-l border-neutral-800 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Asset Details</h2>
            <button
              onClick={() => setActiveItem(null)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Visual Preview */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-col items-center justify-center">
              {activeItem.mimeType?.startsWith('image/') ? (
                <img
                  src={activeItem.url}
                  alt={activeItem.alt || activeItem.filename}
                  className="max-h-56 max-w-full object-contain rounded"
                />
              ) : activeItem.mimeType?.startsWith('video/') ? (
                <video src={activeItem.url} controls className="max-h-56 max-w-full rounded" />
              ) : (
                <div className="py-12 text-center text-neutral-400">
                  <FileText size={48} className="mx-auto mb-2 text-neutral-500" />
                  <p>{activeItem.filename}</p>
                </div>
              )}

              {/* URL and Copy */}
              <div className="w-full mt-3 flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-xs">
                <input
                  type="text"
                  readOnly
                  value={activeItem.url}
                  className="bg-transparent text-neutral-400 flex-1 truncate px-1 focus:outline-none"
                />
                <button
                  onClick={() => handleCopyUrl(activeItem.url, activeItem.id)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs transition"
                >
                  {copiedId === activeItem.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedId === activeItem.id ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={activeItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-neutral-400 hover:text-white"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-900/60 border border-neutral-800 rounded-xl p-3">
              <div>
                <span className="text-neutral-500 block">File Size</span>
                <span className="text-white font-medium">{formatFileSize(activeItem.size)}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Dimensions</span>
                <span className="text-white font-medium">
                  {activeItem.dimensions?.width ? `${activeItem.dimensions.width} × ${activeItem.dimensions.height} px` : '—'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">MIME Type</span>
                <span className="text-white font-medium">{activeItem.mimeType}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Optimized WebP</span>
                <span className="text-emerald-400 font-medium">
                  {activeItem.variants?.webp ? 'Generated' : 'Original only'}
                </span>
              </div>
            </div>

            {/* Metadata Editor */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Metadata & SEO</h3>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Descriptive title"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-400">Alt Text (Accessibility & SEO)</label>
                  {!editAlt && activeItem.mimeType?.startsWith('image/') && (
                    <span className="text-[11px] text-amber-400">Required for SEO</span>
                  )}
                </div>
                <input
                  type="text"
                  value={editAlt}
                  onChange={e => setEditAlt(e.target.value)}
                  placeholder="Concise description of the image content"
                  className={`w-full bg-neutral-900 border rounded-lg px-3 py-2 text-sm text-white ${
                    !editAlt && activeItem.mimeType?.startsWith('image/') ? 'border-amber-500/50' : 'border-neutral-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Collection</label>
                <input
                  type="text"
                  value={editCollection}
                  onChange={e => setEditCollection(e.target.value)}
                  placeholder="e.g. Hero, Services, Blog, Logos"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Caption / Notes</label>
                <textarea
                  rows={2}
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  placeholder="Optional caption or internal usage note"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <button
                onClick={handleSaveMetadata}
                disabled={savingMeta}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition"
              >
                {savingMeta ? 'Saving...' : 'Save Metadata'}
              </button>
            </div>

            {/* Cross-Site Usage References */}
            <div className="space-y-3 pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Site Usage Scanner</h3>
                {loadingRefs && <RefreshCw size={13} className="animate-spin text-neutral-500" />}
              </div>

              {itemReferences && (
                <div>
                  {itemReferences.totalReferences === 0 ? (
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg text-xs text-neutral-400">
                      ✅ Not currently referenced in any published pages, blogs, or projects. Safe to delete.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        <div>
                          <strong>Active in {itemReferences.totalReferences} location(s).</strong> Deleting will cause broken images on the website unless replaced.
                        </div>
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs">
                        {itemReferences.pages?.map((p, idx) => (
                          <div key={idx} className="bg-neutral-900 p-2 rounded border border-neutral-800 flex justify-between">
                            <span className="text-white font-medium">Page: {p.pageTitle}</span>
                            <span className="text-neutral-500">{p.blockType || 'Featured'}</span>
                          </div>
                        ))}
                        {itemReferences.blogs?.map((b, idx) => (
                          <div key={idx} className="bg-neutral-900 p-2 rounded border border-neutral-800 flex justify-between">
                            <span className="text-white font-medium">Blog: {b.title}</span>
                            <span className="text-neutral-500">Cover</span>
                          </div>
                        ))}
                        {itemReferences.projects?.map((pr, idx) => (
                          <div key={idx} className="bg-neutral-900 p-2 rounded border border-neutral-800 flex justify-between">
                            <span className="text-white font-medium">Project: {pr.title}</span>
                            <span className="text-neutral-500">Asset</span>
                          </div>
                        ))}
                        {itemReferences.globalBlocks?.map((gb, idx) => (
                          <div key={idx} className="bg-neutral-900 p-2 rounded border border-neutral-800 flex justify-between">
                            <span className="text-white font-medium">Global Block: {gb.name}</span>
                            <span className="text-neutral-500">Reusable</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions: Replace Everywhere & Safe Delete */}
            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <button
                onClick={() => setShowReplaceModal(true)}
                className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <RefreshCw size={14} />
                <span>Replace Everywhere Across Site</span>
              </button>

              <div className="flex gap-2">
                {trashedOnly ? (
                  <button
                    onClick={() => handleRestore(activeItem.id)}
                    className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium"
                  >
                    Restore from Trash
                  </button>
                ) : null}

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>{trashedOnly ? 'Permanent Delete' : 'Delete Asset'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replace Everywhere Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Replace Media Everywhere</h3>
            <p className="text-xs text-neutral-400">
              This will search every Page Block, Blog Post, Project, and Global Block currently using this asset URL and update them to the new URL automatically.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-neutral-400">Current URL</label>
              <input
                type="text"
                readOnly
                value={activeItem?.url}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white">Replacement Media URL</label>
              <input
                type="text"
                placeholder="https://... or /uploads/..."
                value={replaceTargetUrl}
                onChange={e => setReplaceTargetUrl(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReplaceModal(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReplaceEverywhere}
                disabled={!replaceTargetUrl || replaceLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
              >
                {replaceLoading ? 'Replacing...' : 'Confirm Replace'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert size={24} />
              <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
            </div>

            {itemReferences && itemReferences.totalReferences > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                  ⚠️ <strong>Warning:</strong> This asset is currently used in {itemReferences.totalReferences} location(s) on your live site! Deleting it will result in broken media.
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    id="forceDel"
                    checked={forceDelete}
                    onChange={e => setForceDelete(e.target.checked)}
                    className="rounded border-neutral-700"
                  />
                  <label htmlFor="forceDel">I understand the consequences and wish to force delete.</label>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Are you sure you want to delete <strong className="text-white">{activeItem?.filename}</strong>?
                {!trashedOnly && ' It will be moved to the Trash bin where it can be restored.'}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setForceDelete(false);
                }}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting || (itemReferences?.totalReferences > 0 && !forceDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
