"use client"

import { Download, FolderKanban, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BookingRequestsView } from "@/components/booking-requests-view"
import { BoothDetailView } from "@/components/booth-detail-view"
import { BoothListView } from "@/components/booth-list-view"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<"list" | "detail" | "bookings">("list")
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleSelectBooth = (boothId: string) => {
    setSelectedBoothId(boothId)
    setCurrentView("detail")
  }

  const handleViewBookings = (boothId: string) => {
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

  const exportBoothsCSV = async () => {
    try {
      // Static booth data (export-only, no API call)
      const data = [
        { id: 1, name: "Booth A", location: "Hall 1", status: "available", owner: "Alice", createdAt: "2025-01-10" },
        { id: 2, name: "Booth B", location: "Hall 2", status: "occupied", owner: "Bob", createdAt: "2025-02-12" },
        { id: 3, name: "Booth C", location: "Hall 3", status: "maintenance", owner: "Charlie", createdAt: "2025-03-05" },
      ]

      if (!Array.isArray(data) || data.length === 0) {
        alert("No booth data to export")
        return
      }

      const keys = Object.keys(data[0])
      const csvRows = [
        keys.join(","), // header
        ...data.map((row: Record<string, any>) =>
          keys
            .map((k) => {
              const cell = row[k] ?? ""
              const escaped = String(cell).replace(/"/g, '""')
              return `"${escaped}"`
            })
            .join(",")
        ),
      ]
      const csv = csvRows.join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "booths.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("Could not export CSV. Check console for details.")
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with Logout */}
      <div className="border-b bg-card sticky  top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">JETConnect Booth Management Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/categories")} size="sm">
              <FolderKanban className="h-4 w-4 mr-2" />
              Categories
            </Button>
            <Button variant="outline" onClick={exportBoothsCSV} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
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
