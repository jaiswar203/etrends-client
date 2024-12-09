import { HTMLInputTypeAttribute } from "react";
import { FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";

export const renderDisabledInput = (label: string, value: any, type: HTMLInputTypeAttribute = "text") => {
    return (
        <FormItem className='w-full mb-4 md:mb-4 block'>
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
