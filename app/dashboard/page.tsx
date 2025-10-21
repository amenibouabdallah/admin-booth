"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BoothListView } from "@/components/booth-list-view"
import { BoothDetailView } from "@/components/booth-detail-view"
import { BookingRequestsView } from "@/components/booking-requests-view"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<"list" | "detail" | "bookings">("list")
  const [selectedBoothId, setSelectedBoothId] = useState<number | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleSelectBooth = (boothId: number) => {
    setSelectedBoothId(boothId)
    setCurrentView("detail")
  }

  const handleViewBookings = (boothId: number) => {
    setSelectedBoothId(boothId)
    setCurrentView("bookings")
  }

  const handleBack = () => {
    setCurrentView("list")
    setSelectedBoothId(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/login")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with Logout */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Booth Management Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {currentView === "list" && (
        <BoothListView onSelectBooth={handleSelectBooth} onViewBookings={handleViewBookings} />
      )}
      {currentView === "detail" && selectedBoothId !== null && (
        <BoothDetailView boothId={selectedBoothId} onBack={handleBack} />
      )}
      {currentView === "bookings" && selectedBoothId !== null && (
        <BookingRequestsView boothId={selectedBoothId} onBack={handleBack} />
      )}
    </main>
  )
}
