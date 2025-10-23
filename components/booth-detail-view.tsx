"use client"

import html2canvas from "html2canvas"
import { ArrowLeft, Check, Download, Edit2, Plus, Trash2, Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface BoothDetailViewProps {
  boothId: string
  onBack: () => void
}

interface Dimensions {
  width: number
  height: number
}

interface Addon {
  name: string
  description?: string
  price: number
}

interface Booth {
  id: string
  name: string
  description: string
  number: number
  dimensions: Dimensions
  priceWitouAddons: number
  finalPrice: number
  status: "Pending" | "Accepted" | "Rejected"
  addons: Addon[]
  image?: string
  enterpriseId?: string
  categoryId?: string
  reservationAcceptedAt?: string
  createdAt: string
  updatedAt: string
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

interface Category {
  id: string
  name: string
  description: string
}

export function BoothDetailView({ boothId, onBack }: BoothDetailViewProps) {
  const [booth, setBooth] = useState<Booth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Booth | null>(null)
  const [newAddon, setNewAddon] = useState({ name: "", description: "", price: 0 })
  const [editingAddonIndex, setEditingAddonIndex] = useState<number | null>(null)
  const [editingAddonData, setEditingAddonData] = useState<Addon | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchBooth()
    fetchCategories()
  }, [boothId])

  const fetchBooth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/booths/${boothId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch booth")
      }
      const data = await response.json()
      setBooth(data)
      setFormData(data)
    } catch (error) {
      console.error("Error fetching booth:", error)
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

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading booth details...</p>
      </div>
    )
  }

  if (!booth || !formData) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Booth not found</p>
      </div>
    )
  }

  const handleSave = async () => {
    if (!formData) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/booths/${boothId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          number: formData.number,
          dimensions: formData.dimensions,
          priceWitouAddons: formData.priceWitouAddons,
          finalPrice: formData.finalPrice,
          status: formData.status,
          addons: formData.addons,
          image: formData.image,
          categoryId: formData.categoryId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update booth")
      }

      const result = await response.json()
      setBooth(result.booth)
      setFormData(result.booth)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating booth:", error)
      alert("Failed to update booth. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(booth)
    setIsEditing(false)
  }

  const handleAddAddon = () => {
    if (!formData) return
    if (newAddon.name && newAddon.price > 0) {
      setFormData({
        ...formData,
        addons: [...formData.addons, { ...newAddon }],
      })
      setNewAddon({ name: "", description: "", price: 0 })
    }
  }

  const handleRemoveAddon = (index: number) => {
    if (!formData) return
    setFormData({
      ...formData,
      addons: formData.addons.filter((_, i) => i !== index),
    })
  }

  const handleEditAddon = (addon: Addon, index: number) => {
    setEditingAddonIndex(index)
    setEditingAddonData({ ...addon })
  }

  const handleSaveAddonEdit = () => {
    if (!formData || editingAddonIndex === null || !editingAddonData) return
    if (editingAddonData.name && editingAddonData.price > 0) {
      setFormData({
        ...formData,
        addons: formData.addons.map((a, i) => (i === editingAddonIndex ? editingAddonData : a)),
      })
      setEditingAddonIndex(null)
      setEditingAddonData(null)
    }
  }

  const handleCancelAddonEdit = () => {
    setEditingAddonIndex(null)
    setEditingAddonData(null)
  }

  const handleExportToImage = async () => {
    if (!contentRef.current) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      })

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `booth-${boothId}-details.png`
      link.click()
    } catch (error) {
      console.error("Error exporting to image:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Booths
        </Button>
        <Button onClick={handleExportToImage} disabled={isExporting} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export as Image"}
        </Button>
      </div>

      <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 bg-white rounded-lg">
        {/* Booth Photo */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booth Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {formData.image ? (
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No photo</p>
                  </div>
                )}
              </div>
              {isEditing && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Image URL</label>
                  <Input
                    value={formData.image || ""}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booth Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Booth Information</CardTitle>
                <CardDescription>Booth #{formData.number}</CardDescription>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Booth name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Booth description"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Booth Number</label>
                <Input
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: Number.parseInt(e.target.value) })}
                  disabled={!isEditing}
                  placeholder="Booth number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Width (m)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.dimensions.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, width: Number.parseFloat(e.target.value) },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Height (m)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.dimensions.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, height: Number.parseFloat(e.target.value) },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Price Without Add-ons ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceWitouAddons}
                  onChange={(e) => setFormData({ ...formData, priceWitouAddons: Number.parseFloat(e.target.value) })}
                  disabled={!isEditing}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Final Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.finalPrice}
                  onChange={(e) => setFormData({ ...formData, finalPrice: Number.parseFloat(e.target.value) })}
                  disabled={!isEditing}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as "Pending" | "Accepted" | "Rejected" })
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                ) : (
                  <Badge
                    variant={
                      formData.status === "Accepted" ? "default" : formData.status === "Pending" ? "secondary" : "destructive"
                    }
                  >
                    {formData.status}
                  </Badge>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                {isEditing ? (
                  <select
                    value={formData.categoryId || ""}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">No Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : formData.category ? (
                  <div>
                    <p className="font-medium">{formData.category.name}</p>
                    <p className="text-sm text-muted-foreground">{formData.category.description}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No category assigned</p>
                )}
              </div>

              {formData.enterprise && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-foreground mb-2 block">Enterprise Information</label>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Company:</span> {formData.enterprise.companyName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {formData.enterprise.email}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add-ons Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add-ons</CardTitle>
              <CardDescription>Manage additional services for this booth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.addons.length > 0 && (
                <div className="space-y-2">
                  {formData.addons.map((addon, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-muted rounded-lg border border-border">
                      {editingAddonIndex === index && editingAddonData ? (
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={editingAddonData.name}
                              onChange={(e) => setEditingAddonData({ ...editingAddonData, name: e.target.value })}
                              placeholder="Add-on name"
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={editingAddonData.price}
                              onChange={(e) =>
                                setEditingAddonData({
                                  ...editingAddonData,
                                  price: Number.parseFloat(e.target.value),
                                })
                              }
                              placeholder="Price"
                              className="w-24"
                            />
                          </div>
                          <Input
                            value={editingAddonData.description || ""}
                            onChange={(e) => setEditingAddonData({ ...editingAddonData, description: e.target.value })}
                            placeholder="Description (optional)"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveAddonEdit}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelAddonEdit}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{addon.name}</p>
                            {addon.description && (
                              <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                            )}
                            <p className="text-sm font-medium text-foreground mt-1">Price: ${addon.price.toFixed(2)}</p>
                          </div>
                          {isEditing && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAddon(addon, index)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveAddon(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="space-y-2">
                    <Input
                      placeholder="Add-on name"
                      value={newAddon.name}
                      onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newAddon.description}
                      onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={newAddon.price}
                      onChange={(e) => setNewAddon({ ...newAddon, price: Number.parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddAddon} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Add-on
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
