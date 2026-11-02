import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';

export default function RichTextEditor({ content, onChange, placeholder = 'Write content...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Underline,
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

  // Sync internal content if prop changes externally
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="p-4 border rounded text-gray-400 text-sm">Loading editor...</div>;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:border-[#5C3BFF] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded font-bold ${editor.isActive('bold') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded italic ${editor.isActive('italic') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded underline ${editor.isActive('underline') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Underline"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded line-through ${editor.isActive('strike') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Strikethrough"
        >
          S
        </button>

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Headings */}
        {[1, 2, 3, 4].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={`px-2 py-1 rounded font-semibold ${editor.isActive('heading', { level }) ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          >
            H{level}
          </button>
        ))}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 rounded ${editor.isActive('paragraph') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
        >
          P
        </button>

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Bullet List"
        >
          &bull; List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded ${editor.isActive('blockquote') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Quote"
        >
          &ldquo; Quote
        </button>

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Align Left"
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Align Center"
        >
          Center
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Align Right"
        >
          Right
        </button>

        <span className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Link */}
        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 rounded ${editor.isActive('link') ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200'}`}
          title="Add / Remove Link"
        >
          Link
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 min-h-[160px] prose prose-sm max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
