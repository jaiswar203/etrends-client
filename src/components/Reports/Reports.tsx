"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    IReportQueries,
    useGetExpectedVsReceivedRevenueQuery,
    useGetIndustryWiseRevenueReportQuery,
    useGetProductWiseRevenueReportQuery,
    useGetTotalBillingReportQuery,
    useGetAMCAnnualBreakDownQuery
} from '@/redux/api/report'
import DoubleBarChart from './Chart/DoubleBarChart'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { capitalizeFirstLetter } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import ParetoChart from './Chart/PeratoChart'
import DoubleAreaChart from './Chart/DoubleAreaChart'
import MultipleStackedChart from './Chart/StackedChart'
import AMCRevenue from './Chart/AMCRevenue'
import RadialChart from './Chart/RadialChart'
import { Button } from '../ui/button'

const amcDummyData = [
    {
        "period": "October 2024",
        "totalExpected": 4000,
        "totalCollected": 4000
    },
    {
        "period": "November 2024",
        "totalExpected": 5000,
        "totalCollected": 4500
    },
    {
        "period": "December 2024",
        "totalExpected": 6000,
        "totalCollected": 5500
    },
    {
        "period": "January 2025",
        "totalExpected": 7000,
        "totalCollected": 7000
    },
    {
        "period": "February 2025",
        "totalExpected": 8000,
        "totalCollected": 7500
    },
    {
        "period": "March 2025",
        "totalExpected": 9000,
        "totalCollected": 8500
    },
    {
        "period": "April 2025",
        "totalExpected": 10000,
        "totalCollected": 9500
    },
    {
        "period": "May 2025",
        "totalExpected": 11000,
        "totalCollected": 10000
    },
    {
        "period": "June 2025",
        "totalExpected": 12000,
        "totalCollected": 11500
    },
    {
        "period": "July 2025",
        "totalExpected": 13000,
        "totalCollected": 12500
    }
]

const industryDummyData = [
    {
        "period": "December 2024",
        "industry": "finance",
        "total": 1000,
        "LERMS": 1000,
        "LARS": 0,
        "LICM": 0
    },
    {
        "period": "December 2024",
        "industry": "education",
        "total": 0,
        "LERMS": 0,
        "LARS": 0,
        "LICM": 0
    },
    {
        "period": "Invalid Date",
        "industry": "finance",
        "total": 0,
        "LERMS": 0,
        "LARS": 0,
        "LICM": 0
    },
    {
        "period": "November 2024",
        "industry": "technology",
        "total": 500,
        "LERMS": 300,
        "LARS": 200,
        "LICM": 0
    },
    {
        "period": "October 2024",
        "industry": "healthcare",
        "total": 750,
        "LERMS": 400,
        "LARS": 350,
        "LICM": 0
    },
    {
        "period": "September 2024",
        "industry": "manufacturing",
        "total": 300,
        "LERMS": 150,
        "LARS": 150,
        "LICM": 0
    },
]

const areaChartData = [
    {
        period: "January 2024",
        value1: 5000,
        value2: 4000
    },
    {
        period: "February 2024",
        value1: 6000,
        value2: 6000
    },
    {
        period: "March 2024",
        value1: 7000,
        value2: 6500
    },
    {
        period: "April 2024",
        value1: 8000,
        value2: 7500
    },
    {
        period: "May 2024",
        value1: 9000,
        value2: 8500
    },
    {
        period: "June 2024",
        value1: 10000,
        value2: 9500
    },
    {
        period: "July 2024",
        value1: 11000,
        value2: 10000
    },
    {
        period: "August 2024",
        value1: 12000,
        value2: 11500
    },
    {
        period: "September 2024",
        value1: 13000,
        value2: 12000
    },
    {
        period: "October 2024",
        value1: 14000,
        value2: 13000
    }
];

const productData = [
    {
        name: "LARS",
        revenue: 120000,
        cumulativePercentage: 30
    },
    {
        name: "LERMS",
        revenue: 100000,
        cumulativePercentage: 55
    },
    {
        name: "LICM",
        revenue: 80000,
        cumulativePercentage: 75
    },
    {
        name: "Product 4",
        revenue: 50000,
        cumulativePercentage: 100
    }
];

