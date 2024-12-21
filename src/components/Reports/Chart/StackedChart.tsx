"use client";

import React, { useMemo, useRef, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartLegendContent,
    ChartTooltipContent,
} from "@/components/ui/chart";
import Typography from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import { IAMCAnnualBreakDown } from "@/redux/api/report";
import { filterOptions, generateQuarters, generateYears, IFilterConfig, SelectComponent } from "./RevenueChart";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useAppSelector } from "@/redux/hook";
import Loading from "@/components/ui/loading";

interface StackedChartProps {
    data: IAMCAnnualBreakDown[];
    isLoading: boolean;
    header: string;
    description: string;
    filtersConfig: IFilterConfig & { options: { productId?: string } };
    onFiltersChange: (filters: any) => void;
}

const StackedChart: React.FC<StackedChartProps> = ({ data, header, description, filtersConfig, isLoading, onFiltersChange }) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const [filters, setFilters] = useState(filtersConfig);
    const { products } = useAppSelector(state => state.user)

    const chartConfig = {
        totalExpected: {
            label: "Total Expected",
            color: "hsl(var(--chart-1))",
        },
        totalCollected: {
            label: "Total Collected",
            color: "hsl(var(--chart-2))",
        },
    };

    const handleDownloadPDF = () => {
        const chartElement = chartRef.current;
        if (!chartElement) return;

        html2canvas(chartElement, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF("landscape", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");

            // Add header and description
            pdf.setFontSize(18).setFont("Helvetica", "", "bold");
            pdf.text(header, 10, 10);
            pdf.setFontSize(12).text(description, 10, 15);
            pdf.text("Generated on: " + new Date().toLocaleDateString(), 10, 20);

            // Add chart image
            const imgWidth = 280;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight);

            // Save PDF
            pdf.save(`${header}.pdf`);
        });
    };


    const onFilterChange = (value: string) => {
        const updatedFilters = { ...filters };

        if (value === "quarterly") {
            const quarterIndex = Math.floor(new Date().getMonth() / 3) || 0;
            const quarter = generateQuarters(new Date().getFullYear())[quarterIndex];
            const year = new Date().getFullYear();
            updatedFilters.filter = value;
            updatedFilters.options = { ...updatedFilters.options, year, quarter };
        } else {
            updatedFilters.filter = value;
        }

        setFilters(updatedFilters);
        onFiltersChange(updatedFilters);
    };

    const onOptionChange = (key: string, value: string) => {
        const updatedFilters = {
            ...filters,
            options: { ...filters.options, [key]: value },
        };

        setFilters(updatedFilters);
        onFiltersChange(updatedFilters);
    };

    const productOptions = useMemo(() => {
        return products.map(product => ({
            value: product._id,
            label: product.name
        })) || []
    }, [products])

    return (
        <Card className="w-full">
            <CardHeader className="justify-between flex-row">
                <div>
                    <Typography variant="h1" className="text-3xl font-bold">
                        {header}
                    </Typography>
                    <Typography variant="p" className="text-sm !text-gray-500">
                        {description}
                    </Typography>
                </div>
                <div className="flex justify-center items-center gap-3 flex-wrap">
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

                    <SelectComponent
                        onValueChange={(value) => onOptionChange("productId", value)}
                        placeholder={"Select a Product"}
                        options={productOptions}
                    />
                </div>

            </CardHeader>
            <CardContent className="px-6">
                {
                    isLoading ?
                        <Loading /> : data.length ?
                            <ChartContainer
                                ref={chartRef}
                                config={chartConfig}
                                className="h-[300px] w-full mt-4"
                            >
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={data}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="period"
                                            tickLine={false}
                                            tick={{ fill: "hsl(var(--foreground))" }}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            tick={{ fill: "hsl(var(--foreground))" }}
                                            tickFormatter={(value) => `₹${value / 1000}k`}
                                        />
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Legend content={<ChartLegendContent />} />
                                        <Bar
                                            dataKey="totalExpected"
                                            stackId="a"
                                            fill={chartConfig.totalExpected.color}
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="totalCollected"
                                            stackId="a"
                                            fill={chartConfig.totalCollected.color}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            : <Typography variant="p" className="text-center">No data available</Typography>
                }
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleDownloadPDF}>Download Report</Button>
            </CardFooter>
        </Card>
    );
};

export default StackedChart;
