"use client"
import React, { useState } from 'react'
import PieChart from './Chart/PieChart'
import { IIndustryWiseRevenue, IReportQueries, useGetIndustryWiseRevenueReportQuery } from '@/redux/api/report'

const IndustryWiseSales = () => {
    const [filters, setFilters] = useState<IReportQueries & { options: { month?: string } }>({ filter: "monthly", options: { month: undefined } })
    const { data, isLoading, refetch } = useGetIndustryWiseRevenueReportQuery(filters)

    // const graphData = (data?.data ?? []) as IIndustryWiseRevenue[]
    const graphData =  [
        { industry: "Technology", revenue: 275000, period:"" },
        { industry: "Finance", revenue: 200000, period:"" },
        { industry: "Healthcare", revenue: 187000, period:"" },
        { industry: "Retail", revenue: 173000, period:"" },
        { industry: "Other", revenue: 90000, period:"" },
      ]

    return <PieChart
        data={graphData}
        isLoading={isLoading}
        description="Revenue distribution categorized by industries (e.g., banking, insurance)."
        filtersConfig={filters as { filter: string; options: { year?: number; quarter?: string; startDate?: Date; endDate?: Date } }}
        header="Industry-Wise Sales Report"
        onFiltersChange={(filter) => {
            setFilters(filter)
            refetch()
        }}
    />


}

export default IndustryWiseSales