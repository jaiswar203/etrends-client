'use client'
import { useGetAllPendingPaymentsQuery } from '@/redux/api/order'
import React from 'react'
import PendingPaymentsDataTable from './PendingPaymentsDataTable'
import Typography from '../ui/Typography'

const PendingPayment = () => {
    const {
        data,
        isLoading,
    } = useGetAllPendingPaymentsQuery({})


    return (
        <>
            <Typography variant="h1">Pending Payments</Typography>
            <div className='mt-5'>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <PendingPaymentsDataTable data={data?.data?.pending_payments ?? []} pagination={data?.data.pagination ?? { total: 0, currentPage: 1, totalPages: 1, limit: 10, hasPreviousPage: false, hasNextPage: false }} />
                )}
            </div>
        </>
    )
}

export default PendingPayment