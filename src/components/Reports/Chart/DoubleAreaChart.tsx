"use client"

import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import Typography from "@/components/ui/Typography";
import Loading from "@/components/ui/loading";
import { cn } from "@/lib/utils";

const chartConfig = {
    area1: {
        label: "First Metric",
        color: "hsl(var(--chart-1))",
    },
    area2: {
        label: "Second Metric",
        color: "hsl(var(--chart-2))",
    },
};

interface DoubleAreaChartProps {
    data: Array<{
        period: string;
        value1: number;
        value2: number;
    }>;
    isLoading: boolean;
    header: string;
    description: string;
    area1Label: string;
    area2Label: string;
    chartConfigClassName?: string;
}

const DoubleAreaChart: React.FC<DoubleAreaChartProps> = ({
    data,
    isLoading,
    header,
    description,
    area1Label,
    area2Label,
    chartConfigClassName
}) => {
    return (
        <Card className="flex-1 w-1/3">
            <CardHeader>
                <Typography variant="h2" className="font-bold">
                    {header}
                </Typography>
                <Typography variant="p" className="text-xs !text-gray-500">
                    {description}
                </Typography>
            </CardHeader>
            <CardContent className="px-6">
                {isLoading ? (
                    <Loading />
                ) : data?.length ? (
                    <ChartContainer
                        config={chartConfig}
                        className={cn("h-[200px] w-full mt-4", chartConfigClassName)}
                    >
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={data}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}>
                                <defs>
                                    <linearGradient id="fillArea1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="fillArea2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="period"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "hsl(var(--foreground))" }}
                                    tickMargin={8}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--foreground))" }}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Legend />
                                <Area
                                    name={area1Label}
                                    type="natural"
                                    dataKey="value1"
                                    stroke="hsl(var(--chart-2))"
                                    fill="url(#fillArea2)"
                                    fillOpacity={0.4}
                                // stackId="a"
                                />
                                <Area
                                    name={area2Label}
                                    type="natural"
                                    dataKey="value2"
                                    stroke="hsl(var(--chart-1))"
                                    fill="url(#fillArea1)"
                                    fillOpacity={0.4}
                                // stackId="a"
                                />

                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent />}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <CardDescription className="text-center">No data available</CardDescription>
                )}
            </CardContent>
        </Card>
    );
};

export default DoubleAreaChart;