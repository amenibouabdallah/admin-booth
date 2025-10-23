"use client"

import { Check, Loader2, X } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: string
  name: string
  description: string
}

interface Booth {
  id: string
  name: string
  number: number
  category?: {
    id: string
    name: string
  }
}

interface BulkCategoryAssignmentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booths: Booth[]
  categories: Category[]
  onSuccess: () => void
}

export function BulkCategoryAssignment({
  open,
  onOpenChange,
  booths,
  categories,
  onSuccess,
}: BulkCategoryAssignmentProps) {
  const [selectedBooths, setSelectedBooths] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleBooth = (boothId: string) => {
    const newSelected = new Set(selectedBooths)
    if (newSelected.has(boothId)) {
      newSelected.delete(boothId)
    } else {
      newSelected.add(boothId)
    }
    setSelectedBooths(newSelected)
  }

  const selectAll = () => {
    setSelectedBooths(new Set(booths.map((b) => b.id)))
  }

  const deselectAll = () => {
    setSelectedBooths(new Set())
  }

  const handleSubmit = async () => {
    if (selectedBooths.size === 0 || !selectedCategory) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/booths/bulk-update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boothIds: Array.from(selectedBooths),
          categoryId: selectedCategory === "none" ? null : selectedCategory,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update booths")
      }

      onSuccess()
      setSelectedBooths(new Set())
      setSelectedCategory("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating booths:", error)
      alert("Failed to update booths. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedBooths(new Set())
      setSelectedCategory("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Category Assignment</DialogTitle>
          <DialogDescription>
            Assign a category to multiple booths at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Remove Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Select Booths ({selectedBooths.size} selected)
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={isSubmitting}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={isSubmitting}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-2">
                {booths.map((booth) => (
                  <div
                    key={booth.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedBooths.has(booth.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                      }`}
                    onClick={() => toggleBooth(booth.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedBooths.has(booth.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                          }`}
                      >
                        {selectedBooths.has(booth.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {booth.name}{" "}
                          <span className="text-muted-foreground">#{booth.number}</span>
                        </p>
                        {booth.category && (
                          <Badge variant="outline" className="mt-1">
                            {booth.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedBooths.size === 0 || !selectedCategory || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? "Updating..."
              : `Assign to ${selectedBooths.size} Booth${selectedBooths.size !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
