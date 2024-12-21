"use client"
import ClientDetail from '@/components/Client/Add/Form/ClientDetail'
import OrderDetail from '@/components/Client/Add/Form/OrderDetail'
import { OrderDetailInputs } from '@/types/order'
import Typography from '@/components/ui/Typography'
import { toast } from '@/hooks/use-toast'
import { IClientProfitOrderDetail, useGetClientByIdQuery, useGetProfitFromClientQuery, useUpdateClientMutation } from '@/redux/api/client'
import { useCreateOrderMutation } from '@/redux/api/order'
import { ClientDetailsInputs } from '@/types/client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { dateToHumanReadable } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface OrderDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: any // Replace 'any' with a more specific type based on your data structure
}


interface RevenueBreakdownProps {
    breakdown: {
        base_cost: number;
        customizations: number;
        licenses: number;
        additional_services: number;
    }
    total: number
}

const RevenueBreakdownTable = ({ breakdown, total }: RevenueBreakdownProps) => {
    const items = [
        { name: "Base Cost", value: breakdown.base_cost },
        { name: "Customizations", value: breakdown.customizations },
        { name: "Licenses", value: breakdown.licenses },
        { name: "Additional Services", value: breakdown.additional_services },
    ]

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.name}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.value.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                ))}

                <TableRow className='bg-zinc-200 rounded'>
                    <TableHead className='text-black'>Total</TableHead>
                    <TableHead className="text-right text-black">₹{total}</TableHead>
                </TableRow>
            </TableBody>
        </Table>
    )
}


