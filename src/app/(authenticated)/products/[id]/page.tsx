import ProductDetail from '@/components/Product/ProductDetail'
import React from 'react'

const Page = async ({ params }: { params: { id: string } }) => {
    const productId = (await params).id
    return <ProductDetail id={productId} />
}

export default Page