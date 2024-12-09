import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertTriangle, Mail } from 'lucide-react'
import Link from "next/link"
import { SendEmailButton } from "./ReminderAMCDetail"

interface Contact {
    name: string
    email: string
    phone: string
    designation: string
    opt_for_email_reminder: boolean
}

interface AgreementExpiryDetailsProps {
    clientName: string
    clientId: string
    productName: string
    expiryDate: string
    daysUntilExpiry: number
    contacts: Contact[]
    orderLink: string
    reminderId?: string
}

export default function AgreementExpiryDetails({
    clientName,
    clientId,
    productName,
    expiryDate,
    daysUntilExpiry,
    contacts,
    orderLink,
    reminderId
}: AgreementExpiryDetailsProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <Card className="w-full mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Agreement Expiry Details</CardTitle>
                    <Badge variant="secondary" className="text-sm">
                        {daysUntilExpiry} days until expiry
                    </Badge>
                </div>
                <CardDescription>Agreement Term End Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                        <p className="text-lg font-semibold">{clientName}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Product</h3>
                        <p className="text-lg font-semibold">{productName}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
                        <p>{formatDate(expiryDate)}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <p className="text-sm font-medium text-warning">
                        Agreement will expire in {daysUntilExpiry} days
                    </p>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    {contacts.map((contact, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start mb-4 pb-4 border-b last:border-b-0 px-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="text-sm break-words">{contact.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="text-sm break-words">{contact.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="text-sm break-words">{contact.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Designation</p>
                                <p className="text-sm break-words">{contact.designation}</p>
                            </div>
                            <div>
                                <SendEmailButton reminderId={reminderId || ""} emailIndex={index} text="Send Email" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-6">
                    <Link href={orderLink} target="_blank" rel="noopener noreferrer" passHref>
                        <Button >
                            View Order Details
                        </Button>
                    </Link>
                    <Link href={clientId} target="_blank" rel="noopener noreferrer" passHref>
                        <Button >
                            View Client Detail
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

