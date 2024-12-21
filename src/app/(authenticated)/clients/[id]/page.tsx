import React from 'react'
import PageWithQuery from './PageWithQuery'
import { use } from 'react'

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id: clientId } = use(params)
    return <PageWithQuery id={clientId} />
}

export default Page
