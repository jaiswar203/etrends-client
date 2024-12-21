"use client"

import { Cell, LabelList, Pie, PieChart as REPieChart } from "recharts"
import React, { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import millify from "millify";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import Typography from "@/components/ui/Typography"
import { Button } from "@/components/ui/button"
import Loading from "@/components/ui/loading";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { capitalizeFirstLetter } from "@/lib/utils";
import { IIndustryWiseRevenue } from "@/redux/api/report";
import { generateQuarters, generateYears } from "./RevenueChart";

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

interface PieChartProps {
    data: IIndustryWiseRevenue[];
    isLoading: boolean;
    header: string;
    description: string;
    filtersConfig: IFilterConfig;
    onFiltersChange: (filters: any) => void;
}

export interface IFilterConfig {
    filter: string;
    options: {
        year?: number;
        quarter?: string;
        startDate?: Date,
        endDate?: Date
    };
}

const pieColorGenerator = (index: number) => {
    const colors = [
        "chart-1",
        "chart-2",
        "chart-3",
        "chart-4",
        "chart-5",
    ]
    return `hsl(var(--${colors[Math.floor(index % colors.length)]})`
}

// create a function which generate month with label and value(it will the month number)
const generateMonths = () => {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return monthNames.map((month, index) => ({
        label: month,
        value: (index + 1).toString()
    }));
}

const PieChart: React.FC<PieChartProps> = ({
    data,
    isLoading,
    header,
    description,
    filtersConfig,
    onFiltersChange
}) => {
    const [filters, setFilters] = useState(filtersConfig);
    const chartRef = useRef<HTMLDivElement | null>(null);

    const handleDownloadPDF = () => {
        const chartElement = chartRef.current;
        if (!chartElement) return;

        html2canvas(chartElement, { scale: 2 }).then((canvas) => {
            const pdf = new jsPDF("landscape", "mm", "a4");
            const imgData = canvas.toDataURL("image/png");

            // Add title and description
            pdf.setFontSize(18).setFont("Helvetica", "", "bold");
            pdf.text(header, 10, 10);

            pdf.setFontSize(12).setFont("Helvetica", "color: #bfbfbf;", 500);
            pdf.text(description, 10, 15);

            pdf.setFontSize(12);
            pdf.text("Generated on: " + new Date().toLocaleDateString(), 10, 20);

            // Add filter information
            pdf.text(`Filter: ${capitalizeFirstLetter(filters.filter)}`, pdf.internal.pageSize.width - 40, 10);

            if (filters.filter === 'quarterly') {
                pdf.text(`Quarter: ${filters.options.quarter}`, pdf.internal.pageSize.width - 40, 15);
            }

            if (filters.filter !== 'all') {
                pdf.text(`Year: ${filters.options.year}`, pdf.internal.pageSize.width - 40, filters.filter === 'quarterly' ? 20 : 15);
            }

            // Add the chart
            const imgWidth = 180;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 60, 30, imgWidth, imgHeight);

            pdf.save(`${header}.pdf`);
        });
    };

    const onFilterChange = (value: string) => {
        const updatedFilters = { ...filters };
        updatedFilters.filter = value;

        if (value === "quarterly") {
            const quarterIndex = Math.floor(new Date().getMonth() / 3);
            const quarter = `Q${quarterIndex + 1} ${new Date().getFullYear()}`;
            const year = new Date().getFullYear();
            updatedFilters.options = { ...updatedFilters.options, year, quarter };
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
        <Card className="flex flex-col">
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
                    {
                        filters.filter === "monthly" && (
                            <SelectComponent
                                onValueChange={(value) => onOptionChange("month", value)}
                                placeholder={"December"}
                                options={generateMonths()}
                            />
                        )
                    }
                    <SelectComponent
                        onValueChange={onFilterChange}
                        placeholder={filters.filter ? capitalizeFirstLetter(filters.filter) : "Select a filter"}
                        options={[
                            { label: 'Monthly', value: 'monthly' },
                            { label: 'Quarterly', value: 'quarterly' },
                            { label: 'Yearly', value: 'yearly' },
                        ]}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                {isLoading ? (
                    <Loading />
                ) : data?.length ? (
                    <ChartContainer
                        config={{
                            industry: {
                                label: 'Industry',
                            }
                        }}
                        ref={chartRef}
                        className="mx-auto aspect-square max-h-[350px] max-w-full px-0"
                    >
                        <REPieChart>
                            <ChartTooltip
                                content={<ChartTooltipContent nameKey="industry" />}
                            />
                            <Pie
                                data={data}
                                dataKey="revenue"
                                nameKey="industry"
                                labelLine={false}
                                label={({ payload, ...props }) => {
                                    return (
                                        <text
                                            cx={props.cx}
                                            cy={props.cy}
                                            x={props.x}
                                            y={props.y}
                                            textAnchor={props.textAnchor}
                                            dominantBaseline={props.dominantBaseline}
                                            fill="hsla(var(--foreground))"
                                        >
                                            {millify(payload.revenue)}
                                        </text>
                                    )
                                }}
                            >
                                <LabelList
                                    dataKey="industry"
                                    className="fill-background"
                                    stroke="none"
                                    fontSize={12}
                                />
                                {
                                    data.map((chart, index) => (
                                        <Cell key={`cell-${index}`} fill={pieColorGenerator(index)} />
                                    ))
                                }
                            </Pie>
                        </REPieChart>
                    </ChartContainer>
                ) : (
                    <CardDescription className="text-center">No data available</CardDescription>
                )}
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleDownloadPDF}>Download Report</Button>
            </CardFooter>
        </Card>
    )
}

export default PieChart