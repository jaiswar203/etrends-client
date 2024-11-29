import NewCustomization from "@/components/Purchase/New/NewCustomization"

const Page = async ({ params }: { params: { id: string } }) => {
    const clientId = (await params).id
    return <NewCustomization clientId={clientId} />
}

export default Page