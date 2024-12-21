"use client"
import { IReportQueries, useGetProductWiseRevenueReportQuery } from '@/redux/api/report'
import React, { useState } from 'react'
import ParetoChart from './Chart/PeratoChart'

const ProductWiseRevenue = () => {
    const [filters, setFilters] = useState<IReportQueries>({ filter: "all", options: {} })

    const { data, isLoading } = useGetProductWiseRevenueReportQuery(filters)
    const chartData = data?.data?.map(item => ({
        name: item.productName,
        revenue: item.revenue,
        cumulativePercentage: item.cumulativePercentage
    })) ?? [];
    
    return <ParetoChart data={chartData} isLoading={isLoading} header="Product Wise Revenue" description="Revenue generated from each product." filtersConfig={{ filter: filters.filter, options: { year: filters.options?.year, quarter: filters.options?.quarter } }} onFiltersChange={(filter) => setFilters(filter)} />
}

export default ProductWiseRevenue