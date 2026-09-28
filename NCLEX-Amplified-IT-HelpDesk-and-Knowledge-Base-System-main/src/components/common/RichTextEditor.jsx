import React, { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Eye,
  EyeOff,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Columns3,
  Pilcrow,
  Plus,
  Rows3,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon
} from 'lucide-react';
import { TableKit } from '@tiptap/extension-table';
import { RichTextContent, RICH_TEXT_FONT_SIZES, toSafeRichHtml } from './RichTextContent';

const FontSize = Mark.create({
  name: 'fontSize',
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => {
          const size = element.getAttribute('data-font-size');
          return RICH_TEXT_FONT_SIZES.includes(size) ? size : null;
        },
        renderHTML: ({ size }) => size ? { 'data-font-size': size } : {}
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-font-size]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setRichTextFontSize: (size) => ({ commands }) =>
        RICH_TEXT_FONT_SIZES.includes(size)
          ? commands.setMark(this.name, { size })
          : false
    };
  }
});

const extensions = [
  StarterKit.configure({ heading: { levels: [2, 3] }, link: false, underline: false }),
  TableKit.configure({ table: { resizable: false } }),
  Underline,
  FontSize,
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    protocols: ['mailto', 'tel'],
    HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' }
  })
];

function ToolbarButton({ editor, title, active, disabled = false, children, onClick }) {
  return (
    <button
      type="button"
      className={`rich-text-tool ${active ? 'is-active' : ''}`}
      title={title}
      aria-label={title}
      aria-pressed={active || false}
      disabled={!editor || disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, label, placeholder }) {
  const [preview, setPreview] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState('');
  const editor = useEditor({
    extensions,
    content: toSafeRichHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-text-surface',
        'aria-label': label,
        'data-placeholder': placeholder || ''
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
      setSelectedFontSize(currentEditor.getAttributes('fontSize').size || '');
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      setSelectedFontSize(currentEditor.getAttributes('fontSize').size || '');
    }
  });

  const setLink = () => {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const href = window.prompt('Enter a web address or email link');
    if (href === null || !href.trim()) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  };

  return (
    <div className={`rich-text-editor ${preview ? 'is-previewing' : ''}`}>
      <div className="rich-text-toolbar" role="toolbar" aria-label={`${label} formatting`}>
        <ToolbarButton editor={editor} title="Paragraph" active={editor?.isActive('paragraph')} onClick={() => editor?.chain().focus().setParagraph().run()}>
          <Pilcrow size={16} />
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Heading 2" active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Heading 3" active={editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </ToolbarButton>
        <span className="rich-text-tool-divider" aria-hidden="true" />
        <ToolbarButton editor={editor} title="Bold" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Italic" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Underline" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <label className="rich-text-size-control">
          <span className="sr-only">Font size</span>
          <select
            aria-label="Font size"
            value={selectedFontSize}
            disabled={!editor}
            onChange={(event) => {
              const size = event.target.value;
              if (size) {
                editor?.chain().focus().setRichTextFontSize(size).run();
                setSelectedFontSize(size);
              } else {
                editor?.chain().focus().unsetMark('fontSize').run();
                setSelectedFontSize('');
              }
            }}
          >
            <option value="">Size</option>
            {RICH_TEXT_FONT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <span className="rich-text-tool-divider" aria-hidden="true" />
        <ToolbarButton editor={editor} title="Bulleted list" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Numbered list" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton editor={editor} title={editor?.isActive('link') ? 'Remove link' : 'Insert link'} active={editor?.isActive('link')} onClick={setLink}>
          <Link2 size={16} />
        </ToolbarButton>
        <span className="rich-text-tool-divider" aria-hidden="true" />
        <ToolbarButton editor={editor} title="Insert table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <TableIcon size={16} />
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Add row after current row" disabled={!editor?.isActive('table')} onClick={() => editor?.chain().focus().addRowAfter().run()}>
          <span className="rich-text-composite-icon"><Rows3 size={15} /><Plus size={11} /></span>
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Delete current row" disabled={!editor?.isActive('table')} onClick={() => editor?.chain().focus().deleteRow().run()}>
          <span className="rich-text-composite-icon"><Rows3 size={15} /><Minus size={11} /></span>
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Add column after current column" disabled={!editor?.isActive('table')} onClick={() => editor?.chain().focus().addColumnAfter().run()}>
          <span className="rich-text-composite-icon"><Columns3 size={15} /><Plus size={11} /></span>
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Delete current column" disabled={!editor?.isActive('table')} onClick={() => editor?.chain().focus().deleteColumn().run()}>
          <span className="rich-text-composite-icon"><Columns3 size={15} /><Minus size={11} /></span>
        </ToolbarButton>
        <ToolbarButton editor={editor} title="Delete table" disabled={!editor?.isActive('table')} onClick={() => editor?.chain().focus().deleteTable().run()}>
          <Trash2 size={16} />
        </ToolbarButton>
        <span className="rich-text-tool-spacer" />
        <button
          type="button"
          className="button button-sm button-secondary rich-text-preview-toggle"
          aria-pressed={preview}
          onClick={() => setPreview((current) => !current)}
        >
          {preview ? <EyeOff size={15} /> : <Eye size={15} />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <RichTextContent className="rich-text-preview-content" content={editor?.getHTML() || value} />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}