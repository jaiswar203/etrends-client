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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useMemo, useState } from 'react'
import { Input } from '../ui/input'
import Typography from '../ui/Typography'
import { TransformedAMCObject } from '@/redux/api/order'
import { useRouter } from 'next/navigation'

type AMC = {
    id: string
    client: string
    order: string
    order_type: string
    status: string
}

interface IProps {
    data: TransformedAMCObject[]
}

type TableData = {
    id: string;
    client: string;
    order: string;
    status: string;
    purchased_date: string;
    orderId: string
}

const columns: ColumnDef<TableData>[] = [
    {
        accessorKey: 'client',
        header: 'Client',
    },
    {
        accessorKey: 'order',
        header: 'Order',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <Badge variant={status === 'active' ? 'success' : 'destructive'}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'purchased_date',
        header: 'Purchased Date',
    },
]

const AMCList: React.FC<IProps> = ({ data }) => {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const router = useRouter()

    const tableData = useMemo(() => {
        return data.map((d) => ({
            id: d._id,
            client: d.client.name,
            order: d.products.map((p) => p.name).join(', '),
            status: d.order.status,
            purchased_date: new Date(d.order.purchased_date).toLocaleDateString(),
            orderId: d.order._id
        }))
    }, [data])

    const table = useReactTable({
        data: tableData,
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
            <Typography variant="h1">AMC List</Typography>
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter clients..."
                    value={(table.getColumn('client')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('client')?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
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
                                    className='cursor-pointer'
                                    data-state={row.getIsSelected() && 'selected'}
                                    onClick={() => router.push(`/amc/${row.original.orderId}`)}
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
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="space-x-2">
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
            </div>

        </div>
    )
}

export default AMCList