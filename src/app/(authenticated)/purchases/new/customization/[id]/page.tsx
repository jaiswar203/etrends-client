import NewCustomization from "@/components/Purchase/New/NewCustomization"
import { use } from "react"

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params)
    return <NewCustomization clientId={id} />
}

export default Page