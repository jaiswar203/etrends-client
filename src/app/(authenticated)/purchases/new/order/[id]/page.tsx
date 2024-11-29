import NewOrder from '@/components/Purchase/New/NewOrder'
import React from 'react'

const Page = async ({ params }: { params: { id: string } }) => {
  const clientId = (await params).id
  return <NewOrder clientId={clientId} />
}

export default Page