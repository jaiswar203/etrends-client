import AMC from '@/components/AMC/AMCDetail'
import { use } from 'react'
import React from 'react'

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id: orderId } = use(params)
    return <AMC orderId={orderId} />
}

export default Page