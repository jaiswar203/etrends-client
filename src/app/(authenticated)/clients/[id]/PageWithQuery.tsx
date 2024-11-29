"use client"
import ClientDetail from '@/components/Client/Add/Form/ClientDetail'
import OrderDetail from '@/components/Client/Add/Form/OrderDetail'
import { OrderDetailInputs } from '@/types/order'
import Typography from '@/components/ui/Typography'
import { toast } from '@/hooks/use-toast'
import { useGetClientByIdQuery, useUpdateClientMutation } from '@/redux/api/client'
import { useCreateOrderMutation, useGetOrderByIdQuery, useUpdateOrderMutation } from '@/redux/api/order'
import { ClientDetailsInputs } from '@/types/client'
import React from 'react'
import { useRouter } from 'next/navigation'

const PageWithQuery = ({ id }: { id: string }) => {
    const { data } = useGetClientByIdQuery(id)
    const [updateClientApi] = useUpdateClientMutation()
    const [createOrderApi] = useCreateOrderMutation()
    const [updateFirstOrderApi] = useUpdateOrderMutation()
    const { data: orderData } = useGetOrderByIdQuery(data?.data.orders[0] ?? '', {
        skip: !data?.data.orders?.[0]
    })
    const router = useRouter()

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

    const updateOrderHandler = async (data: OrderDetailInputs) => {
        if (!orderData?.data._id) {
            toast({
                variant: "destructive",
                title: "Error Occured while updating a client",
                description: "Please create a first order before updating"
            })
            return
        }

        try {
            await updateFirstOrderApi({ ...data, orderId: orderData?.data._id }).unwrap()
            toast({
                variant: "success",
                title: "Order Updated",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error Occured while adding a client",
                description: error?.message || `Please try again and if error still persist contact the developer`
            })
        }
    }

    return (
        <div>
            <div>
                <Typography variant='h1' className='text-3xl'>{data?.data.name}</Typography>
                <div className="mt-5 space-y-10">
                    <ClientDetail defaultValue={data?.data} disable handler={updateClientDataHandler} />
                    <OrderDetail title="Intial Order" handler={createOrderHandler} defaultValue={orderData?.data} updateHandler={updateOrderHandler} defaultOpen={true} />
                </div>
            </div>
        </div>
    )
}

export default PageWithQuery