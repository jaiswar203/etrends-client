import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Typography from '@/components/ui/Typography'
import { ORDER_STATUS_ENUM } from '@/types/client'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import ProductDropdown from '@/components/common/ProductDropdown'
import { AmountInput } from '@/components/ui/AmountInput'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DatePicker from '@/components/ui/datepicker'
import { CircleCheck, CirclePlus, CircleX, Edit, Eye, X } from 'lucide-react'
import { Separator } from '@radix-ui/react-separator'
import { Switch } from '@/components/ui/switch'
import { useGetUrlForUploadMutation } from '@/redux/api/app'
import axios from "axios"
import { v4 } from "uuid"
import { useToast } from '@/hooks/use-toast'
import { LicenseDetails, OrderDetailInputs } from '@/types/order'
import { useAppSelector } from '@/redux/hook'
import { IFirstOrderObject } from '@/redux/api/order'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link'

interface OrderProps {
    title?: string
    handler: (data: OrderDetailInputs) => Promise<void>
    defaultValue?: IFirstOrderObject
    updateHandler?: (data: OrderDetailInputs) => Promise<void>
    disable?: boolean
    newOrder?: boolean
}

const StatusOptions = [
    {
        id: 0,
        label: () =>
            <div className='flex justify-start items-center gap-2'>
                <span className="bg-green-500 w-2.5 h-2.5 rounded-full"></span>
                <span>Active</span>
            </div>
        ,
        value: ORDER_STATUS_ENUM.ACTIVE,
    },
    {
        id: 1,
        label: () => < div className='flex justify-start items-center gap-2' >
            <span className="bg-red-500 w-2.5 h-2.5 rounded-full"></span>
            <span>Inactive</span>
        </div>,
        value: ORDER_STATUS_ENUM.INACTIVE,
    },
]

