import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import Typography from '@/components/ui/Typography'
import { useGetPurchasedProductsByClientQuery } from '@/redux/api/client'
import { CustomizationDetails, CustomizationType } from '@/types/order'
import { CircleCheck, CirclePlus, CircleX, Eye, Pencil, X } from 'lucide-react'
import React, { HTMLInputTypeAttribute, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useFileUpload } from '@/hooks/useFileUpload'
import DatePicker from '@/components/ui/datepicker'
import { toast } from '@/hooks/use-toast'
import { ICustomizationObject } from '@/redux/api/order'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ICustomationProps {
    clientId: string
    handler: (data: ICustomizationInputs, orderId?: string) => void
    isLoading?: boolean
    label?: string
    disable?: boolean
    defaultValue?: ICustomizationObject
}

export interface ICustomizationInputs extends CustomizationDetails {
    product_id: string
}

const CustomizationForm: React.FC<ICustomationProps> = ({ clientId, handler, isLoading = false, label, disable = false, defaultValue }) => {
    const { data: productsList } = useGetPurchasedProductsByClientQuery(clientId)
    const { uploadFile } = useFileUpload()

    const [disableInput, setDisableInput] = useState(disable)

    const values = defaultValue && {
        product_id: defaultValue.product_id,
        cost: defaultValue.cost,
        modules: defaultValue.modules,
        purchase_order_document: defaultValue.purchase_order_document,
        purchased_date: defaultValue.purchased_date ? new Date(defaultValue.purchased_date) : undefined,
        type: defaultValue.type
    }

    const defaultValues = {
        product_id: defaultValue?.product_id || '',
        cost: defaultValue?.cost || 0,
        modules: defaultValue?.modules || ["Module 1"],
        purchase_order_document: defaultValue?.purchase_order_document || '',
        purchased_date: defaultValue?.purchased_date ? new Date(defaultValue.purchased_date) : undefined,
        type: defaultValue?.type || CustomizationType.MODULE
    }


    const form = useForm<ICustomizationInputs>({
        defaultValues: defaultValues,
        ...(defaultValue && {
            values
        })
    })

    useEffect(() => {
        if (disable !== undefined) setDisableInput(disable)
    }, [disable])

    const customizationModulesFields = form.watch("modules")

    const appendCustomizationModule = () => {
        form.setValue("modules", [...customizationModulesFields, ""])
    }

    const removeCustomizationModule = (index: number) => {
        form.setValue("modules", customizationModulesFields.filter((_, i) => i !== index))
    }

    const getSignedUrl = async (file: File) => {
        const filename = await uploadFile(file);
        form.setValue('purchase_order_document', filename as string)
    }

    const renderFormField = (name: `modules.${number}` | keyof ICustomizationInputs, label: string | null, placeholder: string, type: HTMLInputTypeAttribute = "text") => {
        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
            const file = e.target.files?.[0];
            if (file) {
                await getSignedUrl(file);
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
                name={name as any}
                render={({ field }) => (
                    <FormItem className='w-full'>
                        {label && (
                            <FormLabel className='text-gray-500 relative block w-fit'>
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

    const onSubmit = async (data: ICustomizationInputs) => {
        if (!data.product_id || !data.cost || !data.purchase_order_document || !data.purchased_date || !data.modules.length) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill all the required fields'
            })
            return
        }

        const product = productsList?.data.find((product) => product._id === data.product_id)
        if (!product) {
            throw new Error('Product not found')
        }
        handler(data, product.order_id)
    }

    const selectPlaceHolder = (name: "product_id" | "type", value: string) => {
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
                                            <SelectTrigger className="w-full bg-white" disabled={disableInput}>
                                                <SelectValue placeholder={selectPlaceHolder('product_id', field.value)} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    productsList?.data.map((product) => (
                                                        <SelectItem value={product._id} key={product._id}>{product.name}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cost"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel className='text-gray-500'>Cost</FormLabel>
                                    <FormControl>
                                        {renderFormField('cost', null, 'Enter Price')}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-end gap-4 w-full">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel className='text-gray-500'>Type</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full bg-white" disabled={disableInput}>
                                                <SelectValue placeholder={selectPlaceHolder("type", field.value || '')} />
                                            </SelectTrigger>
                                            <SelectContent className='bg-white'>
                                                {
                                                    Object.values(CustomizationType).map((type) => (
                                                        <SelectItem value={type} key={type}>
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
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
                        {renderFormField('purchase_order_document', 'Purchase Order Document', 'Upload Purchase Order Document', 'file')}
                    </div>
                    <div className="md:w-1/2 ">

                        <FormField
                            control={form.control}
                            name="purchased_date"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel className='text-gray-500'>Purchased Date</FormLabel>
                                    <FormControl>
                                        <DatePicker date={field.value} disabled={disableInput} onDateChange={field.onChange} placeholder='Pick end date' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="">
                        <FormLabel className='text-gray-500' >Modules</FormLabel>
                        {customizationModulesFields.map((_, index) => (
                            <div key={index} className="flex items-end relative gap-4 w-full mb-4">
                                {renderFormField(`modules.${index}`, null, "Module Name")}
                                {
                                    customizationModulesFields.length > 1 && (
                                        <Button variant='destructive' onClick={() => removeCustomizationModule(index)} className='rounded-full w-8 h-8 ' disabled={disableInput}>
                                            <X />
                                        </Button>
                                    )
                                }
                            </div>
                        ))}
                        <div className="flex justify-center mt-4">
                            <Button
                                type='button'
                                onClick={() => appendCustomizationModule()}
                                className="flex items-center justify-center gap-2 py-5 md:w-72 bg-[#E6E6E6] text-black hover:bg-black hover:text-white group"
                                disabled={disableInput}
                            >
                                <CirclePlus className='!w-6 !h-6' />
                                <Typography variant='p' className='text-black group-hover:text-white'>Add more module</Typography>
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className='w-48' disabled={isLoading || !form.formState.isDirty || disableInput} loading={{ isLoading, loader: "tailspin" }} >
                            <CircleCheck />
                            <span className='text-white'>Save Customization</span>
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CustomizationForm