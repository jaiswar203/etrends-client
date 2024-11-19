"use client"
import Typography from '@/components/ui/Typography'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SubmitHandler, useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { CircleCheck } from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { IProduct } from '@/types/product'

interface IProps {
    handler: (data: Omit<IProduct, '_id'>) => Promise<void>
    disable?: boolean
    defaultValue?: IProduct
}

const CreateProduct: React.FC<IProps> = ({ handler, disable = false, defaultValue }) => {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<Omit<IProduct, '_id'>>({
        defaultValues: {
            name: "",
            short_name: "",
            does_have_license: false,
            description: "",
        },
        ...(defaultValue && {
            values: {
                name: defaultValue.name,
                short_name: defaultValue.short_name,
                does_have_license: defaultValue.does_have_license,
                description: defaultValue.description,
            }
        })
    })

    const onSubmit: SubmitHandler<Omit<IProduct, '_id'>> = async (data) => {
        setIsLoading(true)
        try {
            await handler(data)
            setIsLoading(false)
        } catch (error) {
            console.error("Error submitting form:", error)
            setIsLoading(false)
        }
    }

    const renderFormField = (name: "name" | "short_name" | "description", label: string, placeholder: string) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className='w-full'>
                    <FormLabel className='text-gray-500'>{label}</FormLabel>
                    <FormControl>
                        <Input disabled={disable} className='bg-white' placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )

    return (
        <div className='bg-custom-gray bg-opacity-75 rounded p-4'>
            <Accordion type="single" collapsible defaultValue="product-detail">
                <AccordionItem value="product-detail">
                    <AccordionTrigger>
                        <Typography variant='h1'>Product Details</Typography>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="mt-1 p-2">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="flex items-center gap-4 w-full">
                                        {renderFormField("name", "Product Name", "Enter product name")}
                                        {renderFormField("short_name", "Short Name", "Enter short name")}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="does_have_license"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        License Required
                                                    </FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        disabled={disable}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-gray-500'>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        disabled={disable}
                                                        className='bg-white resize-none'
                                                        placeholder="Product description"
                                                        {...field}
                                                        rows={5}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={disable || !form.formState.isDirty || isLoading || !form.formState.isValid}
                                            loading={{ isLoading, loader: "tailspin" }}
                                            className='w-34'
                                        >
                                            <CircleCheck />
                                            <span className='text-white'>Save Product</span>
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

export default CreateProduct