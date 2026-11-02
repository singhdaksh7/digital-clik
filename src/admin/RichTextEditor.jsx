import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Highlight } from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

export default function RichTextEditor({ content, onChange, placeholder = 'Write content...' }) {
  const [internalLinkModal, setInternalLinkModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#5C3BFF] underline cursor-pointer'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  React.useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const searchInternal = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/search-content?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('dc_admin_token') || ''}` }
      });
      const data = await res.json();
      if (data.success) {
        const combined = [
          ...(data.data.pages || []).map((p) => ({ title: p.title, url: `/${p.slug}`, type: 'Page' })),
          ...(data.data.services || []).map((s) => ({ title: s.title, url: `/services/${s.slug}`, type: 'Service' })),
          ...(data.data.projects || []).map((p) => ({ title: p.title, url: `/work/${p.slug}`, type: 'Project' }))
        ];
        setSearchResults(combined);
      }
    } catch {}
  };

  const applyInternalLink = (url) => {
    if (editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setInternalLinkModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (!editor) {
    return <div className="p-4 border rounded text-gray-400 text-sm">Loading rich editor...</div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:border-[#5C3BFF] transition-colors relative">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-700">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
          title="Redo"
        >
          ↷
        </button>

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Headings */}
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={`px-1.5 py-1 rounded font-semibold text-[11px] ${
              editor.isActive('heading', { level }) ? 'bg-purple-100 text-purple-700 font-bold' : 'hover:bg-gray-200'
            }`}
          >
            H{level}
          </button>
        ))}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 rounded text-[11px] ${
            editor.isActive('paragraph') ? 'bg-purple-100 text-purple-700 font-bold' : 'hover:bg-gray-200'
          }`}
        >
          P
        </button>

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded font-bold ${editor.isActive('bold') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded italic ${editor.isActive('italic') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded underline ${editor.isActive('underline') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded line-through ${editor.isActive('strike') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          S
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`px-2 py-1 rounded text-[10px] ${editor.isActive('subscript') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          X₂
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`px-2 py-1 rounded text-[10px] ${editor.isActive('superscript') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          X²
        </button>

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          &bull; List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded ${editor.isActive('blockquote') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          &ldquo; Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          ― Divider
        </button>

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Alignment */}
        {['left', 'center', 'right', 'justify'].map((align) => (
          <button
            key={align}
            type="button"
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
            className={`px-1.5 py-1 rounded capitalize text-[11px] ${
              editor.isActive({ textAlign: align }) ? 'bg-purple-100 text-purple-700 font-bold' : 'hover:bg-gray-200'
            }`}
          >
            {align}
          </button>
        ))}

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Link & Internal Link Search */}
        <button
          type="button"
          onClick={() => setInternalLinkModal(true)}
          className={`px-2 py-1 rounded font-medium ${
            editor.isActive('link') ? 'bg-purple-100 text-purple-700' : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
        >
          🔗 Link / Internal Search
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="px-2 py-1 rounded text-red-600 hover:bg-red-50 text-[11px]"
          >
            Remove Link
          </button>
        )}
      </div>

      {/* Internal Content Search Modal */}
      {internalLinkModal && (
        <div className="absolute top-12 left-4 z-50 bg-white border border-gray-300 rounded-xl shadow-2xl p-4 w-80">
          <div className="flex items-center justify-between pb-2 mb-2 border-b">
            <span className="text-xs font-bold text-gray-800">Insert Link</span>
            <button
              onClick={() => setInternalLinkModal(false)}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="Search pages, services, work..."
            value={searchQuery}
            onChange={(e) => searchInternal(e.target.value)}
            className="w-full text-xs p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:border-[#5C3BFF]"
          />

          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyInternalLink(item.url)}
                className="w-full text-left p-1.5 hover:bg-purple-50 text-xs flex justify-between items-center group"
              >
                <span className="font-medium text-gray-800 truncate">{item.title}</span>
                <span className="text-[10px] text-gray-400 font-mono ml-2">{item.type}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t text-[11px]">
            <span className="text-gray-500">Or type custom URL:</span>
            <div className="flex gap-1 mt-1">
              <input
                type="text"
                id="custom-external-url"
                placeholder="https://..."
                className="flex-1 text-xs p-1 border rounded"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('custom-external-url');
                  if (input && input.value) applyInternalLink(input.value);
                }}
                className="px-2 py-1 bg-[#5C3BFF] text-white rounded text-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="p-4 min-h-[180px] prose prose-sm max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
