"use client"
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { CircleCheck, CircleX, Eye, Pencil } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { useGetAmcByOrderIdQuery, useGetOrderByIdQuery, useUpdateAMCByOrderIdMutation } from '@/redux/api/order'
import Typography from '../ui/Typography'
import OrderDetail from '../Client/Add/Form/OrderDetail'
import { HTMLInputTypeAttribute, useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useFileUpload } from '@/hooks/useFileUpload'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link'
import DatePicker from '../ui/datepicker'

interface IProps {
    orderId: string
}

export interface IAmcInputs {
    amc_frequency_in_months: number,
    purchase_order_number: string,
    purchase_order_document: string
    invoice_document: string
    start_date: Date | undefined
}

enum AMC_FREQUENCY {
    ONE = 1,
    THREE = 3,
    SIX = 6,
    TWELVE = 12,
    EIGHTEEN = 18,
    TWENTY_FOUR = 24
}

interface IDefaultValues {
    client: string
    total_cost: number
    amc_percentage: number
    amc_amount: number
    status: string
    amc_frequency_in_months: number
    purchase_order_number: string
    purchase_order_document: string
    invoice_document: string
    start_date: Date | undefined
}

const AmcForm: React.FC<{ orderId: string, defaultValue?: IDefaultValues }> = ({ orderId, defaultValue }) => {
    const [updateAMCApi, { isLoading }] = useUpdateAMCByOrderIdMutation()
    const [enableEdit, setEnableEdit] = useState(false)
    const { uploadFile } = useFileUpload()

    const values = {
        amc_frequency_in_months: defaultValue?.amc_frequency_in_months || 12,
        purchase_order_number: defaultValue?.purchase_order_number || '',
        purchase_order_document: defaultValue?.purchase_order_document || "",
        invoice_document: defaultValue?.invoice_document || "",
        start_date: defaultValue?.start_date || undefined
    }

    const form = useForm<IAmcInputs>({
        defaultValues: {
            amc_frequency_in_months: defaultValue?.amc_frequency_in_months || 12,
            purchase_order_number: defaultValue?.purchase_order_number ?? '',
            purchase_order_document: defaultValue?.purchase_order_document ?? '',
            invoice_document: defaultValue?.invoice_document ?? '',
            start_date: defaultValue?.start_date || undefined
        },
        ...(defaultValue && {
            values
        })
    })

    const onSubmit = async (data: IAmcInputs) => {
        try {
            await updateAMCApi({ orderId, data }).unwrap()
            toast({
                variant: 'success',
                title: 'AMC Created Successfully',
                description: 'AMC has been created successfully'
            })
            setEnableEdit(false)
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Something went wrong'
            })
        }
    }

    const getSignedUrl = async (file: File, name: keyof IAmcInputs) => {
        const filename = await uploadFile(file);
        form.setValue(name, filename as string)
    }

    const renderInput = (name: Exclude<keyof IAmcInputs, 'start_date'>, label: string, placeholder: string, type: HTMLInputTypeAttribute = "text") => {
        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
            const file = e.target.files?.[0];
            if (file) {
                await getSignedUrl(file, name);
            }
        };

        const renderFilePreview = (field: any) => (
            <div className="flex items-center gap-2">
                <Link href={field.value as string} target='_blank' passHref>
                    <Button variant={!enableEdit ? 'default' : 'outline'} type='button' className={enableEdit ? 'rounded-full w-8 h-8 ml-2 absolute -top-3 -right-10' : ''}>
                        {!enableEdit ? 'View' : <Eye className='w-1' />}
                    </Button>
                </Link>
            </div>
        );

        return (
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <FormItem className='w-full relative'>
                        <FormLabel className='text-gray-500 relative block w-fit'>
                            {label}
                            {(type === "file" && field.value && enableEdit) && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            {renderFilePreview(field)}
                                        </TooltipTrigger>
                                        <TooltipContent>View File</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </FormLabel>

                        <FormControl>
                            {(type === "file" && field.value && !enableEdit) ? (
                                renderFilePreview(field)
                            ) : (
                                <Input
                                    type={type}
                                    {...field}
                                    disabled={!enableEdit}
                                    onChange={type === 'file' ? (e) => handleFileChange(e, field) : field.onChange}
                                    value={type === 'file' ? undefined : field.value}
                                    className='bg-white'
                                    placeholder={placeholder}
                                />
                            )}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }

    const renderDisabledInput = (label: string, value: any, type: HTMLInputTypeAttribute = "text") => {
        return (

            <FormItem className='w-full'>
                <FormLabel className='text-gray-500'>{label}</FormLabel>
                <Input
                    type={type}
                    value={value}
                    className='bg-white'
                    disabled
                />
                <FormMessage />
            </FormItem>
        );
    }

    return (
        <div className="p-4 mt-4">
            <div className="flex items-center justify-between">
                <Typography variant='h2'>AMC Details</Typography>
                <div className="mb-2 flex justify-end">
                    <Button className={`w-36 justify-between ${enableEdit ? "bg-destructive hover:bg-destructive" : ""}`} onClick={() => setEnableEdit(prev => !prev)}>
                        {!enableEdit ? (
                            <>
                                <Pencil />
                                <span>Start Editing</span>
                            </>
                        ) : (
                            <>
                                <CircleX />
                                <span>Close Editing</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">

                    <div className="flex items-center gap-4 w-full">
                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel className='text-gray-500'>AMC Start Date</FormLabel>
                                    <FormControl>
                                        <DatePicker onDateChange={field.onChange} date={field.value} disabled={!enableEdit} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {renderDisabledInput("Total Cost", defaultValue?.total_cost)}
                    </div>
                    <div className="flex items-center gap-4 w-full">
                        {renderDisabledInput("AMC Percentage", defaultValue?.amc_percentage)}
                        {renderDisabledInput("AMC Amount(auto-calculated)", defaultValue?.amc_amount)}
                    </div>

                    <div className="flex items-center gap-4 w-full">
                        <FormField
                            control={form.control}
                            name="amc_frequency_in_months"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel className='text-gray-500'>AMC Frequency</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full bg-white" disabled={!enableEdit}>
                                                <SelectValue placeholder={field.value} />
                                            </SelectTrigger>
                                            <SelectContent className='bg-white'>
                                                {
                                                    Object.entries(AMC_FREQUENCY)
                                                        .filter(([key]) => isNaN(Number(key)))
                                                        .map(([key, value]) => (
                                                            <SelectItem value={value.toString()} key={value}>
                                                                {value} {value === 1 ? 'month' : 'months'}
                                                            </SelectItem>
                                                        ))
                                                }

                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {renderInput("purchase_order_number", "Purchase Order Number", "Enter Purchase Order Number")}
                    </div>
                    <div className="flex items-center gap-4 w-full">
                        {renderInput("purchase_order_document", "Purchase Order Document", "Upload Purchase Order Document", "file")}
                        {renderInput("invoice_document", "Invoice Document", "Upload Invoice Document", "file")}
                    </div>

                    {
                        enableEdit &&
                        <div className="flex justify-end">
                            <Button type="submit" className='w-36' disabled={isLoading || !form.formState.isDirty} loading={{ isLoading, loader: "tailspin" }}>
                                <CircleCheck />
                                <span className='text-white'>Save AMC</span>
                            </Button>
                        </div>
                    }
                </form>
            </Form>
        </div>
    )
}



const AMCDetail: React.FC<IProps> = ({ orderId }) => {
    const { data } = useGetAmcByOrderIdQuery(orderId)
    const { data: orderData } = useGetOrderByIdQuery(orderId)

    const [defaultValues, setDefaultValues] = useState<IDefaultValues>({
        client: '',
        total_cost: 0,
        amc_percentage: 0,
        amc_amount: 0,
        status: '',
        amc_frequency_in_months: 0,
        purchase_order_number: '',
        purchase_order_document: '',
        invoice_document: '',
        start_date: undefined
    })

    useEffect(() => {
        if (data?.data && orderData?.data) {
            setDefaultValues({
                client: data?.data.client.name,
                total_cost: data?.data.total_cost,
                amc_percentage: orderData?.data.amc_rate.percentage,
                amc_amount: data?.data.amount,
                status: orderData?.data.status,
                amc_frequency_in_months: data?.data.amc_frequency_in_months,
                purchase_order_number: data?.data.purchase_order_number || '',
                purchase_order_document: data?.data.purchase_order_document || '',
                invoice_document: data?.data.invoice_document || '',
                start_date: data?.data.start_date
            })
        }
    }, [data, orderData])

    const productsName = data?.data.products.map((product) => product.name).join(', ')

    return (
        <>
            <div className='flex items-center'>
                <Typography variant='h1' className='text-3xl'>{data?.data.client.name} Of {productsName}</Typography>
                {
                    orderData?.data.status === "active" ?
                        <div className={`w-4 h-4 rounded-full bg-green-500 ml-2`}></div> :
                        <div className={`w-4 h-4 rounded-full bg-red-500 ml-2`}></div>
                }
            </div>

            <br />
            <OrderDetail title="Ordet Detail" handler={async () => { }} defaultValue={orderData?.data} defaultOpen={false} />

            <AmcForm orderId={orderId} defaultValue={defaultValues} />
        </>
    )
}

export default AMCDetail