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
    const [queryArgs, setQueryArgs] = useState<{ page?: number, limit?: number, filter: AMC_FILTER }>({ filter: AMC_FILTER.UPCOMING })
    const { data, refetch } = useGetAllAMCQuery(queryArgs)

    const handleFilterChange = (filter: AMC_FILTER) => {
        setQueryArgs({ ...queryArgs, filter })
        refetch()
    }

    return <AMCList data={data?.data ?? []} changeFilter={handleFilterChange} />
}

export default AMC