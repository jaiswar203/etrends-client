"use client"
import ClientDetail from '@/components/Client/Add/Form/ClientDetail'
import OrderDetail from '@/components/Client/Add/Form/OrderDetail'
import { OrderDetailInputs } from '@/types/order'
import Typography from '@/components/ui/Typography'
import { toast } from '@/hooks/use-toast'
import { useGetClientByIdQuery, useGetProfitFromClientQuery, useUpdateClientMutation } from '@/redux/api/client'
import { useCreateOrderMutation } from '@/redux/api/order'
import { ClientDetailsInputs } from '@/types/client'
import React from 'react'
import { useRouter } from 'next/navigation'

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

const PageWithQuery = ({ id }: { id: string }) => {
    const { data } = useGetClientByIdQuery(id)
    const [updateClientApi] = useUpdateClientMutation()
    const [createOrderApi, { isLoading: isCreateOrderApiLoading }] = useCreateOrderMutation()

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
                        <p className="text-gray-600 font-semibold">Total Generated Profit</p>
                        <p className="text-gray-600 mb-1 font-normal text-xs" >(exluding AMC)</p>
                        <p className="text-2xl text-green-600 font-semibold">₹{(clientProfitData?.data.total_profit.toLocaleString('en-IN') || 0)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-md text-center">
                        <p className="text-gray-600 mb-1 font-semibold">Toal AMC Collected</p>
                        <p className="text-gray-600 mb-1 font-normal text-xs" ></p>
                        <p className="text-2xl text-green-600 font-semibold">₹{clientProfitData?.data.total_amc_collection || 0}</p>
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <p className="text-gray-600 font-semibold">Total: </p>
                    <p className="text-lg text-green-600 font-semibold">₹{(clientProfitData?.data.total_profit ||  0) + (clientProfitData?.data.total_amc_collection || 0)}</p>
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
                            <TableRow key={index} className='cursor-pointer' onClick={() => router.push(`purchases?id=${order._id}`)}>
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