import AMC from '@/components/AMC/AMCDetail'
import React from 'react'

const Page = async ({ params }: { params: { id: string } }) => {
    const orderId = (await params).id
    return <AMC orderId={orderId} />
}

export default Page