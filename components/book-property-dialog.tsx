"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: string
  imageUrl?: string
  landlord: {
    name: string
    email: string
  }
}

interface BookPropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: Listing | null
  onSuccess: () => void
}

export function BookPropertyDialog({ open, onOpenChange, listing, onSuccess }: BookPropertyDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Reset form when dialog opens for a new listing or closes
    if (!open || !listing) {
      setStartDate(undefined)
      setEndDate(undefined)
      setNotes("")
    }
  }, [open, listing])

  const calculateTotalPrice = () => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate)
      return listing ? listing.price * days : 0
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in as a tenant to book a property.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (user.role !== "tenant") {
      toast({
        title: "Permission Denied",
        description: "Only tenants can book properties.",
        variant: "destructive",
      })
      return
    }

    if (!listing) {
      toast({
        title: "Error",
        description: "No property selected for booking.",
        variant: "destructive",
      })
      return
    }

    if (!startDate || !endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both start and end dates for your booking.",
        variant: "destructive",
      })
      return
    }

    if (startDate >= endDate) {
      toast({
        title: "Invalid Dates",
        description: "Start date must be before end date.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: listing._id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Booking Request Sent! 🎉",
          description: "Your booking request has been sent to the landlord. You will be notified once it's confirmed.",
        })
        onSuccess()
        onOpenChange(false)
      } else {
        const data = await response.json()
        toast({
          title: "Booking Failed",
          description: data.message || "Something went wrong with your booking.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Booking submission error:", error)
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) : 0
  const totalPrice = calculateTotalPrice()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Property: {listing?.title}</DialogTitle>
          <DialogDescription>
            Select your desired dates and confirm your booking for {listing?.location}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dates">Booking Dates</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Start Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>End Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < (startDate || new Date()) || date < new Date("1900-01-01")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or notes for the landlord?"
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-gray-600">{totalDays > 0 ? `${totalDays} day(s)` : "Select dates"}</div>
            <div className="text-lg font-bold">Total: KSh {totalPrice.toLocaleString()}</div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !startDate || !endDate || totalDays <= 0}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
