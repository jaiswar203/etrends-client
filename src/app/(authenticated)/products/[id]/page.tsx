import ProductDetail from '@/components/Product/ProductDetail'
import { use } from 'react'
import React from 'react'

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params)
    return <ProductDetail id={id} />
}

export default Page