"use client"
import React from 'react'
import Typography from '../ui/Typography'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { useAppSelector } from '@/redux/hook'
import ProductList from './ProductList'
import { useDeleteProductMutation } from '@/redux/api/product'

const Product = () => {
    const { products } = useAppSelector(state => state.user)
    const [deleteProductApi] = useDeleteProductMutation()


    const deleteProduct = async (id: string) => {
        try {
            await deleteProductApi(id).unwrap()
        } catch (error) {
            console.error("Error deleting product:", error)
        }
    }
    return (
        <div>
            <div className="flex items-center justify-between">
                <Typography variant='h1' className='text-3xl'>Product List</Typography>
                <Link passHref href={"/products/create"}>
                    <Button>
                        <Plus />
                        Add Product
                    </Button>
                </Link>
            </div>

            <br />
            <ProductList products={products} deleteProduct={deleteProduct} />
        </div >
    )
}

export default Product