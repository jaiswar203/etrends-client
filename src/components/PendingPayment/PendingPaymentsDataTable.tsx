"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination"
import { IPendingPayment, IPendingPaymentPagination, IPendingPaymentType, IUpdatePendingPaymentRequest, PAYMENT_STATUS_ENUM, useUpdatePendingPaymentMutation } from "@/redux/api/order"
import millify from "millify"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form"
import { Input } from "../ui/input"
import DatePicker from "../ui/datepicker"
import { toast } from "@/hooks/use-toast"

interface IProps {
    data: IPendingPayment[]
    pagination: IPendingPaymentPagination
}

export default function DataTableWithModalAndPagination({ data, pagination }: IProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [updatePayment, setUpdatePayment] = useState<{ modal: boolean, data: IUpdatePendingPaymentRequest }>({
        modal: false, data: {
            payment_identifier: '',
            status: '',
            payment_receive_date: new Date(),
            type: 'PENDING' as IPendingPaymentType,
            _id: ''
        }
    })

    const [
        updatePendingPaymentApi,
        { isLoading }
    ] = useUpdatePendingPaymentMutation()

    const form = useForm<
        { payment_receive_date: Date, status: PAYMENT_STATUS_ENUM }
    >({
        defaultValues: {
            payment_receive_date: undefined,
            status: PAYMENT_STATUS_ENUM.PAID
        }
    })

    const {
        handleSubmit,
    } = form

    const [selectedItem, setSelectedItem] = useState<IPendingPayment | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4

    const handleRowClick: (item: IPendingPayment) => void = (item) => {
        const payment_identifier = (item.type === "order" || item.type === "amc") ? item.payment_identifier : item._id
        setSelectedItem({ ...item, payment_identifier })
        setIsModalOpen(true)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

    const totalPages = Math.ceil(data.length / itemsPerPage)

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }

    const onSubmit = async (data: { payment_receive_date: Date, status: PAYMENT_STATUS_ENUM }) => {
        if (!data.payment_receive_date) {
            toast({
                title: 'Payment Receive Date is required',
                description: 'Please select a date',
                variant: 'destructive'
            })
            return
        }
        try {
            await updatePendingPaymentApi({
                payment_identifier: updatePayment?.data.payment_identifier ?? '',
                status: PAYMENT_STATUS_ENUM.PAID,
                payment_receive_date: data.payment_receive_date,
                type: updatePayment.data.type as IPendingPaymentType,
                _id: updatePayment.data._id
            }).unwrap()
            toast({
                title: 'Payment Updated',
                description: 'Payment has been successfully updated',
                variant: 'success'
            })
            setUpdatePayment({ modal: false, data: updatePayment.data })
            setIsModalOpen(false)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while updating the payment',
                variant: 'destructive'
            })
        }
    }

    return (
        <div className="container">
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Pending Amount</TableHead>
                            <TableHead>Payment Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentItems.map((item) => (
                            <TableRow
                                key={item._id}
                                onClick={() => handleRowClick(item)}
                                className="cursor-pointer hover:bg-muted/50"
                            >
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell>₹{millify(item.pending_amount, { precision: 2 })}</TableCell>
                                <TableCell>{formatDate(item.payment_date)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={prevPage}
                                disabled={pagination.currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                        </PaginationItem>
                        {[...Array(pagination.totalPages)].map((_, index) => (
                            <PaginationItem key={index + 1}>
                                <Button
                                    variant={pagination.currentPage === index + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </Button>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={nextPage}
                                disabled={pagination.currentPage === pagination.totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Item Details</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="mt-4">
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Name</TableCell>
                                        <TableCell>{selectedItem.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Type</TableCell>
                                        <TableCell>{selectedItem.type}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Status</TableCell>
                                        <TableCell className={selectedItem.status === PAYMENT_STATUS_ENUM.PENDING ? "text-red-600 capitalize" : "text-green-700"}>{selectedItem.status}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Pending Amount</TableCell>
                                        <TableCell>₹{millify(selectedItem.pending_amount, { precision: 2 })}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Payment Date</TableCell>
                                        <TableCell>{formatDate(selectedItem.payment_date)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <Button variant={"secondary"} onClick={() => setIsModalOpen(false)}>Close</Button>
                        <Button className="ml-2"
                            onClick={() => {
                                setUpdatePayment({
                                    modal: true,
                                    data: {
                                        payment_identifier: selectedItem?.payment_identifier ?? '',
                                        status: selectedItem?.status ?? '',
                                        payment_receive_date: new Date(selectedItem?.payment_date ?? Date.now()),
                                        type: selectedItem?.type as IPendingPaymentType,
                                        _id: selectedItem?._id ?? ''
                                    }
                                })
                            }
                            }
                        >Update</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={updatePayment.modal} onOpenChange={() => setUpdatePayment({ modal: false, data: updatePayment.data })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Payment</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <Form {...form}>
                            <form action="" onSubmit={handleSubmit(onSubmit)}>

                                <FormItem >
                                    <FormLabel htmlFor="payment_identifier">Payment Status</FormLabel>
                                    <Input value={PAYMENT_STATUS_ENUM.PAID} disabled />

                                </FormItem>

                                <br />
                                <FormField
                                    control={form.control}
                                    name={`payment_receive_date`}
                                    render={({ field }) => (
                                        <FormItem className='w-full mb-4 md:mb-0'>
                                            <FormLabel className='text-gray-500'>Payment Receive Date</FormLabel>
                                            <FormControl>
                                                <DatePicker onDateChange={field.onChange} date={field.value} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="mt-6 flex justify-end">
                                    <Button variant={"secondary"} type="button" onClick={() => setUpdatePayment({ modal: false, data: updatePayment.data })}>Close</Button>
                                    <Button className="ml-2 w-36" type="submit" loading={{
                                        isLoading,
                                        loader: "tailspin"
                                    }}>Update</Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

