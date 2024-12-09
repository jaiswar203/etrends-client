"use client"
import React from 'react'
import Typography from '../ui/Typography'
import ReminderList from './ReminderList'
import { useGetRemindersQuery } from '@/redux/api/reminder'

const Reminder = () => {
  const { data } = useGetRemindersQuery()
  return (
    <div>
      <Typography variant='h1' className='text-2xl md:text-3xl'>Reminders List</Typography>
      <br />
      <ReminderList data={data?.data || []} />
    </div>
  )
}

export default Reminder