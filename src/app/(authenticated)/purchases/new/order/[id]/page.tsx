import NewOrder from '@/components/Purchase/New/NewOrder'
import { use } from 'react'

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  return <NewOrder clientId={id} />
}

export default Page