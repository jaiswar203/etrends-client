import NewLicense from "@/components/Purchase/New/NewLicense"
import { use } from "react"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return <NewLicense clientId={id} />
}