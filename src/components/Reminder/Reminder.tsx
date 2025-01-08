"use client"
import React, { useEffect, useState } from 'react'
import Typography from '../ui/Typography'
import ReminderList from './ReminderList'
import { useGetExternalCommunicationHistoryQuery, useGetRemindersQuery } from '@/redux/api/reminder'
import { Button } from '../ui/button'
import ExternalReminderList from './ExternalReminderList'

const Reminder = () => {
  const [reminderListType, setreminderListType] = useState<"external" | "internal">("internal")

  const { data, refetch } = useGetRemindersQuery(undefined, { skip: reminderListType === "external" })
  const { data: externalReminderResponse, refetch: refetchExternalHistory } = useGetExternalCommunicationHistoryQuery(undefined, { skip: reminderListType === "internal" })


  useEffect(() => {
    if (reminderListType === "external") {
      refetchExternalHistory()
    } else {
      refetch()
    }
  }, [reminderListType])

  return (
    <div>
      <div className="flex items-center justify-between">
        <Typography variant='h1' className='text-2xl md:text-3xl'>Reminders List</Typography>
        <Button onClick={() => setreminderListType(reminderListType === "internal" ? "external" : "internal")} variant={"outline"}>
          {
            reminderListType === "internal" ? (
              <span>Show External Reminders</span>
            ) : (
              <span>Show Internal Reminders</span>
            )
          }
        </Button>

      </div>
      <br />
      {
        reminderListType === "external" ? (
          <ExternalReminderList data={externalReminderResponse?.data || []} />
        ) : (
          <ReminderList data={data?.data || []} />
        )
      }

    </div>
  )
}

export default Reminder