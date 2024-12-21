"use client"
import { REMINDER_TEMPLATES, useGetReminderByIdQuery, useSentEmailToClientMutation } from '@/redux/api/reminder'
import React, { useEffect, useState } from 'react'
import Loading from '../ui/loading'
import Typography from '../ui/Typography'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ReminderAMCDetail from './ReminderAMCDetail'
import { useAppSelector } from '@/redux/hook'
import EmailBodyEditor from '../RichTextEditor/RichTextEditor'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '@/components/ui/button'
import { Expand, Send } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


interface IProps {
  id: string
  emailIndex: number
}

const DEFAULT_TEMPLATES = [
  {
    id: "amc-pending",
    key: REMINDER_TEMPLATES.SEND_PENDING_AMC_REMINDER,
    name: "AMC Payment Pending",
    content: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 10px 20px 10px 20px; line-height: 1.6; color: #333;">
        <h1>AMC Payment Reminder</h1>
        <hr>
        
        <p style="margin: 16px 0;">Dear <strong>__1__</strong>,</p>
        
        <p style="margin: 16px 0;">This is a reminder that your Annual Maintenance Contract (AMC) payment is pending.</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="font-weight: 600; margin-bottom: 12px;">Details:</p>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin: 8px 0;"><span style="color: #64748b;">AMC Period:</span> <span style="color: #0f172a; font-weight: 500;">__3__</span></li>
            <li style="margin: 8px 0;"><span style="color: #64748b;">Amount Due:</span> <span style="color: #0f172a; font-weight: 500;">₹__4__</span></li>
            <li style="margin: 8px 0;"><span style="color: #64748b;">Due Date:</span> <span style="color: #0f172a; font-weight: 500;">__5__</span></li>
          </ul>
        </div>

        <p style="margin: 16px 0;">Please process the payment at your earliest convenience to ensure uninterrupted service.</p>
        
        <p style="margin: 16px 0;">For any queries, please feel free to contact us.</p>
        
        <div style="margin-top: 30px; color: #4b5563;">
          <p style="margin: 4px 0;">Best regards,</p>
          <p style="margin: 4px 0; font-weight: 600;">Support Team</p>
        </div>
      </div>
    `,
    dynamic_variables: [
      { id: 1, key: "__1__", field: "name" },
      { id: 2, key: "__2__", field: "email" },
      { id: 3, key: "__3__", field: "amc_cycle" },
      { id: 4, key: "__4__", field: "amount" },
      { id: 5, key: "__5__", field: "amc_date" }
    ]
  },
  {
    id: "amc-upcoming",
    key: REMINDER_TEMPLATES.SEND_UPCOMING_AMC_REMINDER,
    name: "Upcoming AMC Payment Reminder",
    content: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <h1 style="color: #0f172a; font-size: 24px; text-align: center;">Annual Maintenance Contract (AMC) Reminder</h1>
        <hr style="border: 0; height: 1px; background-color: #e5e7eb; margin: 20px 0;">
        
        <p style="margin: 16px 0;">Dear <strong>__1__</strong>,</p>
        
        <p style="margin: 16px 0;">We hope this message finds you well. This is a friendly reminder regarding the upcoming payment for your Annual Maintenance Contract (AMC) associated with <strong>__2__</strong>.</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="font-weight: 600; margin-bottom: 12px;">AMC Details:</p>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
            <li style="margin: 8px 0;"><strong>Client:</strong> __1__</li>
            <li style="margin: 8px 0;"><strong>Product:</strong> __2__</li>
            <li style="margin: 8px 0;"><strong>AMC Period:</strong> __3__</li>
            <li style="margin: 8px 0;"><strong>Amount:</strong> ₹__4__</li>
            <li style="margin: 8px 0;"><strong>Upcoming days:</strong> __5__ Days</li>
          </ul>
        </div>
        
        <p style="margin: 16px 0;">To continue uninterrupted service, we kindly request that you complete the payment before the due date.</p>
  
        <p style="margin: 16px 0;">If you have any questions or need assistance, feel free to contact our support team.</p>
  
        <div style="margin-top: 30px; color: #4b5563;">
          <p style="margin: 4px 0;">Best regards,</p>
          <p style="margin: 4px 0; font-weight: 600;">Support Team</p>
        </div>
      </div>
    `,
    dynamic_variables: [
      { id: 1, key: "__1__", field: "name" },
      { id: 2, key: "__2__", field: "product_name" },
      { id: 3, key: "__3__", field: "amc_cycle" },
      { id: 4, key: "__4__", field: "amount" },
      { id: 5, key: "__5__", field: "upcoming" },
    ]
  },
  {
    id: "agreement-expiry-reminder",
    key: REMINDER_TEMPLATES.SEND_AGREEMENT_EXPIRY_REMINDER,
    name: "Agreement Expiry Reminder",
    content: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        <h1 style="color: #0f172a; font-size: 24px; text-align: center;">Agreement Expiry Reminder</h1>
        <hr style="border: 0; height: 1px; background-color: #e5e7eb; margin: 20px 0;">
        
        <p style="margin: 16px 0;">Dear <strong>__1__</strong>,</p>
        
        <p style="margin: 16px 0;">We hope this email finds you well. This is a friendly reminder that the agreement for your product, <strong>__2__</strong>, with <strong>__3__</strong>, is nearing its expiry date.</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="font-weight: 600; margin-bottom: 12px;">Agreement Details:</p>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
            <li style="margin: 8px 0;"><strong>Client:</strong> __3__</li>
            <li style="margin: 8px 0;"><strong>Product:</strong> __2__</li>
            <li style="margin: 8px 0;"><strong>Expiry Date:</strong> __4__</li>
            <li style="margin: 8px 0;"><strong>Days Remaining:</strong> __5__</li>
          </ul>
        </div>
        
        <p style="margin: 16px 0;">To ensure uninterrupted services, please review the agreement and take necessary actions before the expiry date.</p>

  
        <p style="margin: 16px 0;">If you have any questions or need assistance, please do not hesitate to contact us.</p>
  
        <div style="margin-top: 30px; color: #4b5563;">
          <p style="margin: 4px 0;">Best regards,</p>
          <p style="margin: 4px 0; font-weight: 600;">Support Team</p>
        </div>
      </div>
    `,
    dynamic_variables: [
      { id: 1, key: "__1__", field: "contact_name" },
      { id: 2, key: "__2__", field: "product" },
      { id: 3, key: "__3__", field: "name" },
      { id: 4, key: "__4__", field: "expiry_date" },
      { id: 5, key: "__5__", field: "upcoming" },

    ]
  }
]


function dynamicVariableParser(content: string, templateVariables: any[], data: { [key: string]: string }) {
  let parsedContent = content;
  templateVariables.forEach(variable => {
    const value = data[variable.field] || '';
    parsedContent = parsedContent.replaceAll(variable.key, value);
  });
  return parsedContent;
}

export interface IEmailInputProps {
  subject: string
  body: string
  from: string
  to: string
  bcc?: string
  cc?: string
}

const internalEmails = [
  {
    name: "Nilesh Jaiswar",
    email: "jaiswarnilesh2002@gmail.com"
  },
]

const Email: React.FC<IProps> = ({ id, emailIndex }) => {
  const { data } = useGetReminderByIdQuery(id)
  const products = useAppSelector((state) => state.user.products)

  const [selectedTemplate, setSelectedTemplate] = useState({ id: "", name: "" })
  const [emailBodyContent, setEmailBodyContent] = useState("")

  const [sendEmailToClientApi, { isLoading }] = useSentEmailToClientMutation()

  const form = useForm<IEmailInputProps>({
    defaultValues: {
      subject: "",
      body: "",
      from: "",
      to: "",
      bcc: "",
      cc: "",
    }
  })

  let payload: { [key: string]: string } = {}

  const emailBody = (template: typeof DEFAULT_TEMPLATES[0]) => {
    if (!template || !reminder) return

    switch (template.id) {
      case "amc-pending":
        payload = {
          name: data?.data?.client.point_of_contacts[emailIndex]?.name || "",
          email: form.getValues("to"),
          amc_cycle: String(reminder?.context?.amc?.cycle || ""),
          amount: String(reminder?.context?.amc?.amount || ""),
          amc_date: String(reminder?.context?.amc?.date || "")
        }
        break;
      case "amc-upcoming":
        payload = {
          name: data?.data?.client.point_of_contacts[emailIndex]?.name || "",
          product_name: getProductNames(reminder?.order?.products || []) || "",
          amc_cycle: String(reminder?.context?.amc?.cycle || ""),
          amount: String(reminder?.context?.amc?.amount || ""),
          upcoming: String(reminder?.context?.amc?.upcoming || 0)
        }
        break;
      case "agreement-expiry-reminder":
        payload = {
          contact_name: data?.data?.client.point_of_contacts[emailIndex]?.name || "",
          name: reminder?.client?.name || "",
          product: getProductNames(reminder?.order?.products || []) || "",
          expiry_date: String(reminder?.context?.agreement?.expiryDate || ""),
          upcoming: String(reminder?.context?.agreement?.upcoming || 0)
        }
        break;
    }



    if (template) {
      const emailBody = dynamicVariableParser(template.content, template.dynamic_variables, payload)
      setEmailBodyContent(emailBody)
      form.setValue("body", emailBody)
    }

  }

  useEffect(() => {
    if (data?.data) {
      form.setValue("to", data.data.client.point_of_contacts[emailIndex].email)
      form.setValue("from", internalEmails[0].email)
      form.setValue("subject", data.data.subject)
      const template = DEFAULT_TEMPLATES.find((template) => template.key === data.data.template)
      if (template) {
        emailBody(template)
        setSelectedTemplate(template)
      }
    }
  }, [data?.data])

  if (!data?.data) return <Loading />

  const reminder = data.data
  const client = data.data.client


  const getProductNames = (productIds: string[]) => {
    if (!products) return ""
    return productIds.map((id) => {
      const product = products.find((product) => product._id === id)
      return product?.name || ""
    }).join(", ")
  }

  const contactInfos = data.data.client.point_of_contacts

  const renderReminderInfo = () => {
    switch (data.data.template) {
      case REMINDER_TEMPLATES.SEND_PENDING_AMC_REMINDER:
        return <ReminderAMCDetail
          reminderId={reminder._id}
          clientName={reminder?.client.name || ""}
          productName={getProductNames(reminder?.order?.products) || ""}
          amcCycle={reminder?.context.amc.cycle || ""}
          amcAmount={reminder?.context.amc.amount || ""}
          amcDueDate={reminder?.context.amc.date || ""}
          overduedays={reminder?.context.amc.overdue || 0}
          upcomingDays={reminder?.context.amc.upcomingDays || 0}
          contacts={reminder?.client.point_of_contacts || []}
          amcLink={`/amc/${reminder?.amc._id}`}
          showContacts={false}
          type={reminder?.template === REMINDER_TEMPLATES.SEND_PENDING_AMC_REMINDER ? "pending" : reminder?.template === REMINDER_TEMPLATES.SEND_UPCOMING_AMC_REMINDER ? "upcoming" : "pending"}
          clientId={reminder?.client._id || ""}
        />
    }
  }

  const onSubmit = async (data: IEmailInputProps) => {
    // validate
    if (!data.from || !data.to || !data.subject || !data.body) {
      toast({
        variant: "destructive",
        description: "Please fill all fields"
      })
      return
    }

    try {
      await sendEmailToClientApi({
        ...data,
        to: data.to,
        from: data.from,
        subject: data.subject,
        body: data.body
      }).unwrap()
      toast({
        variant: "success",
        description: "Email sent successfully"
      })

    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        description: "Failed to send email"
      })
    }
  }

  return (
    <div>
      <Typography variant='h1' className=''>Send Reminder Email To {client.name}</Typography>
      <div className="py-4">
        {renderReminderInfo()}
      </div>
      <div className="flex justify-end">
        <Select onValueChange={(val) => {
          const template = DEFAULT_TEMPLATES.find((template) => template.id === val)
          setSelectedTemplate(template || { id: "", name: "" })
          if (template) {
            emailBody(template)
          }
        }}>
          <SelectTrigger className="min-w-[180px] max-w-fit" >
            <SelectValue placeholder={selectedTemplate.name || "Select a Template"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Templates</SelectLabel>
              {DEFAULT_TEMPLATES.map((template) => (
                <SelectItem
                  value={template.id}
                  className='cursor-pointer'
                  key={template.id}
                >
                  {template.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 flex  items-start gap-3 h-full ">
        <div className="border rounded-lg relative p-4 bg-card text-card-foreground h-full w-4/5 prose [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2">
          <div className="absolute top-1 right-1 cursor-pointer">
            <Dialog>
              <DialogTrigger>
                <Expand className='size-5' />
              </DialogTrigger>
              <DialogContent className='max-w-full'>
                <DialogTitle></DialogTitle>
                <div dangerouslySetInnerHTML={{
                  __html: form.getValues("body")
                }} />
              </DialogContent>
            </Dialog>

          </div>
          <div dangerouslySetInnerHTML={{
            __html: form.getValues("body")
          }} />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='md:w-full rounded-lg border bg-card text-card-foreground shadow-sm p-4' >
            <FormField
              name="from"
              control={form.control}
              render={({ field }) => (
                <FormItem className=' mb-4'>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <Select onValueChange={(val) => field.onChange(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sender email" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {internalEmails.map((email) => (
                            <SelectItem key={email.email} value={email.email}>
                              {email.name} ({email.email})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="to"
              control={form.control}
              render={({ field }) => (
                <FormItem className=' mb-4'>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Select onValueChange={(val) => field.onChange(val)} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={field.value || "Select recipient email"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {contactInfos?.map((contact) => (
                            <SelectItem key={contact.email} value={contact.email}>
                              {contact.name} ({contact.email})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="cc"
              control={form.control}
              render={({ field }) => (
                <FormItem className=' mb-4'>
                  <FormLabel>CC</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="bcc"
              control={form.control}
              render={({ field }) => (
                <FormItem className=' mb-4'>
                  <FormLabel>BCC</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="subject"
              control={form.control}
              render={({ field }) => (
                <FormItem className=' mb-4'>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="body"
              control={form.control}
              render={({ field }) => (
                <FormItem className=''>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <EmailBodyEditor value={emailBodyContent} onChange={(content) => {
                      field.onChange(content)
                      setEmailBodyContent(content)
                    }} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end mt-4 ">
              <Button type="submit" className='w-full' disabled={isLoading} loading={{ isLoading, loader: "tailspin" }}>
                <Send className="mr-2" />
                Send Email
              </Button>
            </div>
          </form>

        </Form>
      </div>
    </div>
  )
}

export default Email