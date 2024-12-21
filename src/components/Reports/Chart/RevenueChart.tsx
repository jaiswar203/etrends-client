"use client"

import {
    Bar,
    BarChart,
    Label,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import Typography from "@/components/ui/Typography";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import React, { useRef, useState } from "react";

import { capitalizeFirstLetter } from "@/lib/utils";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

const chartConfig = {
    total: {
        label: "Total Revenue",
        color: "hsl(var(--primary))",
    },
};

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

export interface IFilterConfig {
    filter: string;
    options: {
        year?: number;
        quarter?: string;
        startDate?: Date,
        endDate?: Date
    };
}

interface RevenueChartProps {
    data: { total: number, period: string }[];
    isLoading: boolean;
    header: string;
    description: string;
    filtersConfig: IFilterConfig;
    onFiltersChange: (filters: any) => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
    data,
    isLoading,
    header,
    description,
    filtersConfig,
    onFiltersChange,
}) => {
    const [filters, setFilters] = useState(filtersConfig);

    const chartRef = useRef<HTMLDivElement | null>(null);

    const handleDownloadPDF = () => {
        const chartElement = chartRef.current;
        if (!chartElement) return;

        html2canvas(chartElement, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF("landscape", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");

            // Add a title to the PDF
            pdf.setFontSize(18).setFont("Helvetica", "", "bold");
            pdf.text(header, 10, 10);

            // Add custom text below the title
            pdf.setFontSize(12).setFont("Helvetica", "color: #bfbfbf;", 500);
            pdf.text(description, 10, 15);

            pdf.setFontSize(12);
            pdf.text("Generated on: " + new Date().toLocaleDateString(), 10, 20);

            // Also include the filters and options used  on right side and on top of the Canvas
            // Add filter information on the right side
            pdf.setFontSize(12);
            pdf.text(`Filter: ${capitalizeFirstLetter(filters.filter)}`, pdf.internal.pageSize.width - 40, 10);

            if (filters.filter === 'quarterly') {
                pdf.text(`Quarter: ${filters.options.quarter}`, pdf.internal.pageSize.width - 40, 15);
            }

            if (filters.filter !== 'all') {
                pdf.text(`Year: ${filters.options.year}`, pdf.internal.pageSize.width - 40, filters.filter === 'quarterly' ? 20 : 15);
            }

            // Add the chart image to the PDF
            const imgWidth = 280; // Fit the width for A4
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight);

            // Save the PDF
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

                <div className="flex justify-center items-center gap-3">

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
            </CardHeader>
            <CardContent className="px-6">

                {isLoading ? (
                    <Loading />
                ) : data?.length ? (
                    <ChartContainer
                        ref={chartRef}
                        config={chartConfig}
                        className="h-[300px] w-full mt-4"
                    >
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data}>
                                <XAxis
                                    dataKey="period"
                                    axisLine={true}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--foreground))" }}
                                />
                                <YAxis
                                    axisLine={true}
                                    tickLine={true}
                                    tick={{ fill: "hsl(var(--foreground))" }}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Label
                                    value="period"
                                    position="insideTop"
                                    offset={-10}
                                    fill="hsl(var(--foreground))"
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="total"
                                    fill="hsl(var(--chart-1))"
                                    radius={[4, 4, 0, 0]}
                                />
                                <ChartTooltip
                                    cursor={{
                                        fill: "var(--primary-foreground)",
                                        opacity: 0.1,
                                    }}
                                    content={<ChartTooltipContent indicator="dashed" />}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <CardDescription className="text-center">No data available</CardDescription>
                )}
                <CardFooter className="justify-end">
                    <Button onClick={handleDownloadPDF}>Download Report</Button>
                </CardFooter>
            </CardContent>
        </Card>
    );
};

export default RevenueChart;