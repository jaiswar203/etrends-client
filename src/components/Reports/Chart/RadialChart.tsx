"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import {
    RadialBarChart,
    RadialBar,
    PolarRadiusAxis,
    PolarGrid,
    Label,
} from "recharts";
import millify from "millify";

interface IProps {
    data: { [key: string]: number };
    title: string;
    valueToDisplay: string; // The key whose value will be displayed in the center
}

const RadialChart = ({ data, title, valueToDisplay }: IProps) => {
    // Dynamically create chart data and config
    const chartData = Object.keys(data).map((key, index) => ({
        name: key.replace(/_/g, " "),
        value: data[key],
        fill: `hsl(var(--chart-${index + 1}))`,
    }));

    const chartConfig: ChartConfig = Object.fromEntries(
        Object.keys(data).map((key, index) => [
            key.replace(/_/g, " "),
            {
                label: key.replace(/_/g, " "),
                color: `hsl(var(--chart-${index + 1}))`,
            },
        ])
    );

    return (
        <Card className="w-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[110px] mt-2 mx-auto"
                >
                    <RadialBarChart
                        data={chartData}
                        innerRadius={40}
                        outerRadius={60}
                        startAngle={180}
                        endAngle={-180}
                    >
                        <PolarGrid gridType="circle" radialLines={false} stroke="none" />
                        <PolarRadiusAxis axisLine={false} tick={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        const total = data[valueToDisplay];
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-xs font-bold"
                                                >
                                                    ₹{millify(total, { precision: 2 })}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PolarRadiusAxis>
                        <RadialBar dataKey="value" cornerRadius={10} background fill="fill" />
                        <ChartTooltip
                            content={({ payload }) => {
                                if (payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-background border border-border p-2 rounded-md shadow-md">
                                            <p className="font-medium capitalize !text-xs">{data.name}</p>
                                            <p>{millify(data.value, { precision: 2 })}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export default RadialChart;
