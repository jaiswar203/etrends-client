import * as React from "react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    isPercentage?: boolean
    onModeChange?: (isPercentage: boolean) => void
    onValueChange?: (value: number | null) => void
    defaultInputValue?: {
        percentage: number
        value: number
    }
}

const OPTIONS = [
    { value: "%", label: "%" },
    { value: "₹", label: "₹" },
] as const

const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
    ({ className, isPercentage = true, onModeChange, onValueChange, defaultInputValue, disabled, ...props }, ref) => {
        const [selectedOption, setSelectedOption] = React.useState<typeof OPTIONS[number]>(OPTIONS[0])

        const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value
            if (value === '') {
                onValueChange?.(null)
                return
            }

            const numericValue = parseFloat(value)
            if (!isNaN(numericValue)) {
                if (selectedOption.value === '%') {
                    const clampedValue = Math.min(100, Number(numericValue.toFixed(2)))
                    onValueChange?.(clampedValue)
                    event.target.value = clampedValue.toString()
                } else {
                    onValueChange?.(numericValue)
                }
            }
        }
        return (
            <div className="relative flex items-center">
                <input
                    type="number"
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-16 md:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        className
                    )}
                    ref={ref}
                    value={defaultInputValue ?
                        (selectedOption.value === '%' ? defaultInputValue.percentage : defaultInputValue.value)
                        : undefined}
                    disabled={disabled}
                    onChange={handleValueChange}
                    max={selectedOption.value === '%' ? 100 : undefined}
                    {...props}
                />

                <Select
                    onValueChange={(value) => {
                        const newOption = OPTIONS.find(opt => opt.value === value) || OPTIONS[0]
                        setSelectedOption(newOption)
                        onModeChange?.(newOption.value === '%')
                    }}
                    defaultValue={selectedOption.value}
                    disabled={disabled}
                >
                    <SelectTrigger className="absolute right-1 h-8 w-14 ">
                        <SelectValue>{selectedOption.value}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )
    }
)

export { AmountInput }