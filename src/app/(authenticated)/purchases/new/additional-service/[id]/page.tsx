import NewAdditionalService from '@/components/Purchase/New/NewAdditionalService'
import React from 'react'
import { use } from 'react'

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id: clientId } = use(params)
    return <NewAdditionalService clientId={clientId} />
}

export default Page