"use client";
import { AlignHorizontalSpaceAround, ChevronDown, List } from "lucide-react";
import { Toggle } from "../ui/toggle";
import { Editor } from "@tiptap/react";
import {
    Heading1,
    Heading2,
    Heading3,
    Code,
    Bold,
    Italic,
    Strikethrough,
    AlignCenter,
    AlignLeft,
    AlignRight,
    Highlighter,
    Upload,
    Underline as UnderlineIcon,
    Link as LinkIcon,
    Minus,
    Paintbrush,
    Table as TableIcon,
} from "lucide-react";
import { ListOrdered } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import { TableOperationsBar } from "./table/TableOperationBar";
import { TableModal } from "./table/TableModal";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";


const fontFamilies = [
    { name: "Inter", value: "Inter" },
    { name: "Comic Sans", value: "Comic Sans MS, Comic Sans" },
    { name: "Serif", value: "serif" },
    { name: "Monospace", value: "monospace" },
    { name: "Cursive", value: "cursive" },
    { name: "CSS Variable", value: "var(--title-font-family)" },
    { name: "Exo 2", value: '"Exo 2"' }
];

export default function ToolBar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;
    const [showTableOperations, setShowTableOperations] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);

    const [dialogState, setDialogState] = useState<{ open: boolean, type: "color-picker" | null }>({ open: false, type: null })
    const [values, setValues] = useState({ textColor: "" })

    function uploadImage(editor: Editor) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e) => {
            if (!e.target) return;
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (dataUrl) {
                    editor.chain().focus().setImage({ src: dataUrl }).run();
                }
            };
            reader.readAsDataURL(file);
        };

        input.click();
    }

    const Options = [
        {
            icon: <ChevronDown className="size-4" />,
            onClick: () => { }, // This will be handled by the Select component
            pressed: false,
            custom: (
                <Select
                    onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
                    value={editor.getAttributes('textStyle').fontFamily}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Font Family" />
                    </SelectTrigger>
                    <SelectContent>
                        {fontFamilies.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                                {font.name}
                            </SelectItem>
                        ))}
                        <SelectItem value="default">Default</SelectItem>
                    </SelectContent>
                </Select>
            ),
        },
        {
            icon: <Heading1 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            pressed: editor.isActive("heading", { level: 1 }),
        },
        {
            icon: <Heading2 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            pressed: editor.isActive("heading", { level: 2 }),
        },
        {
            icon: <Heading3 className="size-4" />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            pressed: editor.isActive("heading", { level: 3 }),
        },
        {
            icon: <Bold className="size-4" />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            pressed: editor.isActive("bold"),
        },
        {
            icon: <Italic className="size-4" />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            pressed: editor.isActive("italic"),
        },
        {
            icon: <UnderlineIcon className="size-4" />,
            onClick: () => editor.chain().focus().toggleUnderline().run(),
            pressed: editor.isActive("underline"),
        },
        {
            icon: <Strikethrough className="size-4" />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            pressed: editor.isActive("strike"),
        },
        {
            icon: <AlignLeft className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign("left").run(),
            pressed: editor.isActive({ textAlign: "left" }),
        },
        {
            icon: <AlignCenter className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign("center").run(),
            pressed: editor.isActive({ textAlign: "center" }),
        },
        {
            icon: <AlignRight className="size-4" />,
            onClick: () => editor.chain().focus().setTextAlign("right").run(),
            pressed: editor.isActive({ textAlign: "right" }),
        },
        {
            icon: <List className="size-4" />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            pressed: editor.isActive("bulletList"),
        },
        {
            icon: <ListOrdered className="size-4" />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            pressed: editor.isActive("orderedList"),
        },
        {
            icon: <Minus className="size-4" />,
            onClick: () => editor.chain().focus().setHorizontalRule().run(),
            pressed: false,
        },
        {
            icon: <Code className="size-4" />,
            onClick: () => editor.chain().focus().toggleCodeBlock().run(),
            pressed: editor.isActive("codeBlock"),
        },
        {
            icon: <Highlighter className="size-4" />,
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            pressed: editor.isActive("highlight"),
        },
        {
            icon: <Upload className="size-4" />,
            onClick: () => uploadImage(editor),
            pressed: false,
        },
        {
            icon: <LinkIcon className="size-4" />,
            onClick: () => {
                const url = prompt("Enter URL");
                if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                }
            },
            pressed: editor.isActive("link"),
        },
        {
            icon: <Paintbrush className="size-4" />,
            onClick: () => {
                setDialogState({ open: true, type: "color-picker" })
            },
            pressed: false,
        },
        {
            icon: <TableIcon className="size-4" />,
            onClick: () => {
                setShowTableModal(true);
            },
            pressed: false,
        },
        {
            icon: <AlignHorizontalSpaceAround className="size-4" />,
            onClick: () => {
                if (!editor) return;

                // Define the wrapper div with styles
                const parser = new DOMParser();
                const wrapper = `
        <div style="max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    line-height: 1.6;">
            ${editor.getHTML()}
        </div>
    `;

                const doc = parser.parseFromString(wrapper, 'text/html');
                const content = doc.body.firstElementChild;
                if (content) {
                    editor.commands.setContent(content.outerHTML);
                }
            },
            pressed: false,
            tooltip: "Align whole content in center",
        },

    ];

    return (
        <div className="border rounded-md p-1.5 mb-1 bg-slate-50 space-x-1 sticky top-10 z-50">
            {Options.map((option, i) => option.custom ? <div key={i} className="inline-block">{option.custom}</div> :
                <Toggle
                    key={i}
                    size="sm"
                    pressed={option.pressed}
                    onPressedChange={option.onClick}
                >
                    {option.icon}
                </Toggle>

            )}
            {showTableModal && (
                <TableModal
                    onClose={() => setShowTableModal(false)}
                    onInsert={(rows, cols) => {
                        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                        setShowTableOperations(true);
                    }}
                />
            )}
            {showTableOperations && <TableOperationsBar editor={editor} />}

            <Dialog open={dialogState.open} onOpenChange={() => {
                setDialogState({ open: false, type: null })
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Color</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-3">

                        <Label>Select Color</Label>
                        <Input type="color" onChange={(e) => setValues(prev => ({ ...prev, textColor: e.target.value }))} className="w-20" />
                    </div>
                    <DialogFooter className="content-end">
                        <Button onClick={() => {
                            if (values.textColor) {
                                editor.chain().focus().setColor(values.textColor).run();
                            }
                            setDialogState({ open: false, type: null })
                        }}>Continue</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
