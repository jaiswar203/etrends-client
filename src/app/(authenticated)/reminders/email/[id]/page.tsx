import ReminderEmail from '@/components/Reminder/ReminderEmail'
import React, { use } from 'react'

const Page = ({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ emailIndex: string }> }) => {
    const { id: clientId } = use(params)
    const { emailIndex } = use(searchParams)

    return <ReminderEmail id={clientId} emailIndex={Number(emailIndex)} />
}

export default Page