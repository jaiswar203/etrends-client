"use client"
import { REMINDER_TEMPLATES, useGetReminderByIdQuery } from '@/redux/api/reminder'
import React from 'react'
import Loading from '../ui/loading'
import ReminderAMCDetail from './ReminderAMCDetail'
import { useAppSelector } from '@/redux/hook'
import AgreementExpiryDetails from './ReminderAgreementDetail'

interface IProps {
    id: string
}

const ReminderDetail: React.FC<IProps> = ({ id }) => {
    const { data } = useGetReminderByIdQuery(id)
    const products = useAppSelector((state) => state.user.products)

    if (!data?.data) return <Loading />

    const reminder = data?.data

    const getProductNames = (productIds: string[]) => {
        if (!products) return ""
        return productIds.map((id) => {
            const product = products.find((product) => product._id === id)
            return product?.name || ""
        }).join(", ")
    }
    return (
        <div className="">
            {
                reminder.template === REMINDER_TEMPLATES.SEND_AGREEMENT_EXPIRY_REMINDER ? (
                    <AgreementExpiryDetails
                        clientName={reminder?.client.name || ""}
                        productName={getProductNames(reminder.order.products) || ""}
                        document={reminder?.context.agreement?.document || ""}
                        contacts={reminder?.client.point_of_contacts || []}
                        daysUntilExpiry={reminder?.context.agreement.expiry || 0}
                        orderLink={`/purchases/${reminder.order._id}?type=order&client=${reminder.client._id}`}
                        clientId={reminder?.client._id || ""}
                        key={reminder._id}
                        reminderId={reminder._id}
                        expiryDate={reminder?.context.agreement.expiryDate || ""}
                    />
                ) :
                    <ReminderAMCDetail
                        reminderId={reminder._id}
                        clientName={reminder?.client.name || ""}
                        productName={getProductNames(reminder?.order?.products) || ""}
                        amcCycle={reminder?.context.amc.cycle || ""}
                        amcAmount={reminder?.context.amc.amount || ""}
                        amcDueDate={reminder?.context.amc.date || ""}
                        overduedays={reminder?.context.amc.overdue || 0}
                        upcomingDays={reminder?.context.amc.upcomingDays || 0}
                        contacts={reminder?.client.point_of_contacts || []}
                        amcLink={`/amc/${reminder?.amc._id}`}
                        type={reminder?.template === REMINDER_TEMPLATES.SEND_PENDING_AMC_REMINDER ? "pending" : reminder?.template === REMINDER_TEMPLATES.SEND_UPCOMING_AMC_REMINDER ? "upcoming" : "pending"}
                        clientId={reminder?.client._id || ""}
                    />
            }
        </div>
    )
}

export default ReminderDetail