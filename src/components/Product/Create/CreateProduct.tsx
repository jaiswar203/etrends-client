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
import { CircleCheck, CircleX, Pencil } from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { IProduct } from '@/types/product'
import { toast } from '@/hooks/use-toast'
interface IProps {
    handler: (data: IProductInputs) => Promise<void>
    disable?: boolean
    defaultValue?: IProduct,
    removeAccordion?: boolean
}

export type IProductInputs = Omit<IProduct, '_id'>

const CreateProduct: React.FC<IProps> = ({ handler, disable = false, defaultValue, removeAccordion }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [disableInput, setDisableInput] = useState(disable)

    const form = useForm<IProductInputs>({
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

    const onSubmit: SubmitHandler<IProductInputs> = async (data) => {
        setIsLoading(true)
        // Check if any required field empty and use toast to show error message
        if (!data.name || !data.short_name || !data.description) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please fill all the required fields"
            })
            setIsLoading(false)
            return
        }
        try {
            await handler(data)
            setIsLoading(false)
        } catch (error) {
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
                        <Input disabled={disableInput} className='bg-white' placeholder={placeholder} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )

    const finalJSX = (
        <div className="mt-1 p-2 w-full">
            <div className="flex items-center justify-between w-full mb-4">
                <Typography variant='h2'>Product Details</Typography>
                <Button className={`w-36 justify-between ${!disableInput ? "bg-destructive hover:bg-destructive" : ""}`} onClick={() => setDisableInput(prev => !prev)}>
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
                                        disabled={disableInput}
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
                                        disabled={disableInput}
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
                            disabled={disableInput || !form.formState.isDirty || isLoading || !form.formState.isValid}
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
    )

    return (
        <div className='bg-custom-gray bg-opacity-75 rounded p-4'>
            {
                removeAccordion ? finalJSX : (
                    <Accordion type="single" collapsible defaultValue="product-detail">
                        <AccordionItem value="product-detail">
                            <AccordionTrigger>
                                <Typography variant='h1'>Product Details</Typography>
                            </AccordionTrigger>
                            <AccordionContent>
                                {finalJSX}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )
            }
        </div>
    )
}

export default CreateProduct