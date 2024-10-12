'use client'

import React, { useState } from "react"
import Layout from './Navbar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for demonstration
const mockCases = [
  { id: "C001", date: "2023-09-15", status: "Open", fraudRisk: "High", state: "Maharashtra" },
  { id: "C002", date: "2023-09-16", status: "Closed", fraudRisk: "Low", state: "Gujarat" },
  { id: "C003", date: "2023-09-17", status: "Under Review", fraudRisk: "Medium", state: "Karnataka" },
  { id: "C004", date: "2023-09-18", status: "Open", fraudRisk: "Low", state: "Telangana" },
  { id: "C005", date: "2023-09-19", status: "Closed", fraudRisk: "High", state: "New Delhi" },
]

export default function CaseListing() {
  const [cases, setCases] = useState(mockCases)
  const [filteredCases, setFilteredCases] = useState(mockCases)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Filters>({
    state: "",
    status: "",
    fraudRisk: "",
    startDate: null,
    endDate: null,
  })

  const casesPerPage = 10
  const totalPages = Math.ceil(filteredCases.length / casesPerPage)

  interface Filters {
    state?: string;
    status?: string;
    fraudRisk?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  }
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    filterCases(term, filters)
  }
  
  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    filterCases(searchTerm, newFilters)
  }
  
  const filterCases = (term: string, currentFilters: Filters) => {
    let result = cases.filter((case_) =>
      case_.id.toLowerCase().includes(term) ||
      
      case_.status.toLowerCase().includes(term) ||
      case_.state.toLowerCase().includes(term)
    )

    if (currentFilters.state) {
      result = result.filter(case_ => case_.state === currentFilters.state)
    }
    if (currentFilters.status) {
      result = result.filter(case_ => case_.status === currentFilters.status)
    }
    if (currentFilters.fraudRisk) {
      result = result.filter(case_ => case_.fraudRisk === currentFilters.fraudRisk)
    }
    if (currentFilters.startDate && currentFilters.endDate) {
      result = result.filter(case_ => {
        const caseDate = new Date(case_.date)
        const { startDate, endDate } = currentFilters
        return startDate && endDate && caseDate >= startDate && caseDate <= endDate
      })
    }

    setFilteredCases(result)
    setCurrentPage(1)
  }

  const handleViewDetails = (caseId: string | number) => {
    console.log(`View details for case ${caseId}`)
    // Implement navigation to case details page
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Case Listings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Search and Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={handleSearch}
                className="max-w-sm"
              />
              <Select onValueChange={(value) => handleFilterChange("state", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All States</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Gujarat">Gujarat</SelectItem>
                  <SelectItem value="New Delhi">New Delhi</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Telangana">Telangana</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Case Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange("fraudRisk", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Fraud Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? (
                      filters.endDate ? (
                        <>
                          {format(filters.startDate, "LLL dd, y")} -{" "}
                          {format(filters.endDate, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.startDate, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={{
                      from: filters.startDate || undefined,
                      to: filters.endDate || undefined,
                    }}
                    onSelect={(range) => {
                      const { from, to } = range || {}
                      handleFilterChange("startDate", from || null)
                      handleFilterChange("endDate", to || null)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Case List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fraud Risk</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.slice((currentPage - 1) * casesPerPage, currentPage * casesPerPage).map((case_) => (
                  <TableRow key={case_.id}>
                    <TableCell>{case_.id}</TableCell>
                    <TableCell>{case_.date}</TableCell>
                    <TableCell>{case_.status}</TableCell>
                    <TableCell>{case_.fraudRisk}</TableCell>
                    <TableCell>{case_.state}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleViewDetails(case_.id)}>View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  )
}