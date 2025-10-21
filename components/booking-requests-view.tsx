"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, X, Eye } from "lucide-react"
import { mockBooths } from "@/lib/mock-data"
import { EnterpriseDetailsModal } from "./enterprise-details-modal"

interface BookingRequestsViewProps {
  boothId: number
  onBack: () => void
}

export function BookingRequestsView({ boothId, onBack }: BookingRequestsViewProps) {
  const booth = mockBooths.find((b) => b.id === boothId)
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null)
  const [requestStatuses, setRequestStatuses] = useState<Record<number, string>>({})

  if (!booth) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Booth not found</p>
      </div>
    )
  }

  const handleAccept = (requestId: number) => {
    setRequestStatuses((prev) => {
      const updated = { ...prev, [requestId]: "accepted" }
      booth.bookingRequests.forEach((request) => {
        if (request.id !== requestId && (!prev[request.id] || prev[request.id] === "pending")) {
          updated[request.id] = "declined"
        }
      })
      return updated
    })
  }

  const handleDecline = (requestId: number) => {
    setRequestStatuses((prev) => ({ ...prev, [requestId]: "declined" }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "declined":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    }
  }

  return (
    <div className="p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Booths
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Booking Requests</h1>
        <p className="text-muted-foreground">
          {booth.name} - {booth.bookingRequests.length} requests
        </p>
      </div>

      <div className="space-y-4">
        {booth.bookingRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No booking requests yet</p>
            </CardContent>
          </Card>
        ) : (
          booth.bookingRequests.map((request) => {
            const status = requestStatuses[request.id] || "pending"
            return (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{request.enterpriseName}</CardTitle>
                      <CardDescription>Request ID: {request.id}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Contact Person</p>
                      <p className="font-medium">{request.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-medium text-sm">{request.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium">{request.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Requested Date</p>
                      <p className="font-medium">{request.requestedDate}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
                    <Badge variant="outline">{request.paymentMethod}</Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAccept(request.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDecline(request.id)}>
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {selectedRequest !== null && (
        <EnterpriseDetailsModal
          request={booth.bookingRequests.find((r) => r.id === selectedRequest)!}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  )
}
