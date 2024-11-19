"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date: Date | undefined
    onDateChange: (date: Date | undefined) => void
    label?: string
    placeholder?: string
    disabled?: boolean
}

export default function DatePicker({
    date,
    onDateChange,
    label = "Pick a date",
    disabled,
    placeholder = "Select date"
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    const handleDateChange = (selectedDate: Date | undefined) => {
        onDateChange(selectedDate);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                    onClick={() => setOpen(!open)}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    disabled={disabled}
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}