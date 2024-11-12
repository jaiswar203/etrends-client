'use client'

import * as React from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { IClientDataObject, IClientObject } from '@/redux/api/client'
import { useRouter } from 'next/navigation'

// Define the shape of our data
interface Company {
    id: string
    name: string
    industry: string
    email: string
    status: 'active' | 'inactive' | 'pending'
    dateJoined: Date
}

interface IProps {
    data: IClientDataObject[]
}

// Sample data
const data: Company[] = [
    {
        id: '1',
        name: 'Acme Corp',
        industry: 'Technology',
        email: 'contact@acme.com',
        status: 'active',
        dateJoined: new Date('2022-01-15'),
    },
    {
        id: '2',
        name: 'Globex Corporation',
        industry: 'Manufacturing',
        email: 'info@globex.com',
        status: 'inactive',
        dateJoined: new Date('2021-11-20'),
    },
    {
        id: '3',
        name: 'Soylent Corp',
        industry: 'Food & Beverage',
        email: 'hello@soylent.com',
        status: 'pending',
        dateJoined: new Date('2023-03-01'),
    },
    {
        id: '4',
        name: 'Initech',
        industry: 'Technology',
        email: 'support@initech.com',
        status: 'active',
        dateJoined: new Date('2022-07-10'),
    },
    {
        id: '5',
        name: 'Umbrella Corporation',
        industry: 'Pharmaceuticals',
        email: 'info@umbrella.com',
        status: 'active',
        dateJoined: new Date('2023-01-05'),
    },
    {
        id: '1',
        name: 'Acme Corp',
        industry: 'Technology',
        email: 'contact@acme.com',
        status: 'active',
        dateJoined: new Date('2022-01-15'),
    },
    {
        id: '2',
        name: 'Globex Corporation',
        industry: 'Manufacturing',
        email: 'info@globex.com',
        status: 'inactive',
        dateJoined: new Date('2021-11-20'),
    },
    {
        id: '3',
        name: 'Soylent Corp',
        industry: 'Food & Beverage',
        email: 'hello@soylent.com',
        status: 'pending',
        dateJoined: new Date('2023-03-01'),
    },
    {
        id: '4',
        name: 'Initech',
        industry: 'Technology',
        email: 'support@initech.com',
        status: 'active',
        dateJoined: new Date('2022-07-10'),
    },
    {
        id: '5',
        name: 'Umbrella Corporation',
        industry: 'Pharmaceuticals',
        email: 'info@umbrella.com',
        status: 'active',
        dateJoined: new Date('2023-01-05'),
    },
]

export const columns: ColumnDef<{ id: string; name: string; industry: string; email: string; status: string; dateJoined: Date; }>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'industry',
        header: 'Industry',
        cell: ({ row }) => <div className="capitalize">{row.getValue('industry')}</div>,
    },
    {
        accessorKey: 'email',
        header: 'Contact Email',
        cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <Badge variant={status === 'active' ? 'success' : status === 'inactive' ? 'destructive' : 'outline'}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'dateJoined',
        header: 'Date Joined',
        cell: ({ row }) => {
            const date = row.getValue('dateJoined') as Date
            const formatted = date.toLocaleDateString()
            return <div>{formatted}</div>
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const company = row.original

            const router = useRouter()
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(company.id)}
                        >
                            Copy company ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/clients/${company.id}`)}>View customer</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]



const ClientList: React.FC<IProps> = ({ data: clientData }) => {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )

    // Transform the data into the shape we need
    const data = clientData.map((client, index) => {
        return {
            id: client._id,
            name: client.name,
            industry: client.industry,
            email: client.point_of_contacts[0].email,
            status: 'active',
            dateJoined: new Date(client.createdAt),
        }
    })

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
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
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter companies..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('name')?.setFilterValue(event.target.value)
                    }
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
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
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

export default ClientList