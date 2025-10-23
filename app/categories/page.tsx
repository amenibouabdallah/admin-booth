"use client"

import { ArrowLeft, Edit2, Plus, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Dimensions {
  width: number
  height: number
}

interface Addon {
  name: string
  description?: string
  price: number
}

interface Category {
  id: string
  name: string
  description: string
  dimensions: Dimensions
  priceWitouAddons: number
  addons: Addon[]
  image?: string
  _count?: {
    booths: number
  }
}

export default function CategoriesPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    description: "",
    dimensions: { width: 0, height: 0 },
    priceWitouAddons: 0,
    addons: [],
    image: "",
  })
  const [newAddon, setNewAddon] = useState({ name: "", description: "", price: 0 })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      fetchCategories()
    }
  }, [router])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAddon = () => {
    if (newAddon.name && newAddon.price > 0) {
      setFormData({
        ...formData,
        addons: [...(formData.addons || []), { ...newAddon }],
      })
      setNewAddon({ name: "", description: "", price: 0 })
    }
  }

  const handleRemoveAddon = (index: number) => {
    setFormData({
      ...formData,
      addons: formData.addons?.filter((_, i) => i !== index) || [],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories"
      const method = editingCategory ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      await fetchCategories()
      handleCloseForm()
    } catch (error) {
      console.error("Error saving category:", error)
      alert(error instanceof Error ? error.message : "Failed to save category")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData(category)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      await fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      alert(error instanceof Error ? error.message : "Failed to delete category")
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      dimensions: { width: 0, height: 0 },
      priceWitouAddons: 0,
      addons: [],
      image: "",
    })
    setNewAddon({ name: "", description: "", price: 0 })
  }

  if (!isAuthenticated) return null

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Category Management</h1>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <p className="text-muted-foreground">Loading categories...</p>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No categories defined yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Dimensions</p>
                    <p className="text-sm font-medium">
                      {category.dimensions.width}m × {category.dimensions.height}m
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Base Price</p>
                    <p className="text-lg font-semibold">${category.priceWitouAddons.toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Add-ons</p>
                    <Badge variant="outline">{category.addons.length} defined</Badge>
                  </div>

                  {category._count && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Booths Using</p>
                      <Badge variant="secondary">{category._count.booths} booth(s)</Badge>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create New Category"}</DialogTitle>
            <DialogDescription>
              Define a category template that can be assigned to multiple booths
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Booth, Premium Booth"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this category..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Width (m)</label>
                <Input
                  required
                  type="number"
                  step="0.1"
                  value={formData.dimensions?.width || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions!,
                        width: Number.parseFloat(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Height (m)</label>
                <Input
                  required
                  type="number"
                  step="0.1"
                  value={formData.dimensions?.height || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions!,
                        height: Number.parseFloat(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Base Price ($)</label>
              <Input
                required
                type="number"
                step="0.01"
                value={formData.priceWitouAddons || 0}
                onChange={(e) =>
                  setFormData({ ...formData, priceWitouAddons: Number.parseFloat(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Image URL (optional)</label>
              <Input
                value={formData.image || ""}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Add-ons</label>
              {formData.addons && formData.addons.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.addons.map((addon, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold">{addon.name}</p>
                        {addon.description && <p className="text-sm text-muted-foreground">{addon.description}</p>}
                        <p className="text-sm font-medium mt-1">${addon.price.toFixed(2)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAddon(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 p-3 border rounded-lg">
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
                <Button type="button" onClick={handleAddAddon} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Add-on
                </Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