const OrderDetail: React.FC<OrderProps> = ({ title, handler, defaultValue, updateHandler }) => {
    const [isPercentage, setIsPercentage] = useState({ amc_rate: true, customization_amc_rate: true })
    const [enableCustomization, setEnableCustomization] = useState(true)

    const [getUrlForUploadApi] = useGetUrlForUploadMutation()

    const [isLoading, setIsLoading] = useState(false)

    const { toast } = useToast()

    const { products } = useAppSelector(state => state.user)

    const [disableInput, setDisableInput] = useState(false);

    useEffect(() => {
        // If first order is olready created than make this component editable 
        if (defaultValue?._id) {
            setDisableInput(true)

            if (defaultValue.customization._id)
                setEnableCustomization(true)

        }

    }, [defaultValue])

    const form = useForm<OrderDetailInputs & LicenseDetails>({
        defaultValues: {
            products: [],
            base_cost: 0,
            amc_rate: {
                percentage: 0,
                amount: 0,
            },
            status: ORDER_STATUS_ENUM.ACTIVE,
            payment_terms: [
                {
                    name: "UAT",
                    percentage_from_base_cost: 0,
                    calculated_amount: 0,
                    date: undefined
                },
                {
                    name: "Deployment",
                    percentage_from_base_cost: 0,
                    calculated_amount: 0,
                    date: undefined
                },
                {
                    name: "Signoff",
                    percentage_from_base_cost: 0,
                    calculated_amount: 0,
                    date: undefined
                },
            ],
            agreement_document: "",
            agreement_date: {
                start: undefined,
                end: undefined
            },
            training_implementation_cost: 0,
            license: "",
            cost_per_license: 0,
            total_license: 0,
            customization: {
                cost: 0,
                amc_rate: {
                    percentage: 0,
                    amount: 0
                },
                modules: ["Module 1"]
            }
        },
        ...(defaultValue && {
            values: {
                products: defaultValue.products || [],
                base_cost: defaultValue.base_cost,
                amc_rate: defaultValue.amc_rate,
                status: defaultValue.status as ORDER_STATUS_ENUM,
                payment_terms: defaultValue.payment_terms.map(term => ({ ...term, date: new Date(term.date) })),
                agreement_document: defaultValue.agreement_document,
                agreement_date: defaultValue.agreement_date,
                cost_per_license: defaultValue.license?.rate.amount || 0,
                total_license: defaultValue.license?.total_license || 0,
                customization: {
                    amc_rate: {
                        percentage: defaultValue?.customization?.amc_rate?.percentage || 0,
                        amount: defaultValue?.customization?.amc_rate?.amount || 0
                    },
                    cost: defaultValue.customization.cost || 0,
                    modules: defaultValue.customization.modules || []
                },
                deployment_date: new Date(defaultValue.deployment_date),
                other_document: { title: "", url: defaultValue.other_document },
                purchase_order_document: defaultValue.purchase_order_document || "",
                training_implementation_cost: defaultValue.training_implementation_cost || 0
            }
        })
    })

    useEffect(() => {
        if (defaultValue?._id) {
            form.setValue('customization.amc_rate.percentage', defaultValue.customization.amc_rate.percentage)
        }
    }, [defaultValue])

    const { fields: paymentTermsFields, append: appendPaymentTerm, remove: removePaymentTerm } = useFieldArray({
        control: form.control,
        name: "payment_terms"
    });

    // Create useFieldArray for customization modules
    const customizationModulesFields = form.watch("customization.modules")

    const appendCustomizationModule = () => {
        form.setValue("customization.modules", [...customizationModulesFields, ""])
    }

    const removeCustomizationModule = (index: number) => {
        form.setValue("customization.modules", customizationModulesFields.filter((_, i) => i !== index))
    }

    const addPaymentTerm = () => {
        appendPaymentTerm({
            name: "",
            percentage_from_base_cost: 0,
            calculated_amount: 0,
            date: new Date()
        });
    };

    const handlePaymentTermChange = (index: number, value: number, field: 'percentage_from_base_cost' | 'calculated_amount') => {
        const baseCost = form.getValues("base_cost");

        if (field === 'percentage_from_base_cost') {
            const percentage = value || 0;
            const calculatedAmount = (baseCost * percentage) / 100;
            form.setValue(`payment_terms.${index}.percentage_from_base_cost`, value);
            form.setValue(`payment_terms.${index}.calculated_amount`, calculatedAmount);
        } else {
            const amount = value || 0;
            const calculatedPercentage = ((amount / baseCost) * 100).toFixed(2);
            form.setValue(`payment_terms.${index}.calculated_amount`, amount);
            form.setValue(`payment_terms.${index}.percentage_from_base_cost`, parseFloat(calculatedPercentage));
        }
    };

    // Function to recalculate all payment terms
    const recalculatePaymentTerms = (baseCost: number) => {
        const paymentTerms = form.getValues("payment_terms");
        paymentTerms.forEach((term, index) => {
            const percentage = term.percentage_from_base_cost || 0;
            if (!percentage) return;
            const calculatedAmount = (baseCost * percentage) / 100;
            form.setValue(`payment_terms.${index}.calculated_amount`, calculatedAmount);
        });
    };

    const getSignedUrl = async (file: File, field: keyof OrderDetailInputs) => {
        try {
            const ext = file.name.split('.').pop();
            const filename = `${v4()}.${ext}`;
            const { data: uploadUri } = await getUrlForUploadApi(filename).unwrap()

            await axios.put(uploadUri, file, {
                headers: {
                    'Content-Type': file.type
                }
            })
            form.setValue(field, filename)
            
            toast({
                variant: "success",
                title: "File Upload Successful",
                description: `The file ${file.name} has been uploaded successfully.`,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "File Upload Failed",
                description: `The file ${file.name} could not be uploaded. Please try again.`,
            });

            console.error(error)
        }
    }

    const renderFormField = (name: keyof OrderDetailInputs | keyof LicenseDetails | `payment_terms.${number}.${keyof OrderDetailInputs['payment_terms'][number]}` | 'customization.cost' | 'customization.amc_rate.percentage' | 'customization.amc_rate.amount' | `customization.modules.${number}` | "other_document.url", label: string | null, placeholder: string, type: string = "text") => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className='w-full'>
                    {label && <FormLabel className='text-gray-500 relative'>
                        {label}
                        {(type === "file" && field.value && !disableInput) && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link passHref href={field.value as string} target='_blank'>
                                            <Button variant='outline' className='rounded-full w-8 h-8 ml-2 absolute -top-3 -right-10' type='button'>
                                                <Eye className='w-1' />
                                            </Button>
                                        </Link>
                                        
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        View File
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </FormLabel>}
                    {
                        (type === "file" && field.value && disableInput) ? (
                            <div className="flex items-center gap-2">
                                <Link passHref href={field.value as string} target='_blank'>
                                    <Button variant='default' type='button'>
                                        View
                                    </Button>
                                </Link>
                            </div>
                        ) :
                            <FormControl>
                                <Input
                                    className='bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                    placeholder={placeholder}
                                    disabled={disableInput}
                                    type={type}
                                    {...field}
                                    value={(type === 'number' && field.value === 0) ? '' : (type === 'file' ? undefined : field.value as string)}
                                    onChange={(e) => {
                                        if (type === 'file' && e.target.files?.length) {
                                            const file = e.target.files[0];
                                            if (file) {
                                                getSignedUrl(file, name as keyof OrderDetailInputs);
                                            }
                                        } else if (name === 'base_cost') {
                                            field.onChange(e);
                                            recalculatePaymentTerms(parseFloat(e.target.value) || 0);
                                        } else if (name.toString().includes('payment_terms')) {
                                            const index = parseInt(name.toString().split('.')[1]);
                                            if (name.toString().includes('percentage_from_base_cost')) {
                                                handlePaymentTermChange(index, parseFloat(e.target.value), 'percentage_from_base_cost');
                                            } else if (name.toString().includes('calculated_amount')) {
                                                handlePaymentTermChange(index, parseFloat(e.target.value), 'calculated_amount');
                                            }
                                        } else {
                                            field.onChange(e);
                                        }
                                    }}
                                />
                            </FormControl>
                    }
                    <FormMessage />
                </FormItem >
            )}
        />
    );


    // Create a function which validates and transform the data to correct types as per interface
    const transformFormData = (data: any): OrderDetailInputs => {
        return {
            ...data,
            base_cost: Number(data.base_cost),
            amc_rate: {
                percentage: Number(data.amc_rate.percentage),
                amount: Number(data.amc_rate.amount)
            },
            payment_terms: data.payment_terms.map((term: any) => ({
                ...term,
                percentage_from_base_cost: Number(term.percentage_from_base_cost),
                calculated_amount: Number(term.calculated_amount),
                date: new Date(term.date)
            })),
            agreement_date: {
                start: data.agreement_date.start ? new Date(data.agreement_date.start) : undefined,
                end: data.agreement_date.end ? new Date(data.agreement_date.end) : undefined
            },
            deployment_date: data.deployment_date ? new Date(data.deployment_date) : undefined,
            customization: {
                cost: Number(data.customization.cost),
                amc_rate: {
                    percentage: Number(data.customization.amc_rate.percentage),
                    amount: Number(data.customization.amc_rate.amount)
                },
                modules: data.customization.modules
            },
            license_details: {
                cost_per_license: Number(data.cost_per_license),
                total_license: Number(data.total_license)
            },
        };
    };

    const onSubmit: SubmitHandler<OrderDetailInputs> = async (data) => {
        setIsLoading(true)
        try {
            const transformedData = transformFormData(data);
            if (defaultValue?._id && updateHandler) {
                await updateHandler({ ...transformedData })
                toast({
                    variant: "success",
                    title: "Order Updated",
                })
            } else {
                await handler({ ...transformedData })
                toast({
                    variant: "success",
                    title: "Order Created",
                })
            }
            setIsLoading(false)
            setDisableInput(false)
        } catch (error: any) {
            setIsLoading(false)
            toast({
                variant: "destructive",
                title: "Error Occured while updating the order",
                description: error?.message || `Please try again and if error still persist contact the developer`
            })
        }
    }

    if (!products) return null

    const getSelectedProducts = () => {
        const selectedProducts = form.watch("products") || [];

        return products.filter(product => selectedProducts.includes(product._id))
    }

    return (
        <div className='bg-custom-gray bg-opacity-75 rounded p-4'>
            <Accordion type="single" collapsible defaultChecked >
                <AccordionItem value={"client-detail"}>
                    <AccordionTrigger>
                        <Typography variant='h1'>{title ?? "Order Details"}</Typography>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="mt-1 p-2">
                            {defaultValue?._id && (
                                <div className="mb-2 flex justify-end">
                                    <Button className={`w-36 justify-between ${!disableInput ? "bg-destructive hover:bg-destructive" : ""}`} onClick={() => setDisableInput(prev => !prev)}>
                                        {disableInput ? (
                                            <>
                                                <Edit />
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
                            <Form {...form}>
                                <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                                    <div className="flex items-start gap-4 w-full">
                                        <FormField
                                            control={form.control}
                                            name="products"
                                            render={({ field }) => (
                                                <FormItem className='w-full relative'>
                                                    <FormLabel className='text-gray-500'>Select Products</FormLabel>
                                                    <FormControl>
                                                        <ProductDropdown
                                                            values={defaultValue?.products || []}
                                                            isMultiSelect
                                                            disabled={disableInput}
                                                            onSelectionChange={(selectedProducts) => field.onChange(selectedProducts.map(product => product._id))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {renderFormField("base_cost", "Base Cost", "Base Cost of the Product", "number")}
                                    </div>

                                    {renderFormField("training_implementation_cost", "Training & Implementation Cost", "Training & Implementation Cost", "number")}

                                    {getSelectedProducts().some(product => product.does_have_license) && (
                                        <div className="mt-6">
                                            <Typography variant='h4'>Licenses</Typography>
                                            <div className="flex items-start md:flex-nowrap flex-wrap gap-4 w-full mt-2">
                                                {
                                                    form.watch("products").length > 1 && (
                                                        <FormField
                                                            control={form.control}
                                                            name="license"
                                                            render={({ field }) => (
                                                                <FormItem className='w-full relative'>
                                                                    <FormLabel className='text-gray-500'>Select Product</FormLabel>
                                                                    <FormControl>
                                                                        <ProductDropdown
                                                                            filterProducts={(product) => product.does_have_license}
                                                                            onSelectionChange={(selectedProducts) => selectedProducts.length && selectedProducts[0] ? field.onChange(selectedProducts[0]._id) : null}
                                                                            isMultiSelect={false}
                                                                            disabled={disableInput}
                                                                            values={
                                                                                defaultValue?.license ?
                                                                                    [defaultValue.products.find(product => product === defaultValue.license.product_id)]
                                                                                        .filter((product): product is string => product !== undefined)
                                                                                    :
                                                                                    []
                                                                            }
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                }
                                                {renderFormField("cost_per_license", "Cost Per Licencse", "Cost Per Licencse", "number")}
                                                {renderFormField("total_license", "Enter Total Number of License", "Total number of Licenses ", "number")}

                                            </div>
                                        </div>
                                    )}
                                    <Separator className='bg-gray-300 w-full h-[1px] mt-4' />

                                    <div className="flex items-start gap-4 w-full mt-4">
                                        <FormField
                                            control={form.control}
                                            name="amc_rate"

                                            render={({ field }) => (
                                                <FormItem className='w-full relative'>
                                                    <FormLabel className='text-gray-500'>AMC Rate</FormLabel>
                                                    <FormControl>
                                                        <AmountInput
                                                            className='bg-white'
                                                            placeholder='AMC Rate'
                                                            disabled={disableInput}
                                                            defaultInputValue={{
                                                                percentage: field.value.percentage,
                                                                value: field.value.amount
                                                            }}
                                                            onModeChange={(isPercentage) => setIsPercentage(prev => ({ ...prev, amc_rate: isPercentage }))}
                                                            onValueChange={(value: number | null) => {
                                                                if (!value) return;
                                                                const baseCost = form.getValues("base_cost");
                                                                if (isPercentage.amc_rate) {
                                                                    const percentage = parseFloat(value.toString()) || 0;
                                                                    const calculatedAmount = (baseCost * percentage) / 100;
                                                                    field.onChange({
                                                                        percentage: percentage,
                                                                        amount: calculatedAmount.toString()
                                                                    });
                                                                    setIsPercentage({ ...isPercentage, amc_rate: true })
                                                                } else {
                                                                    const amount = parseFloat(value.toString()) || 0;
                                                                    const calculatedPercentage = (amount / baseCost) * 100;
                                                                    field.onChange({
                                                                        percentage: calculatedPercentage,
                                                                        amount: value
                                                                    });
                                                                    setIsPercentage({ ...isPercentage, amc_rate: false })
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status"

                                            render={({ field }) => (
                                                <FormItem className='w-full relative'>
                                                    <FormLabel className='text-gray-500'>Order Status</FormLabel>
                                                    <FormControl>
                                                        <Select defaultValue={ORDER_STATUS_ENUM.ACTIVE} onValueChange={field.onChange} disabled={disableInput}>
                                                            <SelectTrigger className="w-full bg-white">
                                                                <SelectValue>{
                                                                    form.watch("status") === ORDER_STATUS_ENUM.ACTIVE ?
                                                                        <div className='flex justify-start items-center gap-2'>
                                                                            <span className="bg-green-500 w-2.5 h-2.5 rounded-full"></span>
                                                                            <span>Active</span>
                                                                        </div> :
                                                                        <div className='flex justify-start items-center gap-2'>
                                                                            <span className="bg-red-500 w-2.5 h-2.5 rounded-full"></span>
                                                                            <span>Inactive</span>
                                                                        </div>
                                                                }</SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent className="w-full">
                                                                {StatusOptions.map((status) => (
                                                                    <SelectItem key={status.value} value={status.value}>
                                                                        {status.label()}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                    </div>

                                    <div className="mt-6">
                                        <Typography variant='h3'>Payment Terms</Typography>
                                        <div className="mt-2">
                                            {paymentTermsFields.map((paymentTerm, index) => (
                                                <div key={paymentTerm.id} className="flex items-center relative gap-4 w-full mb-4">
                                                    {renderFormField(`payment_terms.${index}.name`, null, "Name of the Payment Term")}
                                                    {renderFormField(`payment_terms.${index}.percentage_from_base_cost`, null, "Percentage from Base Cost", "number")}
                                                    {renderFormField(`payment_terms.${index}.calculated_amount`, null, "Amount(Auto Calculated)", "number")}
                                                    <FormField
                                                        control={form.control}

                                                        name={`payment_terms.${index}.date`}
                                                        render={({ field }) => (
                                                            <FormItem className='w-full relative'>
                                                                <FormControl>
                                                                    <DatePicker date={field.value} onDateChange={field.onChange} placeholder='Pick a Date' disabled={disableInput} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Button variant='destructive' onClick={() => removePaymentTerm(index)} className='rounded-full w-8 h-8 ' disabled={disableInput}>
                                                        <X />
                                                    </Button>

                                                </div>
                                            ))}
                                            <div className="flex justify-center mt-4">
                                                <Button
                                                    type='button'
                                                    disabled={disableInput}
                                                    onClick={addPaymentTerm}
                                                    className="flex items-center justify-center gap-2 py-5 md:w-72 bg-[#E6E6E6] text-black hover:bg-black hover:text-white group"
                                                >
                                                    <CirclePlus className='!w-6 !h-6' />
                                                    <Typography variant='p' className='text-black group-hover:text-white'>Add more terms</Typography>
                                                </Button>
                                            </div>
                                            <Separator className='bg-gray-300 w-full h-[1px] mt-4' />
                                            <div className="flex items-start gap-4 w-full mt-6">
                                                {renderFormField("agreement_document", "Agreement Document", "", "file")}

                                                <div className="flex items-start justify-between gap-4 w-full">
                                                    <FormField
                                                        control={form.control}
                                                        name={`agreement_date.start`}

                                                        render={({ field }) => (
                                                            <FormItem className='w-full relative'>
                                                                <FormLabel className='text-gray-500'>Agreement Start Date</FormLabel>
                                                                <FormControl>
                                                                    <DatePicker date={field.value} onDateChange={field.onChange} placeholder='Pick a Date' disabled={disableInput} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`agreement_date.end`}
                                                        render={({ field }) => (
                                                            <FormItem className='w-full relative'>
                                                                <FormLabel className='text-gray-500'>Agreement End Date</FormLabel>
                                                                <FormControl>
                                                                    <DatePicker date={field.value} onDateChange={field.onChange} placeholder='Pick a Date' disabled={disableInput} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4 w-full mt-6">
                                                <FormField
                                                    control={form.control}
                                                    name={`deployment_date`}

                                                    render={({ field }) => (
                                                        <FormItem className='w-full relative'>
                                                            <FormLabel className='text-gray-500'>Deployment Start Date</FormLabel>
                                                            <FormControl>
                                                                <DatePicker date={field.value} onDateChange={field.onChange} placeholder='Pick a Date' disabled={disableInput} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex items-start justify-between gap-4 w-full">
                                                    {renderFormField("purchase_order_document", "PO Document", "", "file")}
                                                    {renderFormField("other_document.url", "Other Document", "", "file")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-center gap-4">
                                            <Typography variant='h3'>Customization</Typography>
                                            <Switch checked={enableCustomization} onCheckedChange={(val) => setEnableCustomization(val)} disabled={disableInput} />
                                        </div>
                                        {
                                            enableCustomization && (
                                                <div className="mt-2">
                                                    <div className="flex items-start gap-4 w-full">
                                                        {renderFormField("customization.cost", "Cost of Customization", "Enter customization cost which will add up in the Total Cost", "number")}
                                                        <FormField
                                                            control={form.control}
                                                            name="customization.amc_rate"
                                                            render={({ field }) => (
                                                                <FormItem className='w-full relative'>
                                                                    <FormLabel className='text-gray-500'>AMC Rate</FormLabel>
                                                                    <FormControl>
                                                                        <AmountInput
                                                                            className='bg-white'
                                                                            placeholder='AMC Rate'
                                                                            defaultInputValue={{
                                                                                percentage: field.value.percentage,
                                                                                value: field.value.amount
                                                                            }}
                                                                            onModeChange={(isPercentage) => setIsPercentage(prev => ({ ...prev, customization_amc_rate: isPercentage }))}
                                                                            onValueChange={(value: number | null) => {
                                                                                if (!value) return;

                                                                                // Get the customization cost
                                                                                const customizationCost = form.getValues("customization.cost") || 0;

                                                                                if (isPercentage.customization_amc_rate) {
                                                                                    // If percentage mode
                                                                                    const percentage = parseFloat(value.toString());
                                                                                    const calculatedAmount = (customizationCost * percentage) / 100;

                                                                                    form.setValue("customization.amc_rate", {
                                                                                        percentage: percentage,
                                                                                        amount: calculatedAmount
                                                                                    });
                                                                                } else {
                                                                                    // If amount mode
                                                                                    const amount = parseFloat(value.toString());
                                                                                    const calculatedPercentage = customizationCost > 0
                                                                                        ? (amount / customizationCost) * 100
                                                                                        : 0;

                                                                                    form.setValue("customization.amc_rate", {
                                                                                        percentage: calculatedPercentage,
                                                                                        amount: amount
                                                                                    });
                                                                                }
                                                                            }}
                                                                            disabled={disableInput}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                    </div>

                                                    <div className="mt-4">
                                                        <FormLabel className='text-gray-500' >Modules</FormLabel>
                                                        <div className="mt-2">

                                                            {customizationModulesFields.map((_, index) => (
                                                                <div key={index} className="flex items-end relative gap-4 w-full mb-4">
                                                                    {renderFormField(`customization.modules.${index}`, null, "Module Name")}
                                                                    {
                                                                        customizationModulesFields.length > 1 && (
                                                                            <Button variant='destructive' onClick={() => removeCustomizationModule(index)} className='rounded-full w-8 h-8 '>
                                                                                <X />
                                                                            </Button>
                                                                        )
                                                                    }
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-center mt-4">
                                                            <Button
                                                                type='button'
                                                                disabled={disableInput}
                                                                onClick={() => appendCustomizationModule()}
                                                                className="flex items-center justify-center gap-2 py-5 md:w-72 bg-[#E6E6E6] text-black hover:bg-black hover:text-white group"
                                                            >
                                                                <CirclePlus className='!w-6 !h-6' />
                                                                <Typography variant='p' className='text-black group-hover:text-white'>Add more module</Typography>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={!form.formState.isDirty || disableInput || isLoading || !form.formState.isValid} loading={{ isLoading, loader: "tailspin" }} className='w-36'>
                                            <CircleCheck />
                                            <span className='text-white'>Save changes</span>
                                        </Button>
                                    </div>
                                </form>

                            </Form>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default OrderDetail
