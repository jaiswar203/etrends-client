"use client"
import React from 'react';
import { XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip, Label } from 'recharts';

const pendingAmcData = [
    { month: 'January', pendingAmc: 10 },
    { month: 'February', pendingAmc: 15 },
    { month: 'March', pendingAmc: 8 },
    { month: 'April', pendingAmc: 12 },
    { month: 'May', pendingAmc: 20 },
    { month: 'June', pendingAmc: 7 },
    { month: 'July', pendingAmc: 14 },
    { month: 'August', pendingAmc: 9 },
    { month: 'September', pendingAmc: 11 },
    { month: 'October', pendingAmc: 13 },
    { month: 'November', pendingAmc: 16 },
    { month: 'December', pendingAmc: 5 },
];

const Example = () => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={pendingAmcData} style={{}}>
                <XAxis dataKey="month">
                    <Label value="Pending AMC " offset={0} position="insideBottom" />
                </XAxis>
                <YAxis dataKey={"pendingAmc"} label={{ value: 'Total AMC', angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={false} />
                <Bar dataKey="pendingAmc" fill="blue" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default Example;
