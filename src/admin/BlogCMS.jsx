import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Edit, Trash2, User, Tag, Folder, 
  ExternalLink, Check, AlertCircle, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import {
  getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost,
  getAuthors, createAuthor, updateAuthor, deleteAuthor,
  getBlogCategories, createBlogCategory, updateBlogCategory, deleteBlogCategory,
  getBlogTags, createBlogTag, updateBlogTag, deleteBlogTag
} from '../api/admin';

export default function BlogCMS() {
  const [activeSubTab, setActiveSubTab] = useState('posts'); // posts | authors | categories | tags
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post Editor State
  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    categoryId: '',
    authorId: '',
    authorName: 'DigitalClik Editorial Team',
    status: 'PUBLISHED',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImage: '',
    tagIds: []
  });

  // Author Modal State
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [authorForm, setAuthorForm] = useState({ name: '', slug: '', role: '', bio: '', photo: '' });

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', metaTitle: '', metaDescription: '' });

  // Tag Modal State
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagForm, setTagForm] = useState({ name: '', slug: '', description: '' });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [resPosts, resAuthors, resCategories, resTags] = await Promise.all([
        getBlogPosts(),
        getAuthors(),
        getBlogCategories(),
        getBlogTags()
      ]);
      if (resPosts.success) setPosts(resPosts.data);
      if (resAuthors.success) setAuthors(resAuthors.data);
      if (resCategories.success) setCategories(resCategories.data);
      if (resTags.success) setTags(resTags.data);
    } catch (err) {
      console.error('Error fetching blog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openNewPost = () => {
    setEditingPost({ isNew: true });
    setPostForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      categoryId: categories[0]?.id || '',
      authorId: authors[0]?.id || '',
      authorName: authors[0]?.name || 'DigitalClik Editorial Team',
      status: 'PUBLISHED',
      featured: false,
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      ogImage: '',
      tagIds: []
    });
  };

  const openEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverImage: post.coverImage || '',
      categoryId: post.categoryId || '',
      authorId: post.authorId || '',
      authorName: post.authorName || 'DigitalClik Editorial Team',
      status: post.status || 'PUBLISHED',
      featured: Boolean(post.featured),
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      canonicalUrl: post.canonicalUrl || '',
      ogImage: post.ogImage || '',
      tagIds: post.tags ? post.tags.map(t => t.tagId) : []
    });
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    try {
      if (editingPost.isNew) {
        const res = await createBlogPost(postForm);
        if (res.success) {
          setEditingPost(null);
          loadAll();
        }
      } else {
        const res = await updateBlogPost(editingPost.id, postForm);
        if (res.success) {
          setEditingPost(null);
          loadAll();
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePost = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteBlogPost(id);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  // Author Handlers
  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await updateAuthor(editingAuthor.id, authorForm);
      } else {
        await createAuthor(authorForm);
      }
      setIsAuthorModalOpen(false);
      setEditingAuthor(null);
      setAuthorForm({ name: '', slug: '', role: '', bio: '', photo: '' });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAuthor = async (id, name) => {
    if (!confirm(`Delete author "${name}"?`)) return;
    try {
      await deleteAuthor(id);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  // Category Handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await createBlogCategory(categoryForm);
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', slug: '', description: '', metaTitle: '', metaDescription: '' });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteBlogCategory(id);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  // Tag Handlers
  const handleSaveTag = async (e) => {
    e.preventDefault();
    try {
      await createBlogTag(tagForm);
      setIsTagModalOpen(false);
      setTagForm({ name: '', slug: '', description: '' });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTag = async (id, name) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    try {
      await deleteBlogTag(id);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0A0A0A', margin: 0 }}>
            Blog & Thought Leadership
          </h1>
          <p style={{ color: '#737373', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Manage editorial articles, authors, taxonomy, and rich content distribution.
          </p>
        </div>

        {!editingPost && activeSubTab === 'posts' && (
          <button
            onClick={openNewPost}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Write Article
          </button>
        )}
      </div>

      {/* Editor Panel View */}
      {editingPost ? (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #F0F0F0', paddingBottom: '1rem' }}>
            <button
              onClick={() => setEditingPost(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontWeight: 600 }}
            >
              <ArrowLeft size={16} /> Back to Articles
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A0A0A' }}>
              {editingPost.isNew ? 'Create New Article' : `Editing: ${editingPost.title}`}
            </span>
          </div>

          <form onSubmit={handleSavePost} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Article Title *</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={e => {
                    const title = e.target.value;
                    setPostForm(prev => ({
                      ...prev,
                      title,
                      slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    }));
                  }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>URL Slug *</label>
                <input
                  type="text"
                  required
                  value={postForm.slug}
                  onChange={e => setPostForm(prev => ({ ...prev, slug: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Category</label>
                <select
                  value={postForm.categoryId}
                  onChange={e => setPostForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Author Profile</label>
                <select
                  value={postForm.authorId}
                  onChange={e => {
                    const author = authors.find(a => a.id === e.target.value);
                    setPostForm(prev => ({
                      ...prev,
                      authorId: e.target.value,
                      authorName: author ? author.name : prev.authorName
                    }));
                  }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                >
                  <option value="">Default Editorial Team</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.role || 'Writer'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Publication Status</label>
                <select
                  value={postForm.status}
                  onChange={e => setPostForm(prev => ({ ...prev, status: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', backgroundColor: '#FAFAFA', borderRadius: '6px', border: '1px solid #E5E5E5' }}>
                {tags.map(t => {
                  const isChecked = postForm.tagIds.includes(t.id);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => {
                        setPostForm(prev => ({
                          ...prev,
                          tagIds: isChecked ? prev.tagIds.filter(id => id !== t.id) : [...prev.tagIds, t.id]
                        }));
                      }}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '20px',
                        border: isChecked ? '1px solid var(--dc-purple)' : '1px solid #D4D4D4',
                        background: isChecked ? 'rgba(124, 58, 237, 0.1)' : '#FFFFFF',
                        color: isChecked ? 'var(--dc-purple)' : '#525252',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      #{t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Cover Image URL</label>
              <input
                type="text"
                value={postForm.coverImage}
                onChange={e => setPostForm(prev => ({ ...prev, coverImage: e.target.value }))}
                placeholder="https://..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Article Excerpt</label>
              <textarea
                rows={2}
                value={postForm.excerpt}
                onChange={e => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief 1-2 sentence synopsis..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Article Content (Markdown / HTML)</label>
              <textarea
                rows={12}
                required
                value={postForm.content}
                onChange={e => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4D4D4', fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>

            {/* SEO Controls */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#111827', marginBottom: '1rem' }}>
                Article SEO & Open Graph Settings
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Meta Title</label>
                  <input
                    type="text"
                    value={postForm.metaTitle}
                    onChange={e => setPostForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Defaults to article title"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Canonical URL</label>
                  <input
                    type="text"
                    value={postForm.canonicalUrl}
                    onChange={e => setPostForm(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                    placeholder="https://digitalclik.com/blog/..."
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Meta Description</label>
                <textarea
                  rows={2}
                  value={postForm.metaDescription}
                  onChange={e => setPostForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Recommended 120-160 characters"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                style={{ padding: '0.75rem 1.25rem', borderRadius: '6px', border: '1px solid #D4D4D4', background: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '0.75rem 1.75rem', borderRadius: '6px', border: 'none', background: '#0A0A0A', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
              >
                Save Article
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Sub Navigation Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #E5E5E5', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => setActiveSubTab('posts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'posts' ? '#0A0A0A' : 'none',
                color: activeSubTab === 'posts' ? '#FFFFFF' : '#737373',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <FileText size={15} /> Articles ({posts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('authors')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'authors' ? '#0A0A0A' : 'none',
                color: activeSubTab === 'authors' ? '#FFFFFF' : '#737373',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <User size={15} /> Authors ({authors.length})
            </button>
            <button
              onClick={() => setActiveSubTab('categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'categories' ? '#0A0A0A' : 'none',
                color: activeSubTab === 'categories' ? '#FFFFFF' : '#737373',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Folder size={15} /> Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveSubTab('tags')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: activeSubTab === 'tags' ? '#0A0A0A' : 'none',
                color: activeSubTab === 'tags' ? '#FFFFFF' : '#737373',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Tag size={15} /> Tags ({tags.length})
            </button>
          </div>

          {/* Sub Tab: Articles */}
          {activeSubTab === 'posts' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid #E5E5E5', color: '#737373', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Article</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Author</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, color: '#0A0A0A' }}>{p.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.2rem' }}>/blog/{p.slug}</div>
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{ backgroundColor: '#F3F4F6', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {p.category?.name || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1rem', color: '#525252' }}>
                        {p.author?.name || p.authorName}
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: p.status === 'PUBLISHED' ? '#DCFCE7' : '#F3F4F6',
                          color: p.status === 'PUBLISHED' ? '#166534' : '#6B7280'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => openEditPost(p)}
                            style={{ padding: '0.4rem 0.65rem', borderRadius: '4px', border: '1px solid #E5E5E5', background: '#FFFFFF', cursor: 'pointer' }}
                            title="Edit Article"
                          >
                            <Edit size={14} color="#525252" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(p.id, p.title)}
                            style={{ padding: '0.4rem 0.65rem', borderRadius: '4px', border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer' }}
                            title="Delete Article"
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>
                        No articles published yet. Click "Write Article" to publish your first post.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub Tab: Authors */}
          {activeSubTab === 'authors' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>Editorial Authors</div>
                <button
                  onClick={() => {
                    setEditingAuthor(null);
                    setAuthorForm({ name: '', slug: '', role: 'Senior Digital Strategist', bio: '', photo: '' });
                    setIsAuthorModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0A0A0A', color: '#FFFFFF', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add Author
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {authors.map(a => (
                  <div key={a.id} style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {a.photo ? <img src={a.photo} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="#9CA3AF" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0A0A0A' }}>{a.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#737373' }}>{a.role || 'Writer'} • {a._count?.posts || 0} posts</div>
                      </div>
                      <button
                        onClick={() => handleDeleteAuthor(a.id, a.name)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {a.bio && <p style={{ fontSize: '0.78rem', color: '#525252', margin: 0 }}>{a.bio}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Tab: Categories */}
          {activeSubTab === 'categories' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>Article Categories</div>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0A0A0A', color: '#FFFFFF', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {categories.map(c => (
                  <div key={c.id} style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0A0A0A' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#737373' }}>slug: {c.slug} • {c._count?.posts || 0} posts</div>
                      {c.description && <div style={{ fontSize: '0.78rem', color: '#525252', marginTop: '0.35rem' }}>{c.description}</div>}
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Tab: Tags */}
          {activeSubTab === 'tags' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>Article Tags</div>
                <button
                  onClick={() => setIsTagModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0A0A0A', color: '#FFFFFF', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add Tag
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {tags.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid #E5E5E5', backgroundColor: '#FAFAFA', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span>#{t.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>({t._count?.posts || 0})</span>
                    <button
                      onClick={() => handleDeleteTag(t.id, t.name)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Author Create Modal */}
      {isAuthorModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', width: '480px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Add Editorial Author</h3>
            <form onSubmit={handleSaveAuthor} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Name *</label>
                <input
                  type="text"
                  required
                  value={authorForm.name}
                  onChange={e => setAuthorForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Role / Designation</label>
                <input
                  type="text"
                  value={authorForm.role}
                  onChange={e => setAuthorForm(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Founder & Digital Director"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Photo URL</label>
                <input
                  type="text"
                  value={authorForm.photo}
                  onChange={e => setAuthorForm(prev => ({ ...prev, photo: e.target.value }))}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Bio</label>
                <textarea
                  rows={3}
                  value={authorForm.bio}
                  onChange={e => setAuthorForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Short author background..."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAuthorModalOpen(false)} style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #D4D4D4', background: '#FFFFFF', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: '#0A0A0A', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>Create Author</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Create Modal */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', width: '480px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Create Category</h3>
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #D4D4D4', background: '#FFFFFF', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: '#0A0A0A', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Create Modal */}
      {isTagModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', width: '420px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Create Article Tag</h3>
            <form onSubmit={handleSaveTag} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Tag Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEO, Nextjs, Growth"
                  value={tagForm.name}
                  onChange={e => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4D4D4' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsTagModalOpen(false)} style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #D4D4D4', background: '#FFFFFF', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: '#0A0A0A', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>Save Tag</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
