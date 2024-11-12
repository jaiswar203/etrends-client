import React from 'react'
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useFieldArray, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import ProductDropdown from '@/components/common/ProductDropdown'

interface OrderProps {
    title?: string
}

interface OrderDetailInputs {
    products: string[];
    base_cost: number;
    amc_rate: {
        percentage: number;
        amount: string;
    };
    status: ORDER_STATUS_ENUM;
    payment_terms: {
        name: string;
        percentage_from_base_cost: string;
        calculated_amount: number;
        date: Date;
    }[];
}

const OrderDetail: React.FC<OrderProps> = ({ title }) => {
    // Setup React Hook Form with default states
    const form = useForm<OrderDetailInputs>({
        defaultValues: {
            products: [],
            base_cost: 0,
            amc_rate: {
                percentage: 0,
                amount: "",
            },
            status: ORDER_STATUS_ENUM.ACTIVE,
            payment_terms: [],
        }
    })

    // const { fields: paymentTermsFields, append: appendPaymentTerm, remove: removePaymentTerm } = useFieldArray({
    //     control: form.control,
    //     name: "payment_terms"
    // });

    // const handleProductToggle = (productId: string) => {
    //     const currentProducts = form.getValues("products");
    //     const updatedProducts = currentProducts.includes(productId)
    //         ? currentProducts.filter(id => id !== productId)
    //         : [...currentProducts, productId];
    //     form.setValue("products", updatedProducts);
    // };

    // const addPaymentTerm = () => {
    //     appendPaymentTerm({
    //         name: "",
    //         percentage_from_base_cost: "",
    //         calculated_amount: 0,
    //         date: new Date()
    //     });
    // };

    const renderFormField = (name: keyof OrderDetailInputs | `payment_terms.${number}.${keyof OrderDetailInputs['payment_terms'][number]}`, label: string, placeholder: string, type: string = "text") => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className='w-full'>
                    <FormLabel className='text-gray-500'>{label}</FormLabel>
                    <FormControl>
                        <Input
                            className='bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                            placeholder={placeholder}
                            type={type}
                            {...field}
                            value={field.value as string}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    return (

        <div className='bg-custom-gray p-4'>
            <Accordion type="single" collapsible defaultChecked >
                <AccordionItem value={"client-detail"}>
                    <AccordionTrigger>
                        <Typography variant='h1'>{title ?? "Order Details"}</Typography>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="mt-1 p-2">
                            <Form {...form}>
                                <form className="space-y-8">
                                    <div className="flex items-start gap-4 w-full">
                                        <FormField
                                            control={form.control}
                                            name="products"
                                            render={({ field }) => (
                                                <FormItem className='w-full relative'>
                                                    <FormLabel className='text-gray-500'>Select Products</FormLabel>
                                                    <FormControl>
                                                        <ProductDropdown
                                                            isMultiSelect
                                                            onSelectionChange={(selectedProducts) => field.onChange(selectedProducts.map(String))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {renderFormField("base_cost", "Base Cost", "Base Cost of the Product", "number")}
                                    </div>

                                    <div className="mt-6">
                                        <Typography variant='h4'>Licenses</Typography>
                                    </div>
                                    <Button type='submit'>Submit</Button>
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
