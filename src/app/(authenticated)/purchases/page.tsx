import Purchase from '@/components/Purchase/Purchase';
import React from 'react';

const Page = async ({ searchParams }: { searchParams: { page: string } }) => {
    const page = (await searchParams).page

    return (
        <div>
            <Purchase page={Number(page) || 1} />
        </div>
    );
};

export default Page;
