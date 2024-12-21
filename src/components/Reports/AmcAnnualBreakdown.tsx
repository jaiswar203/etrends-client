"use client"
import { IAMCAnnualBreakDown, IReportQueries, useGetAMCAnnualBreakDownQuery } from '@/redux/api/report'
import React, { useState } from 'react'
import StackedChart from './Chart/StackedChart'
import { IFilterConfig } from './Chart/RevenueChart'

const sampleData = [
    { "period": "October 2024", "totalExpected": 4000, "totalCollected": 4000 },
    { "period": "November 2024", "totalExpected": 4200, "totalCollected": 4200 },
    { "period": "December 2024", "totalExpected": 4500, "totalCollected": 4500 },
    { "period": "January 2025", "totalExpected": 3800, "totalCollected": 3800 },
    { "period": "February 2025", "totalExpected": 4000, "totalCollected": 4000 },
    { "period": "March 2025", "totalExpected": 4100, "totalCollected": 4100 },
    { "period": "April 2025", "totalExpected": 4600, "totalCollected": 4600 },
    { "period": "May 2025", "totalExpected": 3900, "totalCollected": 3900 },
    { "period": "June 2025", "totalExpected": 4700, "totalCollected": 4700 },
    { "period": "July 2025", "totalExpected": 4200, "totalCollected": 4200 }
]


const AmcAnnualBreakdown = () => {
    const [filters, setFilters] = useState<IReportQueries & { options: { productId?: string } }>({ filter: "monthly", options: { productId: undefined } })
    const { data, isLoading } = useGetAMCAnnualBreakDownQuery(filters)

    const graphData = (data?.data ?? []) as IAMCAnnualBreakDown[]

    return <StackedChart
        // data={graphData}
        data={sampleData}
        isLoading={isLoading}
        description="Breakdown of total AMC Collected vs Expected."
        filtersConfig={filters as IFilterConfig & { options: { productId?: string } }}
        header="AMC Annual Breakdown"
        onFiltersChange={(filter) => {
            setFilters(filter)
        }}
    />
}

export default AmcAnnualBreakdown