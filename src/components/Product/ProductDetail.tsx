"use client"
import { useGetProductByIdQuery, useUpdateProductByIdMutation } from '@/redux/api/product'
import React from 'react'
import CreateProduct, { IProductInputs } from './Create/CreateProduct'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface IProps {
    id: string
}

const ProductDetail: React.FC<IProps> = ({ id }) => {
    const { data } = useGetProductByIdQuery(id)
    const [updateProductByIdApi] = useUpdateProductByIdMutation()
    const router = useRouter()

    const handler = async (data: IProductInputs) => {
        try {
            await updateProductByIdApi({ id, data }).unwrap()
            toast({
                variant: "success",
                title: "Product Updated",
            })
            router.push(`/products`)
        } catch (error) {
            console.error(error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error updating product"
            })
        }
    }

    return <CreateProduct defaultValue={data?.data} disable handler={handler} removeAccordion />
}

export default ProductDetail