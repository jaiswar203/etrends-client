"use client"

import { Bar, Line, XAxis, YAxis, CartesianGrid, Legend, ComposedChart, ResponsiveContainer, Label } from "recharts"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import Typography from "@/components/ui/Typography"
import { useRef, useState } from "react"
import { filterOptions, generateQuarters, generateYears, SelectComponent } from "./RevenueChart"
import { capitalizeFirstLetter } from "@/lib/utils"
import Loading from "@/components/ui/loading"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"

const renderLegend = (props: any) => {
    const { payload } = props;
    return (
        <div className="flex justify-center items-center gap-4">
            {payload.map((entry: { dataKey: string; color: string }, index: number) => (
                <div key={`item-${index}`} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3"
                        style={{
                            backgroundColor: entry.dataKey === 'revenue' ? 'hsl(var(--chart-1))' : 'var(--color-cumulativePercentage)',
                            borderRadius: entry.dataKey === 'revenue' ? '2px' : '0'
                        }}
                    />
                    <span>
                        {entry.dataKey === 'revenue' ? 'Revenue' : 'Cumulative Percentage'}
                    </span>
                </div>
            ))}
        </div>
    );
}

interface ParetoChartProps {
    data: { name: string; revenue: number; cumulativePercentage: number }[];
    isLoading: boolean;
    header: string;
    description: string;
    filtersConfig: {
        filter: string;
        options: {
            year?: number;
            quarter?: string;
        };
    };
    onFiltersChange: (filters: any) => void;
}

const ParetoChart: React.FC<ParetoChartProps> = ({
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

    const onFilterChange = (value: "all" | "yearly" | "quarterly") => {
        const updatedFilters = { ...filtersConfig };

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
            ...filtersConfig,
            options: { ...filtersConfig.options, [key]: value },
        };

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
                    {filtersConfig.filter === "quarterly" && (
                        <SelectComponent
                            onValueChange={(value) => onOptionChange("quarter", value)}
                            placeholder={filtersConfig.options?.quarter || "Select a Quarter"}
                            options={
                                generateQuarters(Number(filtersConfig.options?.year) || new Date().getFullYear()).map(
                                    (q) => ({
                                        value: q,
                                        label: q,
                                    })
                                )
                            }
                        />
                    )}

                    {filtersConfig.filter !== "all" && (
                        <SelectComponent
                            onValueChange={(value) => onOptionChange("year", value)}
                            placeholder={filtersConfig.options?.year?.toString() || "Select a Year"}
                            options={generateYears().map((year) => ({
                                value: year.toString(),
                                label: year.toString(),
                            }))}
                        />
                    )}

                    <SelectComponent
                        onValueChange={(value) => onFilterChange(value as "all" | "yearly" | "quarterly")}
                        placeholder={filtersConfig.filter ? capitalizeFirstLetter(filtersConfig.filter) : "Select a filter"}
                        options={filterOptions}
                    />
                </div>
            </CardHeader>
            <CardContent>
                {
                    isLoading ?
                        <Loading /> : data.length ?
                            <ChartContainer
                                ref={chartRef}
                                config={{
                                    revenue: {
                                        label: "Revenue",
                                        color: "hsl(var(--chart-1))",
                                    },
                                    cumulativePercentage: {
                                        label: "Cumulative %",
                                        color: "hsl(var(--chart-2))",
                                    },
                                }}
                                className="h-[400px] w-full"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-revenue)">
                                            <Label value="Revenue" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                                        </YAxis>
                                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-cumulativePercentage)" tickFormatter={(value) => `${value}%`}>
                                            <Label value="Cumulative %" angle={90} position="insideRight" style={{ textAnchor: 'middle' }} />
                                        </YAxis>
                                        <ChartTooltip content={<CustomTooltip />} />
                                        <Legend content={renderLegend} />
                                        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" yAxisId="left" radius={[4, 4, 0, 0]} />
                                        <Line type="monotone" dataKey="cumulativePercentage" stroke="var(--color-cumulativePercentage)" yAxisId="right" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            :
                            <Typography variant="p" className="text-center text-lg text-gray-500">No data available</Typography>
                }
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleDownloadPDF}>Download Report</Button>
            </CardFooter>
        </Card>
    )
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded p-2 shadow-md">
                <p className="font-bold">{`${label}`}</p>
                <div className="flex items-center gap-1">
                    <div className="bg-chart-1 rounded-sm size-2"></div>
                    <p className="text-revenue">{`Revenue: ₹${payload[0].value.toLocaleString()}`}</p>
                </div>
                <div className="flex items-center gap-1">
                    <div className="bg-chart-2 rounded-sm size-2"></div>
                    <p className="text-cumulativePercentage">{`Cumulative %: ${payload[1].value.toFixed(2)}%`}</p>
                </div>
            </div>
        );
    }
    return null;
};

export default ParetoChart;
