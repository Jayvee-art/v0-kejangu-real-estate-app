"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, Mail, Phone, Save, TrendingUp, MapPin, Shield } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface SiteSettings {
  siteName: string
  contactEmail: string
  contactPhone: string
  supportEmail: string
  address: string
  description: string
  socialMedia: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
  }
}

interface DashboardStats {
  totalUsers: number
  totalListings: number
  totalLandlords: number
  totalTenants: number
  recentActivity: Array<{
    id: string
    type: string
    message: string
    timestamp: string
  }>
}

export default function AdminPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "Kejangu",
    contactEmail: "info@kejangu.com",
    contactPhone: "+254 700 000 000",
    supportEmail: "support@kejangu.com",
    address: "Nairobi, Kenya",
    description: "Connecting landlords and tenants across Kenya",
    socialMedia: {
      facebook: "https://facebook.com/kejangu",
      twitter: "https://twitter.com/kejangu",
      instagram: "https://instagram.com/kejangu",
      linkedin: "https://linkedin.com/company/kejangu",
    },
  })

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    totalLandlords: 0,
    totalTenants: 0,
    recentActivity: [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is admin (you can implement proper admin role checking)
    if (!user || user.email !== "admin@kejangu.com") {
      router.push("/auth/login")
      return
    }

    fetchDashboardData()
    fetchSiteSettings()
  }, [user, router])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalUsers: 2547,
        totalListings: 523,
        totalLandlords: 234,
        totalTenants: 2313,
        recentActivity: [
          {
            id: "1",
            type: "user_registration",
            message: "New user John Doe registered as tenant",
            timestamp: "2 minutes ago",
          },
          {
            id: "2",
            type: "listing_created",
            message: "New property listed in Westlands",
            timestamp: "5 minutes ago",
          },
          {
            id: "3",
            type: "contact_made",
            message: "Tenant contacted landlord about property in Karen",
            timestamp: "10 minutes ago",
          },
          {
            id: "4",
            type: "user_registration",
            message: "New landlord Sarah Wilson joined",
            timestamp: "15 minutes ago",
          },
        ],
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSiteSettings = async () => {
    try {
      // Mock data - replace with actual API call
      // const response = await fetch("/api/admin/settings")
      // const data = await response.json()
      // setSiteSettings(data)
    } catch (error) {
      console.error("Error fetching site settings:", error)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Mock save - replace with actual API call
      // const response = await fetch("/api/admin/settings", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(siteSettings)
      // })

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Mock delay

      toast({
        title: "Settings saved successfully",
        description: "Site settings have been updated",
      })
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user || user.email !== "admin@kejangu.com") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Kejangu Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Admin Panel</Badge>
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="settings">Site Settings</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalListings}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Landlords</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLandlords}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +15% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tenants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +10% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activities and user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Site Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Manage your site's contact information and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Contact Email
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Contact Phone
                    </Label>
                    <Input
                      id="contactPhone"
                      value={siteSettings.contactPhone}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Support Email
                    </Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={siteSettings.supportEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Site Description</Label>
                  <Textarea
                    id="description"
                    value={siteSettings.description}
                    onChange={(e) => setSiteSettings({ ...siteSettings, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={siteSettings.socialMedia.facebook}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            socialMedia: { ...siteSettings.socialMedia, facebook: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={siteSettings.socialMedia.twitter}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            socialMedia: { ...siteSettings.socialMedia, twitter: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={siteSettings.socialMedia.instagram}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            socialMedia: { ...siteSettings.socialMedia, instagram: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={siteSettings.socialMedia.linkedin}
                        onChange={(e) =>
                          setSiteSettings({
                            ...siteSettings,
                            socialMedia: { ...siteSettings.socialMedia, linkedin: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">User management features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
