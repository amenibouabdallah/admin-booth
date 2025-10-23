"use client"

import { Edit2, Filter, FolderInput, Search, Users, X } from "lucide-react"
import { useEffect, useState } from "react"
import { BulkCategoryAssignment } from "@/components/bulk-category-assignment"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BoothListViewProps {
  onSelectBooth: (boothId: string) => void
  onViewBookings: (boothId: string) => void
}

interface Category {
  id: string
  name: string
  description: string
  _count?: {
    booths: number
  }
}

interface Booth {
  id: string
  name: string
  description: string
  number: number
  dimensions: {
    width: number
    height: number
  }
  priceWitouAddons: number
  finalPrice: number
  status: "Pending" | "Accepted" | "Rejected"
  image?: string
  enterpriseId?: string
  categoryId?: string
  enterprise?: {
    companyName: string
    email: string
  }
  category?: {
    id: string
    name: string
    description: string
  }
}

export function BoothListView({ onSelectBooth, onViewBookings }: BoothListViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [booths, setBooths] = useState<Booth[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showBulkAssignment, setShowBulkAssignment] = useState(false)

  useEffect(() => {
    fetchBooths()
    fetchCategories()
  }, [])

  const fetchBooths = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/booths")
      if (!response.ok) {
        throw new Error("Failed to fetch booths")
      }
      const data = await response.json()
      setBooths(data)
    } catch (error) {
      console.error("Error fetching booths:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const filteredBooths = booths.filter((booth) => {
    const matchesSearch =
      booth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booth.number.toString().includes(searchTerm) ||
      booth.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "uncategorized" && !booth.categoryId) ||
      booth.categoryId === selectedCategory

    const matchesStatus =
      selectedStatus === "all" || booth.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryStats = () => {
    const stats = categories.map((category) => ({
      ...category,
      count: booths.filter((booth) => booth.categoryId === category.id).length,
    }))
    const uncategorized = booths.filter((booth) => !booth.categoryId).length
    return { categorized: stats, uncategorized }
  }

  const getStatusStats = () => {
    return {
      pending: booths.filter((booth) => booth.status === "Pending").length,
      accepted: booths.filter((booth) => booth.status === "Accepted").length,
      rejected: booths.filter((booth) => booth.status === "Rejected").length,
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedStatus("all")
  }

  const hasActiveFilters = searchTerm || selectedCategory !== "all" || selectedStatus !== "all"

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading booths...</p>
      </div>
    )
  }

  const categoryStats = getCategoryStats()
  const statusStats = getStatusStats()

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Booth Management</h1>
          <p className="text-muted-foreground">
            Manage {booths.length} booth{booths.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowBulkAssignment(true)}>
          <FolderInput className="h-4 w-4 mr-2" />
          Bulk Assign Categories
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Booths</CardDescription>
            <CardTitle className="text-3xl">{booths.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{statusStats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl text-green-600">{statusStats.accepted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-red-600">{statusStats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Category Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Category Distribution</CardTitle>
          <CardDescription>Booths organized by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {categoryStats.categorized.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Badge variant={selectedCategory === category.id ? "default" : "outline"}>
                  {category.name}
                </Badge>
                <span className="text-sm font-semibold">{category.count}</span>
              </div>
            ))}
            {categoryStats.uncategorized > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => setSelectedCategory("uncategorized")}
              >
                <Badge variant={selectedCategory === "uncategorized" ? "default" : "outline"}>
                  Uncategorized
                </Badge>
                <span className="text-sm font-semibold">{categoryStats.uncategorized}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by booth name, number, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredBooths.length} of {booths.length} booth{booths.length !== 1 ? "s" : ""}
        </p>
      </div>

      {filteredBooths.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
              ? "No booths match your filters"
              : "No booths available"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooths.map((booth) => (
            <Card key={booth.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{booth.name}</CardTitle>
                    <CardDescription>Booth #{booth.number}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      booth.status === "Accepted"
                        ? "default"
                        : booth.status === "Pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {booth.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {booth.category && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline">{booth.category.name}</Badge>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dimensions</p>
                  <p className="text-sm font-medium">
                    {booth.dimensions.width}m × {booth.dimensions.height}m
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Base Price</p>
                  <p className="text-lg font-semibold">${booth.priceWitouAddons.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Final Price</p>
                  <p className="text-lg font-semibold text-primary">${booth.finalPrice.toFixed(2)}</p>
                </div>

                {booth.enterprise && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reserved by</p>
                    <p className="text-sm font-medium truncate">{booth.enterprise.companyName}</p>
                  </div>
                )}

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
      )}

      <BulkCategoryAssignment
        open={showBulkAssignment}
        onOpenChange={setShowBulkAssignment}
        booths={booths}
        categories={categories}
        onSuccess={() => {
          fetchBooths()
        }}
      />
    </div>
  )
}
