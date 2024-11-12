'use client'

import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"

// Dummy products data
const products = [
    { id: 1, name: "Laptop" },
    { id: 2, name: "Smartphone" },
    { id: 3, name: "Headphones" },
    { id: 4, name: "Tablet" },
    { id: 5, name: "Smartwatch" },
]

interface ProductDropdownProps {
    isMultiSelect: boolean
    onSelectionChange: (selectedProducts: number[]) => void
}
const ProductDropdown: React.FC<ProductDropdownProps> = ({ isMultiSelect, onSelectionChange }) => {
    const [selectedProducts, setSelectedProducts] = React.useState<number[]>([])
    const [open, setOpen] = React.useState(false)

    const handleProductChange = (value: number | number[]) => {
        let newSelection: number[]

        if (isMultiSelect) {
            newSelection = value as number[]
        } else {
            newSelection = [value as number]
        }

        setSelectedProducts(newSelection)
        onSelectionChange(newSelection)
    }

    const renderSingleSelect = () => (
        <Select onValueChange={(value) => handleProductChange(Number(value))} value={selectedProducts[0]?.toString()}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent className="w-full">
                {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )

    const renderMultiSelect = () => (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    {selectedProducts.length === 0
                        ? "Select products"
                        : `${selectedProducts.length} selected`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4} className="w-[--radix-dropdown-menu-trigger-width]" onClick={(e) => e.stopPropagation()}>
                {products.map((product) => (
                    <DropdownMenuCheckboxItem
                        className='cursor-pointer'
                        key={product.id}
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => {
                            if (checked) {
                                handleProductChange([...selectedProducts, product.id])
                            } else {
                                handleProductChange(selectedProducts.filter((id) => id !== product.id))
                            }
                        }}
                        onSelect={(e) => e.preventDefault()}
                    >
                        {product.name}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )

    return (
        <div className="w-full space-y-2">
            {isMultiSelect ? renderMultiSelect() : renderSingleSelect()}
        </div>
    )
}

export default ProductDropdown