const totalBillingDataStatic = [
    {
        period: "January 2024",
        value1: 50000,
        value2: 20000
    },
    {
        period: "February 2024",
        value1: 60000,
        value2: 25000
    },
    {
        period: "March 2024",
        value1: 70000,
        value2: 30000
    },
    {
        period: "April 2024",
        value1: 80000,
        value2: 35000
    },
    {
        period: "May 2024",
        value1: 90000,
        value2: 40000
    },
    {
        period: "June 2024",
        value1: 100000,
        value2: 45000
    },
    {
        period: "July 2024",
        value1: 110000,
        value2: 50000
    },
    {
        period: "August 2024",
        value1: 120000,
        value2: 55000
    },
    {
        period: "September 2024",
        value1: 130000,
        value2: 60000
    },
    {
        period: "October 2024",
        value1: 140000,
        value2: 65000
    }
];

export const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 15; i--) {
        years.push(i);
    }
    return years;
};

export const generateQuarters = (year: number) => {
    const quarters = [];
    for (let i = 1; i <= 4; i++) {
        quarters.push(`Q${i} ${year}`);
    }
    return quarters;
};

export const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
]

export const SelectComponent = ({
    onValueChange,
    placeholder,
    options,
    width = "180px",
}: {
    onValueChange: (value: string) => void;
    placeholder: string;
    options: Array<{ value: string; label: string }>;
    width?: string;
}) => (
    <Select onValueChange={onValueChange}>
        <SelectTrigger style={{ width }}>
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {options.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                    {label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

const Reports = () => {
    const [filters, setFilters] = useState<IReportQueries>({ filter: "monthly", options: {} })

    const {
        data: totalBillingApiRes,
        isLoading: isTotalBillingApiLoading,
        refetch: totalBillingApiRefetch
    } = useGetTotalBillingReportQuery(filters)
    const {
        data: productWiseRevenueApiRes,
        isLoading: isProductWiseRevenuApiLoading,
        refetch: productWiseRevenueApiRefetch
    } = useGetProductWiseRevenueReportQuery(filters)
    const {
        data:
        expectedVsReceivedApiRes,
        isLoading: isExpectedVsReceivedRevenueApiLoading,
        refetch: expectedVsReceivedRefetch,
    } = useGetExpectedVsReceivedRevenueQuery(filters)
    const {
        data: industryWiseRevenueApiRes,
        isLoading: isIndustryWiseRevenueApiLoading,
        refetch: industryWiseRevenueRefetch,
    } = useGetIndustryWiseRevenueReportQuery(filters)
    const {
        data: amcAnnualBreakDownApiRes,
        isLoading: isAMCAnnualBreakDownApiLoading,
        refetch: amcAnnualBreakDownRefetch,
    } = useGetAMCAnnualBreakDownQuery(filters)

    const productWiseRevenueData = productWiseRevenueApiRes?.data?.map(item => ({
        name: item.productName,
        revenue: item.revenue,
        cumulativePercentage: item.cumulativePercentage
    })) ?? [];

    const totalBillingData = (totalBillingApiRes?.data ?
        totalBillingApiRes.data.map((item) => ({
            period: item.period,
            value1: item.total_purchase_billing,
            value2: item.total_amc_billing
        }))
        : [])

    const expectedVsReceivedData = expectedVsReceivedApiRes?.data?.map((item) => ({
        period: item.period,
        value1: item.expected_amount,
        value2: item.received_amount
    })) ?? []

    const totalBillingRadialChartData = useMemo(() => {
        return totalBillingData.reduce((acc, item) => {
            acc.total_purchase_billing += item.value1;
            acc.total_amc_billing += item.value2;
            return acc;
        }, { total_amc_billing: 0, total_purchase_billing: 0 })
    }, [totalBillingData])

    const totalAMCRevenueRadialChartData = useMemo(() => {
        return amcAnnualBreakDownApiRes?.data?.reduce((acc, item) => {
            acc.total_expected += item.totalExpected;
            acc.total_collected += item.totalCollected;
            return acc;
        }, { total_expected: 0, total_collected: 0 })
    }, [amcAnnualBreakDownApiRes?.data])

    const chartRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        refetchChartsData()
    }, [filters])

    const handleDownloadPDF = () => {
        const chartElement = chartRef.current;
        if (!chartElement) return;

        html2canvas(chartElement, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF("landscape", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");

            // Add a title to the PDF
            pdf.setFontSize(18).setFont("Helvetica", "", "bold");
            pdf.text("All Reports", 10, 10);

            // Add custom text below the title
            pdf.setFontSize(12).setFont("Helvetica", "color: #bfbfbf;", 500);
            pdf.text("Generated on: " + new Date().toLocaleDateString(), 10, 15);

            // Add filter information on the right side
            pdf.setFontSize(12);
            pdf.text(`Filter: ${capitalizeFirstLetter(filters.filter)}`, pdf.internal.pageSize.width - 40, 10);

            if (filters.filter === 'quarterly') {
                pdf.text(`Quarter: ${filters.options?.quarter}`, pdf.internal.pageSize.width - 40, 15);
            }

            if (filters.filter !== 'all') {
                pdf.text(`Year: ${filters.options?.year}`, pdf.internal.pageSize.width - 40, filters.filter === 'quarterly' ? 20 : 15);
            }

            // Add the chart image to the PDF
            const imgWidth = 280; // Fit the width for A4
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight);

            // Add detailed explanations for each chart
            let yPosition = imgHeight + 40;

            // Total Billing Radial Chart
            pdf.setFontSize(14).setFont("Helvetica", "", "bold");
            pdf.text("New Business vs AMC", 10, yPosition);
            yPosition += 10;
            pdf.setFontSize(12).setFont("Helvetica", "", "normal");
            pdf.text(`Total Purchase Billing: $${totalBillingRadialChartData.total_purchase_billing.toFixed(2)}`, 10, yPosition);
            yPosition += 5;
            pdf.text(`Total AMC Billing: $${totalBillingRadialChartData.total_amc_billing.toFixed(2)}`, 10, yPosition);
            yPosition += 10;

            // AMC Revenue Radial Chart
            pdf.setFontSize(14).setFont("Helvetica", "", "bold");
            pdf.text("AMC Expected vs Collected", 10, yPosition);
            yPosition += 10;
            pdf.setFontSize(12).setFont("Helvetica", "", "normal");
            pdf.text(`Total Expected: $${totalAMCRevenueRadialChartData?.total_expected.toFixed(2)}`, 10, yPosition);
            yPosition += 5;
            pdf.text(`Total Collected: $${totalAMCRevenueRadialChartData?.total_collected.toFixed(2)}`, 10, yPosition);
            yPosition += 10;

            // Total Billing Bar Chart
            pdf.setFontSize(14).setFont("Helvetica", "", "bold");
            pdf.text("Total Billing Over Time", 10, yPosition);
            yPosition += 10;
            pdf.setFontSize(12).setFont("Helvetica", "", "normal");
            totalBillingData.forEach((item, index) => {
                if (index < 3) { // Limit to first 3 entries to save space
                    pdf.text(`${item.period}: New Business $${item.value1.toFixed(2)}, AMC $${item.value2.toFixed(2)}`, 10, yPosition);
                    yPosition += 5;
                }
            });
            yPosition += 5;

            // Product Wise Revenue
            pdf.setFontSize(14).setFont("Helvetica", "", "bold");
            pdf.text("Product Wise Revenue", 10, yPosition);
            yPosition += 10;
            pdf.setFontSize(12).setFont("Helvetica", "", "normal");
            productWiseRevenueData.forEach((item, index) => {
                if (index < 3) { // Limit to first 3 entries to save space
                    pdf.text(`${item.name}: $${item.revenue.toFixed(2)} (${item.cumulativePercentage.toFixed(2)}%)`, 10, yPosition);
                    yPosition += 5;
                }
            });
            yPosition += 5;

            // Expected vs Received Revenue
            pdf.setFontSize(14).setFont("Helvetica", "", "bold");
            pdf.text("Expected vs Received Revenue", 10, yPosition);
            yPosition += 10;
            pdf.setFontSize(12).setFont("Helvetica", "", "normal");
            expectedVsReceivedData.forEach((item, index) => {
                if (index < 3) { // Limit to first 3 entries to save space
                    pdf.text(`${item.period}: Expected $${item.value1.toFixed(2)}, Received $${item.value2.toFixed(2)}`, 10, yPosition);
                    yPosition += 5;
                }
            });

            // Save the PDF
            pdf.save(`All Reports ${new Date().toLocaleDateString()}.pdf`);
        });
    };

    const refetchChartsData = () => {
        totalBillingApiRefetch()
        productWiseRevenueApiRefetch()
        expectedVsReceivedRefetch()
        industryWiseRevenueRefetch()
        amcAnnualBreakDownRefetch()
    }

    const onFilterChange = (value: string) => {
        const updatedFilters = { ...filters };

        if (value === "quarterly") {
            const quarterIndex = Math.floor(new Date().getMonth() / 3) || 0;
            const quarter = generateQuarters(new Date().getFullYear())[quarterIndex];
            const year = new Date().getFullYear();
            updatedFilters.filter = value as "quarterly" | "yearly" | "all";
            updatedFilters.options = { ...updatedFilters.options, year, quarter };
        } else {
            updatedFilters.filter = value as "monthly" | "yearly" | "all";
        }

        setFilters(updatedFilters);
    };

    const onOptionChange = (key: string, value: string) => {
        const updatedFilters = {
            ...filters,
            options: { ...filters.options, [key]: value },
        };

        setFilters(updatedFilters);
    };

    const customChartContainerHeight = "h-[150px]"

    console.log({ totalBillingRadialChartData, totalAMCRevenueRadialChartData, totalBillingData, productWiseRevenueData, expectedVsReceivedData, industryData: industryWiseRevenueApiRes?.data, amcAnnualData: amcAnnualBreakDownApiRes?.data })

    return (
        <div className=''>
            <div className="flex justify-between items-center ">
                <div className="flex justify-start items-center gap-3">
                    {filters.filter === "quarterly" && (
                        <SelectComponent
                            onValueChange={(value) => onOptionChange("quarter", value)}
                            placeholder={filters.options?.quarter || "Select a Quarter"}
                            options={
                                generateQuarters(Number(filters.options?.year) || new Date().getFullYear()).map(
                                    (q) => ({
                                        value: q,
                                        label: q,
                                    })
                                )
                            }
                        />
                    )}
                    {filters.filter !== "all" && (
                        <SelectComponent
                            onValueChange={(value) => onOptionChange("year", value)}
                            placeholder={filters.options?.year?.toString() || "Select a Year"}
                            options={generateYears().map((year) => ({
                                value: year.toString(),
                                label: year.toString(),
                            }))}
                        />
                    )}

                    <SelectComponent
                        onValueChange={onFilterChange}
                        placeholder={filters.filter ? capitalizeFirstLetter(filters.filter) : "Select a filter"}
                        options={filterOptions}
                    />
                </div>
                <div className="">
                    <Button onClick={handleDownloadPDF}>Download Report</Button>
                </div>
            </div>
            <div ref={chartRef}>
                <div className="w-full flex justify-between gap-6 mt-4">
                    <RadialChart data={totalBillingRadialChartData} title='New Business vs AMC' valueToDisplay='total_purchase_billing' />
                    <RadialChart data={totalAMCRevenueRadialChartData || {}} title='AMC Expected vs Collected' valueToDisplay='total_collected' />
                </div>
                <div className="w-full flex justify-between gap-6 mt-4">
                    <DoubleBarChart
                        data={totalBillingData}
                        isLoading={isTotalBillingApiLoading}
                        description="Total Purchase Billing vs Total AMC Billing"
                        header="Total Billing"
                        bar1Label='New Business'
                        bar2Label='AMC Billing'
                        chartConfigClassName={`${customChartContainerHeight} w-full mt-0`}
                    />
                    <ParetoChart
                        data={productWiseRevenueData}
                        isLoading={isProductWiseRevenuApiLoading}
                        header="Product Wise Revenue"
                        description="Revenue generated from each product."
                        chartConfigClassName={`${customChartContainerHeight} mt-0`}
                    />
                </div>
                <div className="w-full flex justify-between gap-6 mt-4">
                    <DoubleAreaChart
                        data={expectedVsReceivedData}
                        isLoading={isExpectedVsReceivedRevenueApiLoading}
                        description="Expected vs Actual Revenue"
                        header="Revenue Comparison"
                        area1Label='Expected Revenue'
                        area2Label='Actual Revenue'
                        chartConfigClassName={`${customChartContainerHeight} mt-0`}
                    />
                    <MultipleStackedChart
                        data={industryWiseRevenueApiRes?.data ?? []}
                        isLoading={isIndustryWiseRevenueApiLoading}
                        header="Industry Wise Revenue"
                        description="Revenue generated from each industry."
                        chartConfigClassName={`${customChartContainerHeight} mt-0`}
                    />
                    <AMCRevenue
                        data={amcAnnualBreakDownApiRes?.data || []}
                        isLoading={isAMCAnnualBreakDownApiLoading}
                        header="AMC Revenue"
                        description="Total AMC Revenue"
                        chartConfigClassName={`${customChartContainerHeight} mt-0`}
                    />
                </div>
            </div>
        </div>
    )
}

export default Reports