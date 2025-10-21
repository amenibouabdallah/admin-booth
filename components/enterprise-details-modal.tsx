"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface EnterpriseDetailsModalProps {
  request: any
  onClose: () => void
}

export function EnterpriseDetailsModal({ request, onClose }: EnterpriseDetailsModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{request.enterpriseName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enterprise Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Enterprise Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                <p className="font-medium">{request.enterpriseName}</p>
              </div>
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
                <p className="text-sm text-muted-foreground mb-1">Company Address</p>
                <p className="font-medium text-sm">{request.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                <p className="font-medium">{request.registrationNumber}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-foreground">Booking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Requested Date</p>
                <p className="font-medium">{request.requestedDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-medium">{request.duration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Booth Size</p>
                <p className="font-medium">{request.boothSize}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Number of Staff</p>
                <p className="font-medium">{request.numberOfStaff}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-foreground">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <Badge variant="outline">{request.paymentMethod}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="font-medium text-lg">${request.amount}</p>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-foreground">Payment Proof</h3>
            <div className="bg-muted rounded-lg p-4 aspect-video flex items-center justify-center overflow-hidden">
              {request.paymentProof ? (
                <img
                  src={request.paymentProof || "/placeholder.svg"}
                  alt="Payment proof"
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-muted-foreground">No payment proof uploaded</p>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {request.notes && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-foreground">Additional Notes</h3>
              <p className="text-sm text-foreground bg-muted p-3 rounded-lg">{request.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
