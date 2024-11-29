"use client"
import { useAddAdditionalServiceMutation } from '@/redux/api/order'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import AdditionalServiceForm, { IAdditionalServiceInputs } from '../Form/AdditionalServiceForm'

interface IProps {
    clientId: string
}

const NewAdditionalService: React.FC<IProps> = ({ clientId }) => {

    const [addAddtionalServiceApi, { isLoading }] = useAddAdditionalServiceMutation()

    const router = useRouter()

    const onSubmit = async (data: IAdditionalServiceInputs, orderId?: string) => {
        if (!orderId) return
        try {
            const resp = await addAddtionalServiceApi({ ...data, cost: Number(data.cost), order_id: orderId }).unwrap()
            toast({
                variant: 'success',
                title: 'Service Created Successfully',
                description: 'Service has been created successfully'
            })
            router.push(`/purchases?id=${resp.data._id}`)
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Something went wrong'
            })
        }
    }



    return <AdditionalServiceForm clientId={clientId} label='New Additional Service' handler={onSubmit} isLoading={isLoading} />
}


export default NewAdditionalService