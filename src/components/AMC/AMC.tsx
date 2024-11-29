"use client"
import React from 'react'
import AMCList from './AMCList'
import { useGetAllAMCQuery } from '@/redux/api/order'

const AMC = () => {
    const { data } = useGetAllAMCQuery({})
    return <AMCList data={data?.data ?? []} />
}

export default AMC