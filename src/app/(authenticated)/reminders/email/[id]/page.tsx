import ReminderEmail from '@/components/Reminder/ReminderEmail'
import React from 'react'

const Page = async ({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: { emailIndex: string } }) => {
    const clientId = (await params).id
    const emailIndex = (await searchParams).emailIndex

    return <ReminderEmail id={clientId} emailIndex={Number(emailIndex)} />
}

export default Page