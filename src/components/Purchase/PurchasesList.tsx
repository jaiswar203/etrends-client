'use client'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    ColumnFiltersState,
    getSortedRowModel,
    getFilteredRowModel,
    VisibilityState,
} from '@tanstack/react-table'
import { ChevronDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { IPurchase } from '@/redux/api/order'

import { PURCHASE_TYPE } from '@/redux/api/order'
import { ORDER_STATUS_ENUM } from '@/types/client'
import { useState, useMemo, useEffect } from 'react'
import { Input } from '../ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"


type Purchase = {
    id: string
    client: string
    purchaseType: PURCHASE_TYPE
    products: string[]
    status: string
    client_id: string
}

const columns: ColumnDef<Purchase>[] = [
    {
        accessorKey: 'client',
        header: 'Client',
    },
    {
        accessorKey: 'purchaseType',
        header: 'Purchase Type',
    },
    {
        accessorKey: 'products',
        header: 'Products',
        cell: ({ row }) => (
            <div>{(row.getValue('products') as string[]).join(', ')}</div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <Badge variant={status === ORDER_STATUS_ENUM.ACTIVE ? 'success' : status === ORDER_STATUS_ENUM.INACTIVE ? 'destructive' : 'default'}>
                    {status}
                </Badge>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Update status</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

interface IProps {
    data: IPurchase[],
    pagination: {
        total: number,
        page: number,
        limit: number
    }

}

const PurchasesList: React.FC<IProps> = ({ data, pagination }) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [purchasesData, setPurchasesData] = useState(data)

    const router = useRouter()

    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})

    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    useEffect(() => {
        if (data) {
            const filteredData = id
                ? data.filter(purchase => purchase.id === id)
                : data;
            setPurchasesData(filteredData);
        }
    }, [data, id]);

    const purchases = useMemo(() =>
        purchasesData.map((purchase) => ({
            id: purchase.id,
            client: purchase.client.name,
            purchaseType: purchase.purchase_type,
            products: purchase.products.map((product) => product.name),
            status: purchase.status,
            client_id: purchase.client._id
        })) ?? []
        , [purchasesData])



    const table = useReactTable({
        data: purchases ?? [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div>
            <div className="w-full">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Filter companies..."
                        value={(table.getColumn('client')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => {
                            const value = event.target.value
                            table.getColumn('client')?.setFilterValue(value)
                        }}
                        className="max-w-sm"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        onClick={() => router.push(`/purchases/${row.original.id}?type=${row.original.purchaseType}&client=${row.original.client_id}`)}
                                        className='cursor-pointer'
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Add next prev button */}
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>

                {/* <div className="p-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={() => table.previousPage()}
                                />
                            </PaginationItem>
                            {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href={`/purchases?page=${i + 1}`}
                                        onClick={() => table.setPageIndex(i)}
                                        isActive={pagination.page === i + 1}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={() => table.nextPage()}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div> */}

            </div>
        </div>
    )
}

export default PurchasesList