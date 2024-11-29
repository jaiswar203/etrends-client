import PurchaseDetail from '@/components/Purchase/PurchaseDetail'
import { PURCHASE_TYPE } from '@/redux/api/order'
import React from 'react'

const Page = async ({ params, searchParams }: { params: { id: string }, searchParams: { type: string, client: string } }) => {
    const purchaseId = (await params).id
    const searchParamsObj = (await searchParams)
    const clientId = searchParamsObj.client
    const type = searchParamsObj.type as PURCHASE_TYPE

    return <PurchaseDetail id={purchaseId} type={type} clientId={clientId} />
}

export default Page