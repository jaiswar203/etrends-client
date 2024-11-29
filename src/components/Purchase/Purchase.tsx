"use client"
import React, { useState } from 'react'
import Typography from '../ui/Typography'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGetClientsQuery } from '@/redux/api/client'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import PurchasesList from './PurchasesList'
import { useGetAllOrdersWithAttributesQuery } from '@/redux/api/order'

const dropdownItems = [
    { href: '/purchases/new/order', label: 'Order' },
    { href: '/purchases/new/license', label: 'Licenses' },
    { href: '/purchases/new/customization', label: 'Customization' },
    { href: '/purchases/new/additional-service', label: 'Additional Services' }
]

interface IProps {
    page?: number
}

const Purchase: React.FC<IProps> = ({ page }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<typeof dropdownItems[0] | null>(null)
    const [selectedClientId, setSelectedClientId] = useState<string>('')

    const { data } = useGetAllOrdersWithAttributesQuery({ page })

    const { data: clientsList } = useGetClientsQuery({ all: true })
    const router = useRouter()

    const handleItemClick = (item: typeof dropdownItems[0]) => {
        setSelectedItem(item)
        setIsDialogOpen(true)
    }

    const onSelectionChange = (clientId: string) => {
        setSelectedClientId(clientId)
    }

    const onButtonClick = () => {
        if (!selectedItem) return
        router.push(`${selectedItem?.href}/${selectedClientId}`)
    }



    return (
        <div>
            <div className="flex items-center justify-between">
                <Typography variant='h1' className='text-3xl'>Purchases List</Typography>
                <DropdownMenu>
                    <DropdownMenuTrigger className='flex gap-2 bg-black text-white rounded py-2 px-3 text-sm items-center cursor-pointer hover:bg-gray-800 transition-colors duration-200'>
                        <Plus className='w-6' />
                        Add New Purchase
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-[200px]'>
                        {dropdownItems.map((item, index) => (
                            <DropdownMenuItem
                                key={index}
                                className='cursor-pointer'
                                onClick={() => handleItemClick(item)}>
                                {item.label}
                            </DropdownMenuItem>

                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Client</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {/* Add form fields here based on the selected item */}
                        <Select onValueChange={onSelectionChange}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select Client" />
                            </SelectTrigger>
                            <SelectContent className="w-full">
                                {clientsList?.data.map((client) => (
                                    <SelectItem key={client._id} value={client._id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button onClick={onButtonClick}>Continue</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <br />

            <PurchasesList
                data={data?.data.purchases ?? []}
                pagination={data?.data.pagination ?? { total: 0, page: 1, limit: 10 }}
            />
        </div>
    )
}

export default Purchase