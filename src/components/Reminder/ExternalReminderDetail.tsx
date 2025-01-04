import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, Calendar, Clock, User, Briefcase, Send } from 'lucide-react'
import { IEmailTemplate, IReminderObject } from "@/redux/api/reminder"

interface ReminderPreviewProps {
    reminder: IReminderObject & { email_template?: IEmailTemplate }
}

export default function ReminderPreview({ reminder }: ReminderPreviewProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                <CardTitle className="text-2xl font-bold">Reminder Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Mail className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">Subject:</span>
                            <span>{reminder.subject}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">Sent on:</span>
                            <span>{reminder.createdAt ? formatDate(reminder.createdAt.toString()) : 'Not available'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">To:</span>
                            <span>{reminder.to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Briefcase className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">Client:</span>
                            <span>{reminder.client.name}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">Industry:</span>
                            <span className="capitalize">{reminder.client.industry}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Send className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">Status:</span>
                            <Badge variant={reminder.status === 'sent' ? 'success' : 'secondary'}>
                                {reminder.status}
                            </Badge>
                        </div>
                        {/* <div>
                            <span className="font-semibold">Products:</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {reminder.order.products.map((product, index) => (
                                    <Badge key={index} variant="outline">{product}</Badge>
                                ))}
                            </div>
                        </div> */}
                    </div>
                </div>
                <Accordion type="single" collapsible className="mt-6">
                    <AccordionItem value="email-content">
                        <AccordionTrigger>View Email Content</AccordionTrigger>
                        <AccordionContent>
                            <div
                                className="mt-4 p-4 bg-gray-50 rounded-md overflow-auto max-h-96"
                                dangerouslySetInnerHTML={{ __html: reminder.body }}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}

