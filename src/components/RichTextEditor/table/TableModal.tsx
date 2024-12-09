import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableModalProps {
    onClose: () => void;
    onInsert: (rows: number, cols: number) => void;
}

export function TableModal({ onClose, onInsert }: TableModalProps) {
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);

    const [open, setOpen] = useState(true)

    return (
        <Dialog open={open} onOpenChange={() => {
            setOpen(false)
            onClose()
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insert Table</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rows" className="text-right">
                            Rows
                        </Label>
                        <Input
                            id="rows"
                            type="number"
                            value={rows}
                            onChange={(e) => setRows(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cols" className="text-right">
                            Columns
                        </Label>
                        <Input
                            id="cols"
                            type="number"
                            value={cols}
                            onChange={(e) => setCols(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => {
                        setOpen(false);
                        onInsert(rows, cols);
                        onClose();
                    }}>Insert Table</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

