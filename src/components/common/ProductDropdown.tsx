'use client'

import React, { useEffect } from 'react'
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
import { IProduct } from '@/types/product'
import { useAppSelector } from '@/redux/hook'

interface ProductDropdownProps {
    isMultiSelect?: boolean
    onSelectionChange: (selectedProducts: IProduct[]) => void
    filterProducts?: (product: IProduct) => boolean
    values?: string[]
    disabled?: boolean
}

const ProductDropdown: React.FC<ProductDropdownProps> = ({ isMultiSelect = false, onSelectionChange, filterProducts, values, disabled }) => {
    const { products } = useAppSelector(state => state.user)

    const [selectedProducts, setSelectedProducts] = React.useState<IProduct[]>([])
    const [open, setOpen] = React.useState(false)

    const handleProductChange = (value: string | string[]) => {
        let newSelection: IProduct[]

        if (isMultiSelect) {
            newSelection = (value as string[]).map(id => products.find((product: IProduct) => product._id === id)!)
        } else {
            newSelection = [products.find((product: IProduct) => product._id === value)!]
        }

        setSelectedProducts(newSelection)
        onSelectionChange(newSelection)
    }

    useEffect(() => {
        if (values && values.length > 0) {
            handleProductChange(isMultiSelect ? values : values[0])
        }
    }, [values])


    const filteredProducts = filterProducts ? products.filter(filterProducts) : products

    const renderSingleSelect = () => (
        <Select onValueChange={(value) => handleProductChange(value)} value={selectedProducts[0]?._id} disabled={disabled}>
            <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent className="w-full">
                {filteredProducts.map((product: IProduct) => (
                    <SelectItem key={product._id} value={product._id}>
                        {product.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )

    const renderMultiSelect = () => (
        <DropdownMenu open={open} onOpenChange={setOpen} >
            <DropdownMenuTrigger asChild disabled={disabled}>
                <Button variant="outline" className="w-full justify-between">
                    {selectedProducts.length === 0
                        ? "Select products"
                        : `${selectedProducts.reduce((acc, curr, index) => {
                            return acc + (index > 0 ? ', ' : "") + curr.short_name
                        }, "")}`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4} className="w-[--radix-dropdown-menu-trigger-width]" onClick={(e) => e.stopPropagation()} >
                {filteredProducts.map((product: IProduct) => (
                    <DropdownMenuCheckboxItem
                        disabled={disabled}
                        className='cursor-pointer'
                        key={product._id}
                        checked={selectedProducts.some(selectedProduct => selectedProduct._id === product._id)}
                        onCheckedChange={(checked) => {
                            if (checked) {
                                handleProductChange([...selectedProducts.map(p => p._id), product._id])
                            } else {
                                handleProductChange(selectedProducts.filter((p) => p._id !== product._id).map(p => p._id))
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