function OrderDetailModal({ open, onOpenChange, data }: OrderDetailModalProps) {
    if (!data) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto flex flex-col">
                <DialogHeader>
                    <DialogTitle>Order Breakdown</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Products</CardTitle>
                        </CardHeader>
                        <CardContent className='overflow-y-auto'>
                            {data.products.map((product: any) => (
                                <Badge key={product.id} variant="outline" className="mr-2">
                                    {product.name}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Base Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">₹{data.base_cost.toLocaleString('en-IN')}</p>
                        </CardContent>
                    </Card>

                    {data.licenses.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Licenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.licenses.map((license: any) => (
                                    <div key={license.id} className="mb-4 last:mb-0">
                                        <p>Quantity: {license.total_license}</p>
                                        <p>Cost per License: ₹{license.rate.amount.toLocaleString('en-IN')}</p>
                                        <p className="text-lg font-bold mt-1">
                                            Total: ₹{(license.total_license * license.rate.amount).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {data.customizations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Customizations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.customizations.map((customization: any) => (
                                    <div key={customization.id} className="mb-4 last:mb-0">
                                        <p>Modules: {customization.modules.join(', ')}</p>
                                        <p className="text-lg font-bold mt-1">
                                            Cost: ₹{customization.cost.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {data.additional_services.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Services</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.additional_services.map((service: any) => (
                                    <div key={service.id} className="mb-4 last:mb-0">
                                        <p className="font-semibold">{service.title}</p>
                                        <p className="text-lg font-bold mt-1">
                                            Cost: ₹{service.cost.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>AMC Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Total Cost: ₹{data.amc_details.total_cost.toLocaleString('en-IN')}</p>
                            <p>Frequency: {data.amc_details.amc_frequency_in_months} months</p>
                            <p>Start Date: {new Date(data.amc_details.start_date).toLocaleDateString()}</p>
                            <p>AMC Percentage: {data.amc_details.amc_percentage}%</p>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const PageWithQuery = ({ id }: { id: string }) => {
    const { data } = useGetClientByIdQuery(id)
    const [updateClientApi] = useUpdateClientMutation()
    const [createOrderApi, { isLoading: isCreateOrderApiLoading }] = useCreateOrderMutation()

    const [orderDetailModal, setOrderDetailModal] = useState<{ open: boolean, data: IClientProfitOrderDetail | null }>({ open: false, data: null })

    const router = useRouter()
    const { data: clientProfitData } = useGetProfitFromClientQuery(id, { skip: data?.data.orders.length === 0 })

    const updateClientDataHandler = async (data: ClientDetailsInputs) => {
        try {
            const res = await updateClientApi({ ...data, id }).unwrap()
            toast({
                variant: "default",
                title: "Client Updated",
            })
            return res.data._id
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error Occured while adding a client",
                description: error?.message || `Please try again and if error still persist contact the developer`
            })
        }
    }

    const createOrderHandler = async (data: OrderDetailInputs) => {
        try {
            const order = await createOrderApi({ ...data, client_id: id }).unwrap()
            toast({
                variant: "success",
                title: "Order Created",
            })
            router.push(`/purchases?id=${order.data._id}`)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error Occured while adding a client",
                description: error?.message || `Please try again and if error still persist contact the developer`
            })
        }
    }

    if (!data) return null

    const FinacialSummary = (
        <div className=" p-5">
            <Typography variant='h2' className='text-3xl mb-4'>Financial Summary</Typography>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-md text-center">
                        <p className="text-gray-600 font-semibold">Total Generated Revenue</p>
                        <p className="text-gray-600 mb-1 font-normal text-xs" >(exluding AMC)</p>
                        <p className="text-2xl text-green-600 font-semibold">₹{(clientProfitData?.data.total_profit.toLocaleString('en-IN') || 0)}</p>
                        <Dialog>
                            <DialogTrigger>
                                <p className='text-xs underline cursor-pointer'>Show Breakdown</p>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Revenue Breakdown</DialogTitle>
                                </DialogHeader>
                                <RevenueBreakdownTable breakdown={clientProfitData?.data?.revenue_breakdown || {
                                    base_cost: 0,
                                    customizations: 0,
                                    licenses: 0,
                                    additional_services: 0,

                                }} total={
                                    (clientProfitData?.data.total_profit || 0)
                                } />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="p-3 bg-white rounded-md text-center">
                        <p className="text-gray-600 mb-1 font-semibold">Toal AMC Collected</p>
                        <p className="text-gray-600 mb-1 font-normal text-xs" ></p>
                        <p className="text-2xl text-green-600 font-semibold">₹{clientProfitData?.data.total_amc_collection || 0}</p>
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <p className="text-gray-600 font-semibold">Total: </p>
                    <p className="text-lg text-green-600 font-semibold">₹{(clientProfitData?.data.total_profit || 0) + (clientProfitData?.data.total_amc_collection || 0)}</p>
                </div>
            </div>

            <div className="flex mt-5 mb-4 justify-between ">
                <Typography variant='h2' className='text-3xl '>Orders</Typography>
                <Button onClick={() => router.push(`/purchases/new/order/${id}`)}>
                    <Plus />
                    New Order
                </Button>
            </div>

            <Table className=''>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] text-left">No</TableHead>
                        <TableHead className='text-center'>Orders</TableHead>
                        <TableHead className='text-center'>Total Licenses</TableHead>
                        <TableHead className='text-center'>Total Customization</TableHead>
                        <TableHead className='text-center'>Total Additional Service</TableHead>
                        <TableHead className='text-center'>Purchased Date</TableHead>
                        <TableHead className="text-right">Order Status</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {
                        clientProfitData?.data.orders.length ? clientProfitData?.data.orders.map((order, index) => (
                            <TableRow key={index} className='cursor-pointer' onClick={() => setOrderDetailModal({ open: true, data: order })}>
                                <TableCell className='text-left'>{index + 1}</TableCell>
                                <TableCell className='text-center'>{order.products.map((prod) => prod.name).join(", ")}</TableCell>
                                <TableCell className='text-center'>{order.licenses?.length}</TableCell>
                                <TableCell className='text-center'>{order.customizations?.length}</TableCell>
                                <TableCell className='text-center'>{order.additional_services?.length}</TableCell>
                                <TableCell className='text-center'>{dateToHumanReadable(order.purchased_date)}</TableCell>

                                <TableCell className={`text-right capitalize `}>
                                    <Badge variant={"default"} className={`text-white ${order.status === "active" ? "text-green-400 " : "text-red-400"}`}>{order.status}</Badge>
                                </TableCell>
                            </TableRow>
                        )) :
                            <TableRow className=''>
                                <TableCell colSpan={7} className='text-center text-gray-600 font-medium'>No Order Purchased by the client</TableCell>
                            </TableRow>
                    }
                </TableBody>
            </Table>

            <OrderDetailModal
                open={orderDetailModal.open}
                onOpenChange={(open) => setOrderDetailModal({ open, data: open ? orderDetailModal.data : null })}
                data={orderDetailModal.data}
            />

        </div>
    )

    return (
        <div>
            <div>
                <Typography variant='h1' className='text-3xl'>{data?.data.name}</Typography>
                <div className="mt-5 space-y-10">
                    <ClientDetail defaultValue={data?.data} disable handler={updateClientDataHandler} />
                    {
                        !data?.data.orders.length ?
                            <OrderDetail isLoading={isCreateOrderApiLoading} title="Intial Order" handler={createOrderHandler} defaultOpen={true} />
                            : FinacialSummary
                    }
                </div>
            </div>

        </div>
    )
}

export default PageWithQuery