"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { format, differenceInDays } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Listing {
  _id: string
  title: string
  price: number
  location: string
  landlord: {
    _id: string
    name: string
  }
}

interface BookPropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: Listing
  onSuccess: () => void
}

export function BookPropertyDialog({ open, onOpenChange, listing, onSuccess }: BookPropertyDialogProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [notes, setNotes] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const days = differenceInDays(dateRange.to, dateRange.from)
      setTotalPrice(days * listing.price)
    } else {
      setTotalPrice(0)
    }
  }, [dateRange, listing.price])

  const resetForm = () => {
    setDateRange({})
    setNotes("")
    setTotalPrice(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to book a property.",
        variant: "destructive",
      })
      return
    }
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Missing Dates",
        description: "Please select both start and end dates for your booking.",
        variant: "destructive",
      })
      return
    }
    if (totalPrice <= 0) {
      toast({
        title: "Invalid Booking Duration",
        description: "Please select a valid date range for your booking.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
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
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          totalPrice,
          notes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Booking Request Sent",
          description: "Your booking request has been sent to the landlord.",
        })
        resetForm()
        onSuccess()
      } else {
        toast({
          title: "Booking Failed",
          description: data.message || "An error occurred while booking.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Property: {listing.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="dates">Booking Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dates"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground",
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick your dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or details for the landlord?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label>Price per month:</Label>
            <p className="text-lg font-semibold">KSh {listing.price.toLocaleString()}</p>
          </div>
          <div className="grid gap-2">
            <Label>Total Price:</Label>
            <p className="text-2xl font-bold">KSh {totalPrice.toLocaleString()}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !dateRange.from || !dateRange.to || totalPrice <= 0}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Booking Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
