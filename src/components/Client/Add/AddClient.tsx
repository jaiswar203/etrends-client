"use client"
import Typography from '@/components/ui/Typography'
import React from 'react'
import ClientDetail from './Form/ClientDetail'
import { ClientDetailsInputs } from '@/types/client'
import { useAddClientMutation } from '@/redux/api/client'
import { useToast } from '@/hooks/use-toast'



const AddClient = () => {
    const [addClientApi] = useAddClientMutation()
    const { toast } = useToast()

    const onAddClientHandler = async (data: ClientDetailsInputs) => {
        try {
            const res = await addClientApi(data).unwrap()
            toast({
                variant: "default",
                title: "New Client Added",
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
            <Typography variant='h1' className='md:text-3xl text-xl'>Register New Client & Setup Orders</Typography>

            <div className="mt-5">
                <ClientDetail handler={onAddClientHandler} disableAccordion />
            </div>
        </div>
    )
}

export default AddClient