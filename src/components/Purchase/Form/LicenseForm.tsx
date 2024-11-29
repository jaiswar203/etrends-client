import React, { HTMLInputTypeAttribute, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import Typography from '@/components/ui/Typography'
import { CircleCheck, CircleX, Eye, Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useGetPurchasedProductsByClientQuery } from '@/redux/api/client'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import DatePicker from '@/components/ui/datepicker'
import { useFileUpload } from '@/hooks/useFileUpload'
import { toast } from '@/hooks/use-toast'
import { ILicenceObject } from '@/redux/api/order'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ILicenseProps {
    clientId: string
    handler: (data: ILicenseInputs, orderId?: string) => void
    isLoading: boolean
    label?: string
    disable?: boolean
    defaultValue?: ILicenceObject
}

export interface ILicenseInputs {
    cost_per_license: number;
    total_license: number;
    product_id: string;
    purchase_date: Date
    purchase_order_document: string
    invoice: string
}

const LicenseForm: React.FC<ILicenseProps> = ({ clientId, handler, isLoading, label, defaultValue, disable = false }) => {
    const { data: productsList } = useGetPurchasedProductsByClientQuery(clientId)
    const { uploadFile } = useFileUpload()

    const [disableInput, setDisableInput] = useState(disable)

    const defaultValues = {
        cost_per_license: defaultValue?.rate.amount || 0,
        total_license: defaultValue?.total_license || 0,
        product_id: defaultValue?.product_id || '',
        purchase_date: defaultValue?.purchase_date ? new Date(defaultValue?.purchase_date) : undefined,
        purchase_order_document: defaultValue?.purchase_order_document || "",
        invoice: defaultValue?.invoice || ""
    }


    const form = useForm<ILicenseInputs>({ defaultValues })

    useEffect(() => {
        if (defaultValue?._id) {
            // set values on the form
            form.setValue('cost_per_license', defaultValue.rate.amount)
            form.setValue('total_license', defaultValue.total_license)
            form.setValue('product_id', defaultValue.product_id)
            form.setValue('purchase_date', defaultValue.purchase_date ? new Date(defaultValue.purchase_date) : new Date())
            form.setValue('purchase_order_document', defaultValue.purchase_order_document)
            form.setValue('invoice', defaultValue.invoice)
        }
    }, [defaultValue])

    useEffect(() => {
        if (disable !== undefined) setDisableInput(disable)
    }, [disable])

    const getSignedUrl = async (file: File, field: keyof ILicenseInputs) => {
        const filename = await uploadFile(file);
        form.setValue(field, filename as string)
    }

    const renderFormField = (name: Exclude<keyof ILicenseInputs, 'purchase_date'>, label: string, placeholder: string, type: HTMLInputTypeAttribute = "number") => {
        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
            const file = e.target.files?.[0];
            if (file) {
                await getSignedUrl(file, name);
            }
        };

        const renderFilePreview = (field: any) => (
            <div className="flex items-center gap-2">
                <Link href={field.value as string} target='_blank' passHref>
                    <Button variant={disableInput ? 'default' : 'outline'} type='button' className={!disableInput ? 'rounded-full w-8 h-8 ml-2 absolute -top-3 -right-10' : ''}>
                        {disableInput ? 'View' : <Eye className='w-1' />}
                    </Button>
                </Link>
            </div>
        );

        return (
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <FormItem className='w-full'>
                        {label && (
                            <FormLabel className='text-gray-500'>
                                {label}
                                {(type === "file" && field.value && !disableInput) && (
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
                        )}
                        <FormControl>
                            {(type === "file" && field.value && disableInput) ? (
                                renderFilePreview(field)
                            ) : (
                                <Input
                                    type={type}
                                    {...field}
                                    onChange={type === 'file' ? (e) => handleFileChange(e, field) : field.onChange}
                                    value={(type === 'number' && field.value === 0) ? '' : (type === 'file' ? undefined : field.value as string)}
                                    disabled={disableInput}
                                    className='bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
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

    const onSubmit = async (data: ILicenseInputs) => {
        if (!data.cost_per_license || !data.total_license || !data.product_id || !data.purchase_date || !data.purchase_order_document) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill all the required fields"
            })
            return
        }
        const product = productsList?.data.find((product) => product._id === data.product_id)
        if (!product) {
            throw new Error('Product not found')
        }
        handler(data, product.order_id)
    }

    const selectPlaceHolder = (name: "product_id", value: string) => {
        if (!value) return "Select a Product"

        const placeholders = {
            product_id: () => productsList?.data.find(product => product._id === value)?.name,
            type: () => value.charAt(0).toUpperCase() + value.slice(1)
        }

        return placeholders[name]?.() || "Select a Product"
    }


    return (
        <div className="bg-custom-gray bg-opacity-75 rounded p-4">
            <div className="flex items-center justify-between">
                <Typography variant='h1'>{label}</Typography>
                {defaultValue?._id && (
                    <div className="mb-2 flex justify-end">
                        <Button className={`w-36 justify-between ${!disableInput ? "bg-destructive hover:bg-destructive" : ""}`}
                            onClick={() => setDisableInput(prev => !prev)}>
                            {disableInput ? (
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
                )}
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
                    <div className="flex items-center gap-4 w-full">
                        <FormField
                            control={form.control}
                            name="product_id"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel className='text-gray-500'>Product ID</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full" disabled={disableInput}>
                                                <SelectValue placeholder={selectPlaceHolder('product_id', field.value)} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {productsList?.data.filter(product => product.does_have_license).map((product) => (
                                                    <SelectItem value={product._id} key={product._id}>{product.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {renderFormField('cost_per_license', 'Cost Per License', 'Enter cost per license')}
                    </div>
                    <div className="flex items-center gap-4 w-full">
                        {renderFormField('total_license', 'Total License', 'Enter total license')}
                        <FormField
                            control={form.control}
                            name="purchase_date"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel className='text-gray-500'>Purchase Date</FormLabel>
                                    <FormControl>
                                        <DatePicker disabled={disableInput} date={field.value} onDateChange={field.onChange} placeholder='Pick a Date' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full">
                        {renderFormField('purchase_order_document', 'Purchase Order Document', 'Upload Purchase Order Document', 'file')}
                        {renderFormField('invoice', 'Invoice', 'Upload Invoice', 'file')}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" className='w-36' disabled={isLoading || disableInput} loading={{ isLoading, loader: "tailspin" }} >
                            <CircleCheck />
                            <span className='text-white'>Save License</span>
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default LicenseForm