"use client"
import React, { useState } from 'react'
import AMCList from './AMCList'
import { useGetAllAMCQuery } from '@/redux/api/order'

export enum AMC_FILTER {
    UPCOMING = 'upcoming',
    ALL = 'all',
    PAID = 'paid',
    PENDING = 'pending',
    OVERDUE = 'overdue',
    FIRST = "first"
}


const AMC = () => {
    const [queryArgs, setQueryArgs] = useState<{ page?: number, limit?: number, filter: AMC_FILTER, options: { upcoming: number } }>({ filter: AMC_FILTER.UPCOMING, options: { upcoming: 1 } })
    const { data, refetch } = useGetAllAMCQuery(queryArgs)

    const handleFilterChange = (filter: AMC_FILTER, options?: { upcoming: number }) => {
        setQueryArgs({ ...queryArgs, filter, ...(options && { options }) })
        refetch()
    }

    return <AMCList data={data?.data ?? []} changeFilter={handleFilterChange} />
}

export default AMC