import NewLicense from "@/components/Purchase/New/NewLicense"

const Page = async ({ params }: { params: { id: string } }) => {
    const clientId = (await params).id
    return <NewLicense clientId={clientId} />
}

export default Page