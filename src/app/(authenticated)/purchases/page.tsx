import Purchase from '@/components/Purchase/Purchase';
import React, { use } from 'react';

const Page = ({ searchParams }: { searchParams: Promise<{ page: string }> }) => {
    const { page } = use(searchParams)

    return (
        <div>
            <Purchase page={Number(page) || 1} />
        </div>
    );
};

export default Page;
