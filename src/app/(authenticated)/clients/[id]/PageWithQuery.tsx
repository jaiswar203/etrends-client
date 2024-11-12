"use client"
import ClientDetail from '@/components/Client/Add/Form/ClientDetail'
import OrderDetail from '@/components/Client/Add/Form/OrderDetail'
import Typography from '@/components/ui/Typography'
import { toast } from '@/hooks/use-toast'
import { useGetClientByIdQuery, useUpdateClientMutation } from '@/redux/api/client'
import { ClientDetailsInputs } from '@/types/client'
import React from 'react'

const PageWithQuery = ({ id }: { id: string }) => {
    const { data } = useGetClientByIdQuery(id)
    const [updateClientApi] = useUpdateClientMutation()

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
    return (
        <div>
            <div>
                <Typography variant='h1' className='text-3xl'>{data?.data.name}</Typography>

                <div className="mt-5 space-y-20"> 
                    <ClientDetail defaultValue={data?.data} disable handler={updateClientDataHandler} />
                    <OrderDetail title="First Order" />
                </div>
            </div>
        </div>
    )
}

export default PageWithQuery