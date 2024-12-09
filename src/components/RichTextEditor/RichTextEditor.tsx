"use client";
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import ToolBar from "./ToolBar";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ImageResize from "tiptap-extension-resize-image";
import Underline from "@tiptap/extension-underline";
import TextColor from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import FontFamily from "@tiptap/extension-font-family";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useEffect } from "react";
import TextStyle from "@tiptap/extension-text-style"
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Text from '@tiptap/extension-text'
import { Button } from "../ui/button";

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure(),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Heading.configure({
                levels: [1, 2, 3],
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: "list-decimal ml-3",
                },
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: "list-disc ml-3",
                },
            }),
            Text,
            Highlight,
            Underline,
            TextColor,
            FontFamily,
            TextStyle,
            HorizontalRule,
            Link.configure({
                openOnClick: true,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: "border-collapse border border-gray-400",
                },
            }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: {
                    class: "border border-gray-400  text-center",

                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: "bg-gray-200 font-bold border border-gray-400 ",
                },
            }),
            Image,
            ImageResize,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose xl:prose mx-auto focus:outline-none min-h-[156px] border rounded-md bg-slate-50 py-2 px-3 break-words overflow-wrap-anywhere leading-normal !my-0 ",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div>
            <ToolBar editor={editor} />
            {editor && (
                <BubbleMenu
                    className="bg-white border border-gray-200 rounded-lg shadow-md flex p-1"
                    tippyOptions={{ duration: 100 }}
                    editor={editor}
                >
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`hover:bg-gray-200 p-2 rounded-md ${editor.isActive('bold') ? 'bg-purple-500 text-white' : 'bg-white text-black'
                            }`}
                    >
                        Bold
                    </Button>
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`hover:bg-gray-200 p-2 rounded-md ${editor.isActive('italic') ? 'bg-purple-500 text-white' : 'bg-white text-black'
                            }`}
                    >
                        Italic
                    </Button>
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`hover:bg-gray-200 p-2 rounded-md ${editor.isActive('strike') ? 'bg-purple-500 text-white' : 'bg-white text-black'
                            }`}
                    >
                        Strike
                    </Button>
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().setColor('#000000').run()}
                        className={`hover:bg-gray-200 p-2 rounded-md ${editor.isActive('textStyle', { color: '#000000' }) ? 'bg-purple-500 text-white' : 'bg-white text-black'}`}
                    >
                        <input 
                            type="color" 
                            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                            className="w-6 h-6"
                        />
                    </Button>
                </BubbleMenu>
            )}

            {editor && (
                <FloatingMenu
                    className="bg-gray-100 flex p-1 rounded-md"
                    tippyOptions={{ duration: 100 }}
                    editor={editor}
                >
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`hover:bg-gray-200 p-2 rounded-md ${editor.isActive('heading', { level: 1 }) ? 'bg-white text-purple-500' : 'bg-gray-100 text-black'
                            }`}
                    >
                        H1
                    </Button>
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`hover:bg-gray-200 p-2 rounded-md ${editor.isActive('heading', { level: 2 }) ? 'bg-white text-purple-500' : 'bg-gray-100 text-black'
                            }`}
                    >
                        H2
                    </Button>
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`hover:bg-gray-200 p-2 rounded-md ${editor.isActive('bulletList') ? 'bg-white text-purple-500' : 'bg-gray-100 text-black'
                            }`}
                    >
                        Bullet list
                    </Button>
                </FloatingMenu>
            )}

            <EditorContent editor={editor} className="!p-0" />

        </div>
    );
}
