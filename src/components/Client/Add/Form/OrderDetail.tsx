import React, { memo, useEffect, useState } from 'react'
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
import { IOrderObject } from '@/redux/api/order'
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
    defaultValue?: IOrderObject
    updateHandler?: (data: OrderDetailInputs) => Promise<void>
    removeAccordion?: boolean
    defaultOpen?: boolean
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

const OrderDetail: React.FC<OrderProps> = ({ title, handler, defaultValue, updateHandler, removeAccordion, defaultOpen = false }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [disableInput, setDisableInput] = useState(false);
    const [isPercentage, setIsPercentage] = useState({ amc_rate: true, customization_amc_rate: true })
    const [enableCustomization, setEnableCustomization] = useState(true)

    const [getUrlForUploadApi] = useGetUrlForUploadMutation()

    const { toast } = useToast()
    const { products } = useAppSelector(state => state.user)

    useEffect(() => {
        if (defaultValue?._id) {
            setDisableInput(true)

            if (defaultValue.customization._id)
                setEnableCustomization(true)
        }
    }, [defaultValue])

    let defaultValues = {
        products: [],
        base_cost: 0,
        amc_rate: {
            percentage: 20,
            amount: 0,
        },
        status: ORDER_STATUS_ENUM.ACTIVE,
        payment_terms: defaultValue?.payment_terms ?
            defaultValue.payment_terms.map(term => ({
                ...term,
                date: new Date(term.date)
            })) : [
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
        total_cost: 0,
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
        },
        purchased_date: new Date(),
    }

    const values = defaultValue && {
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
            cost: defaultValue.customization.cost || 0,
            modules: defaultValue.customization.modules || []
        },
        amc_start_date: new Date(defaultValue.amc_start_date),
        other_document: { title: "", url: defaultValue.other_document },
        purchase_order_document: defaultValue.purchase_order_document || "",
        training_implementation_cost: defaultValue.training_implementation_cost || 0,
        purchased_date: new Date(defaultValue.purchased_date || new Date())
    }


    const form = useForm<OrderDetailInputs & LicenseDetails>({
        defaultValues,
        ...(defaultValue && {
            values
        })
    })

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
        if (!baseCost) return
        const paymentTerms = form.getValues("payment_terms");
        paymentTerms.forEach((term, index) => {
            const percentage = term.percentage_from_base_cost || 0;
            if (!percentage) return;
            const calculatedAmount = (baseCost * percentage) / 100;
            form.setValue(`payment_terms.${index}.calculated_amount`, calculatedAmount);
        });
    };

    const recalculateAMCRate = (value: number, field: 'percentage' | 'amount') => {
        const baseCost = form.getValues("base_cost");
        if (!baseCost) return
        if (field === 'percentage') {
            const percentage = value || 0;
            const calculatedAmount = (baseCost * percentage) / 100;
            console.log({ percentage, calculatedAmount })
            form.setValue(`amc_rate.percentage`, value);
            form.setValue(`amc_rate.amount`, calculatedAmount);
        } else {
            const amount = value || 0;
            const calculatedPercentage = ((amount / baseCost) * 100).toFixed(2);
            console.log({ amount, calculatedPercentage })
            form.setValue(`amc_rate.amount`, amount);
            form.setValue(`amc_rate.percentage`, parseFloat(calculatedPercentage));
        }
    }

    const recalculateAMCRateBasedOnBaseCost = (baseCost: number) => {
        const currentAmcRate = form.getValues("amc_rate");
        const percentage = currentAmcRate.percentage || 0;
        const calculatedAmount = (baseCost * percentage) / 100;

        form.setValue("amc_rate.amount", calculatedAmount);
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

    const renderFormField = (
        name: keyof OrderDetailInputs | keyof LicenseDetails | `payment_terms.${number}.${keyof OrderDetailInputs['payment_terms'][number]}` | 'customization.cost' | `customization.modules.${number}` | "other_document.url",
        label: string | null,
        placeholder: string,
        type: string = "text"
    ) => {
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
            const value = parseFloat(e.target.value) || 0;
            const fieldName = name.toString();

            // Helper to determine which handler to use
            const getHandler = () => {
                if (fieldName.startsWith('amc_rate')) return 'amc_rate';
                if (fieldName.includes('payment_terms')) return 'payment_terms';
                return fieldName;
            };

            // Handler mapping
            const handlers = {
                base_cost: () => {
                    field.onChange(e);
                    recalculatePaymentTerms(value);
                    recalculateAMCRateBasedOnBaseCost(value);

                },
                amc_rate: () => {
                    const amcType = fieldName.split('.')[1] as 'percentage' | 'amount';
                    recalculateAMCRate(value, amcType);
                },
                payment_terms: () => {
                    const [, index, term] = fieldName.split('.');
                    if (['percentage_from_base_cost', 'calculated_amount'].includes(term))
                        handlePaymentTermChange(parseInt(index), value, term as 'percentage_from_base_cost' | 'calculated_amount');
                    else
                        field.onChange(e);

                }
            };

            const handler = handlers[getHandler() as keyof typeof handlers];
            if (handler) {
                handler();
            } else {
                field.onChange(e);
            }
        };

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
            const file = e.target.files?.[0];
            if (file) {
                await getSignedUrl(file, name as keyof OrderDetailInputs);
                field.onChange(e);
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

                        {(type === "file" && field.value && disableInput) ? (
                            renderFilePreview(field)
                        ) : (
                            <FormControl>
                                <Input
                                    className='bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                    placeholder={placeholder}
                                    disabled={disableInput}
                                    type={type}
                                    {...field}
                                    value={(type === 'number' && field.value === 0) ? '' : (type === 'file' ? undefined : field.value as string)}
                                    onChange={(e) => type === 'file' ? handleFileChange(e, field) : handleInputChange(e, field)}
                                />
                            </FormControl>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    // Create a function which validates and transform the data to correct types as per interface
    const transformFormData = (data: any) => {
        // Check required fields
        if (!data.products || data.products.length === 0) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please select at least one product"
            });
            return;
        }

        if (!data.base_cost) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Base cost is required"
            });
            return;
        }

        // Check payment terms
        if (!data.payment_terms || !data.payment_terms.length) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "At least one payment term is required"
            });
            return;
        }

        // Validate payment terms data
        for (const term of data.payment_terms) {
            if (!term.name || !term.percentage_from_base_cost || !term.calculated_amount || !term.date) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: "All payment term fields are required"
                });
                return;
            }
        }

        // Return transformed data if all validations pass
        return {
            ...data,
            base_cost: Number(data.base_cost) || 0,
            amc_rate: {
                percentage: Number(data.amc_rate?.percentage) || 0,
                amount: Number(data.amc_rate?.amount) || 0
            },
            payment_terms: data.payment_terms.map((term: any) => ({
                ...term,
                percentage_from_base_cost: Number(term.percentage_from_base_cost) || 0,
                calculated_amount: Number(term.calculated_amount) || 0,
                date: term.date ? new Date(term.date) : new Date()
            })),
            agreement_date: {
                start: data.agreement_date?.start ? new Date(data.agreement_date.start) : undefined,
                end: data.agreement_date?.end ? new Date(data.agreement_date.end) : undefined
            },
            amc_start_date: data.amc_start_date ? new Date(data.amc_start_date) : undefined,
            customization: {
                cost: Number(data.customization?.cost) || 0,
                amc_rate: {
                    percentage: Number(data.customization?.amc_rate?.percentage) || 0,
                    amount: Number(data.customization?.amc_rate?.amount) || 0
                },
                modules: data.customization?.modules || []
            },
            license_details: {
                cost_per_license: Number(data.cost_per_license) || 0,
                total_license: Number(data.total_license) || 0
            },
            training_implementation_cost: Number(data.training_implementation_cost) || 0
        };
    };

    const onSubmit: SubmitHandler<OrderDetailInputs> = async (data) => {
        setIsLoading(true)
        const transformedData = transformFormData(data);

        if (!transformedData) {
            setIsLoading(false);
            return;
        }

        try {
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
            setDisableInput(true)
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

    const calculateTotalCost = () => {
        // Use parseFloat to handle string inputs and ensure numeric values
        const baseCost = parseFloat(form.getValues("base_cost")?.toString() || "0");
        const trainingCost = parseFloat(form.getValues("training_implementation_cost")?.toString() || "0");
        const licenseCost = parseFloat(form.getValues("cost_per_license")?.toString() || "0");
        const totalLicense = parseFloat(form.getValues("total_license")?.toString() || "0");
        const customizationCost = parseFloat(form.getValues("customization.cost")?.toString() || "0");

        // Handle negative values by using Math.max
        const sanitizedBaseCost = Math.max(0, baseCost);
        const sanitizedTrainingCost = Math.max(0, trainingCost);
        const sanitizedLicenseCost = Math.max(0, licenseCost);
        const sanitizedTotalLicense = Math.max(0, totalLicense);
        const sanitizedCustomizationCost = Math.max(0, customizationCost);

        // Calculate total cost with checks for NaN
        const licenseTotalCost = sanitizedLicenseCost * sanitizedTotalLicense;
        const totalCost = sanitizedBaseCost +
            sanitizedTrainingCost +
            (isNaN(licenseTotalCost) ? 0 : licenseTotalCost) +
            sanitizedCustomizationCost;

        // Return 0 if calculation results in NaN or negative value
        return isNaN(totalCost) ? 0 : Math.max(0, totalCost);
    }

    const amcRateAfterCustomization = () => {
        const baseCost = parseFloat(form.getValues("base_cost")?.toString() || "0");
        const customizationCost = parseFloat(form.getValues("customization.cost")?.toString() || "0");
        const amcRate = form.getValues("amc_rate");
        const amcRateAfterCustomization = ((baseCost + customizationCost) * amcRate.percentage) / 100;
        return isNaN(amcRateAfterCustomization) ? 0 : Math.max(0, amcRateAfterCustomization);
    }

    // use useEffect to update the total cost whenever the base cost, training cost, license cost, total license or customization cost changes
    useEffect(() => {
        form.setValue("total_cost", calculateTotalCost());
    }, [
        form.watch("base_cost"),
        form.watch("training_implementation_cost"),
        form.watch("cost_per_license"),
        form.watch("total_license"),
        form.watch("customization.cost")
    ]);

    const finalJSX = (
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
                    <div className="flex items-end gap-4 w-full">
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

                    <div className="flex items-start gap-4 w-full mt-4">
                        <FormField
                            control={form.control}
                            name="amc_rate"
                            render={({ field }) => (
                                <FormItem className='w-full relative'>
                                    <FormLabel className='text-gray-500'>AMC Rate (₹{form.watch("amc_rate.amount")})</FormLabel>
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

                    <div className="flex items-start gap-4 w-full">
                        {renderFormField("training_implementation_cost", "Training & Implementation Cost", "Training & Implementation Cost", "number")}

                        <FormItem className='w-full'>
                            <FormLabel className='text-gray-500 !mb-2'>Total Cost</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    value={calculateTotalCost()}
                                    disabled
                                    className="bg-white !m-0"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </div>
                    <div className="flex items-start gap-4 w-full">
                        <FormField
                            control={form.control}
                            name="purchased_date"
                            render={({ field }) => (
                                <FormItem className='w-full relative'>
                                    <FormLabel className='text-gray-500'>Order Purchased Date</FormLabel>
                                    <FormControl>
                                        <DatePicker date={field.value} onDateChange={field.onChange} disabled={disableInput} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="w-full"></div>
                    </div>


                    {getSelectedProducts().some(product => product.does_have_license) && (
                        <div className="mt-6">
                            <Typography variant='h3'>Licenses</Typography>
                            <div className="flex items-end md:flex-nowrap flex-wrap gap-4 w-full mt-2">
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
                            <Separator className='bg-gray-300 w-full h-[1px] mt-4' />
                        </div>
                    )}


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
                                        <FormItem className='w-full relative'>
                                            <FormLabel className='text-gray-500'>AMC Rate After Customozation</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    value={amcRateAfterCustomization()}
                                                    disabled
                                                    className="bg-white !m-0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
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
                            <div className="flex items-end gap-4 w-full mt-6">
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
                            <div className="flex items-end gap-4 w-full mt-6">
                                <FormField
                                    control={form.control}
                                    name={`amc_start_date`}

                                    render={({ field }) => (
                                        <FormItem className='w-full relative'>
                                            <FormLabel className='text-gray-500'>AMC Start Date</FormLabel>
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


                    <div className="flex justify-end">
                        <Button type="submit" disabled={!form.formState.isDirty || disableInput || isLoading || !form.formState.isValid} loading={{ isLoading, loader: "tailspin" }} className='w-36'>
                            <CircleCheck />
                            <span className='text-white'>Save changes</span>
                        </Button>
                    </div>
                </form>

            </Form>
        </div>
    )

    const renderContent = () => {
        if (removeAccordion) {
            return finalJSX;
        }

        return (
            <Accordion type="single" collapsible defaultValue={defaultOpen ? "client-detail" : undefined}>
                <AccordionItem value="client-detail">
                    <AccordionTrigger>
                        <Typography variant='h1'>{title ?? "Order Details"}</Typography>
                    </AccordionTrigger>
                    <AccordionContent>
                        {finalJSX}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    };

    return (
        <div className='bg-custom-gray bg-opacity-75 rounded p-4'>
            {renderContent()}
        </div>
    )
}

export default memo(OrderDetail)