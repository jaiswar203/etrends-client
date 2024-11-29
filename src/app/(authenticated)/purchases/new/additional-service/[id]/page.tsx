import NewAdditionalService from '@/components/Purchase/New/NewAdditionalService'
import React from 'react'

const Page = async ({ params }: { params: { id: string } }) => {
    const clientId = (await params).id
    return <NewAdditionalService clientId={clientId} />
}

export default Page