"use client"
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { mergeAttributes } from '@tiptap/core';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Code,
    Heading3
} from 'lucide-react';

// Custom resizable image extension
const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                renderHTML: attributes => {
                    if (!attributes.width) {
                        return {};
                    }
                    return {
                        width: attributes.width,
                    };
                },
            },
            height: {
                default: null,
                renderHTML: attributes => {
                    if (!attributes.height) {
                        return {};
                    }
                    return {
                        height: attributes.height,
                    };
                },
            },
        };
    },
    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
            style: 'cursor: pointer; max-width: 100%; height: auto;'
        })];
    },
});

const MenuBar = ({ editor }: any) => {
    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event: any) => {
                    const base64 = event.target.result;
                    editor.chain().focus().setImage({ src: base64 }).run();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    return (
        <div className="border-b border-gray-300 p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-lg">
            {/* Text Formatting */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-300' : ''
                    }`}
                title="Bold"
                type="button"
            >
                <Bold size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-300' : ''
                    }`}
                title="Italic"
                type="button"
            >
                <Italic size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('underline') ? 'bg-gray-300' : ''
                    }`}
                title="Underline"
                type="button"
            >
                <UnderlineIcon size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Headings */}
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
                    }`}
                title="Heading 1"
                type="button"
            >
                <Heading1 size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
                    }`}
                title="Heading 2"
                type="button"
            >
                <Heading2 size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
                    }`}
                title="Heading 3"
                type="button"
            >
                <Heading3 size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Lists */}
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-300' : ''
                    }`}
                title="Bullet List"
                type="button"
            >
                <List size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-300' : ''
                    }`}
                title="Numbered List"
                type="button"
            >
                <ListOrdered size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Alignment */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
                    }`}
                title="Align Left"
                type="button"
            >
                <AlignLeft size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
                    }`}
                title="Align Center"
                type="button"
            >
                <AlignCenter size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
                    }`}
                title="Align Right"
                type="button"
            >
                <AlignRight size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Quote & Code */}
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-300' : ''
                    }`}
                title="Quote"
                type="button"
            >
                <Quote size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('codeBlock') ? 'bg-gray-300' : ''
                    }`}
                title="Code Block"
                type="button"
            >
                <Code size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Link & Image */}
            <button
                onClick={addLink}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('link') ? 'bg-gray-300' : ''
                    }`}
                title="Add Link"
                type="button"
            >
                <LinkIcon size={18} />
            </button>

            <button
                onClick={addImage}
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                title="Add Image"
                type="button"
            >
                <ImageIcon size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Undo & Redo */}
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
                type="button"
            >
                <Undo size={18} />
            </button>

            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
                type="button"
            >
                <Redo size={18} />
            </button>
        </div>
    );
};

const TipTapEditor = ({ content, onChange, error }: any) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            ResizableImage.configure({
                HTMLAttributes: {
                    class: 'rounded-lg',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: content,
        onUpdate: ({ editor }: any) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
            },
        },
    });

    // Add click handler for image resizing
    React.useEffect(() => {
        if (!editor) return;

        const handleImageClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                const currentWidth = target.offsetWidth;
                const newWidth = window.prompt(`Enter new width in pixels (current: ${currentWidth}px):`, currentWidth.toString());

                if (newWidth && !isNaN(Number(newWidth))) {
                    // Find the image node and update it
                    const { state } = editor;
                    const pos = editor.view.posAtDOM(target, 0);

                    editor.chain()
                        .setNodeSelection(pos)
                        .updateAttributes('image', { width: `${newWidth}px` })
                        .run();
                }
            }
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener('click', handleImageClick);

        return () => {
            editorElement.removeEventListener('click', handleImageClick);
        };
    }, [editor]);

    return (
        <div className={`border rounded-lg ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style>{`
                .ProseMirror img {
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: border-color 0.2s;
                }
                .ProseMirror img:hover {
                    border-color: #3b82f6;
                }
            `}</style>
        </div>
    );
};

export default TipTapEditor;