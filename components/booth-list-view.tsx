"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit2, Users } from "lucide-react"
import { mockBooths } from "@/lib/mock-data"

interface BoothListViewProps {
  onSelectBooth: (boothId: number) => void
  onViewBookings: (boothId: number) => void
}

export function BoothListView({ onSelectBooth, onViewBookings }: BoothListViewProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredBooths = mockBooths.filter(
    (booth) => booth.name.toLowerCase().includes(searchTerm.toLowerCase()) || booth.id.toString().includes(searchTerm),
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Booth Management</h1>
        <p className="text-muted-foreground">Manage 55 booths and their booking requests</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by booth name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooths.map((booth) => (
          <Card key={booth.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{booth.name}</CardTitle>
                  <CardDescription>Booth #{booth.id}</CardDescription>
                </div>
                <Badge variant={booth.status === "available" ? "default" : "secondary"}>{booth.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-lg font-semibold">${booth.price}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Booking Requests</p>
                <Badge variant="outline" className="bg-accent/10">
                  {booth.bookingRequests.length} pending
                </Badge>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => onSelectBooth(booth.id)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" className="flex-1" onClick={() => onViewBookings(booth.id)}>
                  <Users className="h-4 w-4 mr-2" />
                  Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
