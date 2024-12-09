import React from 'react';
import { Editor } from '@tiptap/react';
import { Toggle } from "@/components/ui/toggle";
import { TableIcon as TableRow, TableIcon as TableHeader, TableIcon as TableCell, TableIcon as TableFooter, Rows2Icon as RowSpanFull, FlagIcon as ColSpanFull, Trash2 } from 'lucide-react';

interface TableOperationsBarProps {
    editor: Editor;
}

export function TableOperationsBar({ editor }: TableOperationsBarProps) {
    const tableOperations = [
        {
            icon: <TableRow className="size-4" />,
            onClick: () => editor.chain().focus().addRowAfter().run(),
            tooltip: "Add row",
        },
        {
            icon: <TableHeader className="size-4" />,
            onClick: () => editor.chain().focus().addColumnAfter().run(),
            tooltip: "Add column",
        },
        {
            icon: <TableCell className="size-4" />,
            onClick: () => editor.chain().focus().mergeCells().run(),
            tooltip: "Merge cells",
        },
        {
            icon: <TableFooter className="size-4" />,
            onClick: () => editor.chain().focus().splitCell().run(),
            tooltip: "Split cell",
        },
        {
            icon: <RowSpanFull className="size-4" />,
            onClick: () => editor.chain().focus().deleteRow().run(),
            tooltip: "Delete row",
        },
        {
            icon: <ColSpanFull className="size-4" />,
            onClick: () => editor.chain().focus().deleteColumn().run(),
            tooltip: "Delete column",
        },
        {
            icon: <Trash2 className="size-4" />,
            onClick: () => editor.chain().focus().deleteTable().run(),
            tooltip: "Delete table",
        },
    ];

    return (
        <div className="border rounded-md p-1.5 mt-1 bg-slate-50 space-x-1">
            {tableOperations.map((operation, index) => (
                <Toggle
                    key={index}
                    size="sm"
                    onClick={operation.onClick}
                    title={operation.tooltip}
                >
                    {operation.icon}
                </Toggle>
            ))}
        </div>
    );
}

