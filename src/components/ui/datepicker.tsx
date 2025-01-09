"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    disabled,
    placeholder = "Select date"
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [currentMonth, setCurrentMonth] = React.useState(date ? new Date(date) : new Date())

    const handleDateChange = (selectedDate: Date | undefined) => {
        onDateChange(selectedDate)
        setOpen(false)
    }

    const handleYearChange = (year: string) => {
        const newDate = new Date(currentMonth)
        newDate.setFullYear(parseInt(year, 10))
        setCurrentMonth(newDate)
    }

    const handleMonthChange = (month: string) => {
        const newDate = new Date(currentMonth)
        newDate.setMonth(parseInt(month, 10))
        setCurrentMonth(newDate)
    }

    const years = Array.from({ length: 121 }, (_, i) => 2025 - i)
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

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
                <div className="flex flex-col gap-2 p-2">
                    <Select onValueChange={handleYearChange} defaultValue={currentMonth ? currentMonth.getFullYear().toString() : new Date().getFullYear().toString()} >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={handleMonthChange} defaultValue={currentMonth ? currentMonth.getMonth().toString() : new Date().getMonth().toString()} >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month, index) => (
                                <SelectItem key={month} value={index.toString()}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    initialFocus
                    disabled={disabled}
                />
            </PopoverContent>
        </Popover>
    )
}

