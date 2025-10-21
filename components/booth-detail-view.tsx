"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Upload, Download, Edit2, Check, X } from "lucide-react"
import { mockBooths } from "@/lib/mock-data"
import html2canvas from "html2canvas"

interface BoothDetailViewProps {
  boothId: number
  onBack: () => void
}

interface Addon {
  id: number
  name: string
  price: number
}

export function BoothDetailView({ boothId, onBack }: BoothDetailViewProps) {
  const booth = mockBooths.find((b) => b.id === boothId)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(
    booth || {
      id: 0,
      name: "",
      description: "",
      price: 0,
      photo: "",
      status: "available",
      addons: [],
      bookingRequests: [],
    },
  )
  const [newAddon, setNewAddon] = useState({ name: "", price: 0 })
  const [editingAddonId, setEditingAddonId] = useState<number | null>(null)
  const [editingAddonData, setEditingAddonData] = useState<Addon | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  if (!booth) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Booth not found</p>
      </div>
    )
  }

  const handleAddAddon = () => {
    if (newAddon.name && newAddon.price > 0) {
      setFormData({
        ...formData,
        addons: [...formData.addons, { ...newAddon, id: Date.now() }],
      })
      setNewAddon({ name: "", price: 0 })
    }
  }

  const handleRemoveAddon = (addonId: number) => {
    setFormData({
      ...formData,
      addons: formData.addons.filter((a) => a.id !== addonId),
    })
  }

  const handleEditAddon = (addon: Addon) => {
    setEditingAddonId(addon.id)
    setEditingAddonData({ ...addon })
  }

  const handleSaveAddonEdit = () => {
    if (editingAddonData && editingAddonData.name && editingAddonData.price > 0) {
      setFormData({
        ...formData,
        addons: formData.addons.map((a) => (a.id === editingAddonId ? editingAddonData : a)),
      })
      setEditingAddonId(null)
      setEditingAddonData(null)
    }
  }

  const handleCancelAddonEdit = () => {
    setEditingAddonId(null)
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
                {formData.photo ? (
                  <img
                    src={formData.photo || "/placeholder.svg"}
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
                <Button variant="outline" className="w-full bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
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
                <CardDescription>Booth #{boothId}</CardDescription>
              </div>
              <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Save" : "Edit"}
              </Button>
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
                <label className="text-sm font-medium text-foreground mb-2 block">Price ($)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                  disabled={!isEditing}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Badge variant={formData.status === "available" ? "default" : "secondary"}>{formData.status}</Badge>
              </div>
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
                  {formData.addons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                    >
                      {editingAddonId === addon.id && editingAddonData ? (
                        <div className="flex-1 flex gap-2 items-center">
                          <Input
                            value={editingAddonData.name}
                            onChange={(e) => setEditingAddonData({ ...editingAddonData, name: e.target.value })}
                            placeholder="Add-on name"
                            className="flex-1"
                          />
                          <Input
                            type="number"
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
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{addon.name}</p>
                            <p className="text-sm text-muted-foreground">Price: ${addon.price.toFixed(2)}</p>
                          </div>
                          {isEditing && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAddon(addon)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveAddon(addon.id)}>
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
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Add-on name"
                      value={newAddon.name}
                      onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                    />
                    <Input
                      type="number"
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
