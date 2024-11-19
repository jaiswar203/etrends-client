"use client"
import React from 'react'
import Typography from '../ui/Typography'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const dropdownItems = [
    { href: '/purchases/new/order', label: 'Order' },
    { href: '/purchases/new/licenses', label: 'Licenses' },
    { href: '/purchases/new/customization', label: 'Customization' },
    { href: '/purchases/new/additional-services', label: 'Additional Services' }
]

const Purchase = () => {
    return (
        <div>
            <div className="flex items-center justify-between">
                <Typography variant='h1' className='text-3xl'>Product List</Typography>
                <DropdownMenu>
                    <DropdownMenuTrigger className='flex gap-2 bg-black text-white rounded py-2 px-3 text-sm items-center cursor-pointer hover:bg-gray-800 transition-colors duration-200'>
                        <Plus className='w-6' />
                        Add New Purchase
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-[200px]'>
                        {dropdownItems.map((item, index) => (
                            <Link key={index} href={item.href}>
                                <DropdownMenuItem className='cursor-pointer'>{item.label}</DropdownMenuItem>
                            </Link>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </div>
    )
}

export default Purchase