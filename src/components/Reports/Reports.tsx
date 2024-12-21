import React from 'react'
import OverallRevenueSales from './OverallRevenue'
import AMCRevenueChart from './AMCRevenue'
import ProductWiseRevenue from './ProductWiseRevenue'
import AmcAnnualBreakdown from './AmcAnnualBreakdown'
import IndustryWiseSales from './IndustryWiseSales'

const Reports = () => {
    return (
        <div>
            <OverallRevenueSales />
            <br />
            <AMCRevenueChart />
            <br />
            <AmcAnnualBreakdown />
            <br />
            <ProductWiseRevenue />
            <br />
            <IndustryWiseSales />
        </div>
    )
}

export default Reports