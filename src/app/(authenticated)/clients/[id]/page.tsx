import React from 'react'
import PageWithQuery from './PageWithQuery'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const clientId = (await params).id

    return <PageWithQuery id={clientId} />

}

export default Page