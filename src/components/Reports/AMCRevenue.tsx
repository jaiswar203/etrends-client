"use client"

import { IReportQueries, IDetailedOverAllSalesReportResponse, useGetAmcRevenueReportQuery } from "@/redux/api/report"
import { useState } from "react"
import RevenueChart from "./Chart/RevenueChart"

// const sampleData = [
//     {
//         period: "January",
//         orderRevenue: 1200,
//         customizationRevenue: 500,
//         licenseRevenue: 800,
//         additionalServiceRevenue: 300,
//         amcRevenue: 200,
//         total: 3000,
//     },
//     {
//         period: "February",
//         orderRevenue: 1500,
//         customizationRevenue: 600,
//         licenseRevenue: 900,
//         additionalServiceRevenue: 400,
//         amcRevenue: 300,
//         total: 3700,
//     },
//     {
//         period: "March",
//         orderRevenue: 2000,
//         customizationRevenue: 700,
//         licenseRevenue: 1000,
//         additionalServiceRevenue: 450,
//         amcRevenue: 350,
//         total: 4500,
//     },
//     {
//         period: "April",
//         orderRevenue: 2500,
//         customizationRevenue: 800,
//         licenseRevenue: 1200,
//         additionalServiceRevenue: 500,
//         amcRevenue: 400,
//         total: 5400,
//     },
//     {
//         period: "May",
//         orderRevenue: 3000,
//         customizationRevenue: 850,
//         licenseRevenue: 1500,
//         additionalServiceRevenue: 600,
//         amcRevenue: 450,
//         total: 6400,
//     },
//     {
//         period: "June",
//         orderRevenue: 3500,
//         customizationRevenue: 900,
//         licenseRevenue: 1600,
//         additionalServiceRevenue: 700,
//         amcRevenue: 500,
//         total: 7200,
//     },
//     {
//         period: "July",
//         orderRevenue: 4000,
//         customizationRevenue: 950,
//         licenseRevenue: 1800,
//         additionalServiceRevenue: 750,
//         amcRevenue: 550,
//         total: 8050,
//     },
//     {
//         period: "August",
//         orderRevenue: 4200,
//         customizationRevenue: 1000,
//         licenseRevenue: 2000,
//         additionalServiceRevenue: 800,
//         amcRevenue: 600,
//         total: 8600,
//     },
//     {
//         period: "September",
//         orderRevenue: 4500,
//         customizationRevenue: 1100,
//         licenseRevenue: 2200,
//         additionalServiceRevenue: 900,
//         amcRevenue: 650,
//         total: 9350,
//     },
//     {
//         period: "October",
//         orderRevenue: 4800,
//         customizationRevenue: 1200,
//         licenseRevenue: 2400,
//         additionalServiceRevenue: 1000,
//         amcRevenue: 700,
//         total: 10100,
//     }
// ];


const AMCRevenueChart = () => {
    const [filters, setFilters] = useState<IReportQueries>({ filter: "all", options: {} })
    const { data, isSuccess, refetch } = useGetAmcRevenueReportQuery(filters)

    const graphData = (data?.data ?? []) as IDetailedOverAllSalesReportResponse[]

    return <RevenueChart
        data={graphData}
        isLoading={!isSuccess}
        description="Total revenue collected from Annual Maintenance Contracts (AMC)."
        filtersConfig={filters as { filter: string; options: { year?: number; quarter?: string; startDate?: Date; endDate?: Date } }}
        header="AMC Revenue Report"
        onFiltersChange={(filter) => {
            setFilters(filter)
            refetch()
        }}
    />
}

export default AMCRevenueChart
