"use client"

import { useState } from "react"
import { Bell, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Image from 'next/image'

// Mock data for fraud alerts
const mockAlerts = Array.from({ length: 100 }, (_, i) => ({
  id: `CASE-${1000 + i}`,
  date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
  fraudScore: Math.floor(Math.random() * 100),
  state: ['Telangana', 'Karnataka', 'Maharashtra', 'New Delhi', 'Gujarat'][Math.floor(Math.random() * 4)],
  status: ['Unresolved', 'Investigated', 'Resolved'][Math.floor(Math.random() * 3)]
}))

// Mock data for charts
const chartData = [
  { name: 'Jan', fraudCases: 65 },
  { name: 'Feb', fraudCases: 59 },
  { name: 'Mar', fraudCases: 80 },
  { name: 'Apr', fraudCases: 81 },
  { name: 'May', fraudCases: 56 },
  { name: 'Jun', fraudCases: 55 },
]

export function FraudAlertsDashboardComponent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterScore, setFilterScore] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [filterState, setFilterState] = useState("")
  const itemsPerPage = 10

  // Apply filters
  const filteredAlerts = mockAlerts.filter(alert => 
    (filterScore === "" || alert.fraudScore >= parseInt(filterScore)) &&
    (filterDate === "" || alert.date >= filterDate) &&
    (filterState === "" || alert.state === filterState)
  )

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleStatusChange = (alertId: string, newStatus: string) => {
    // In a real application, you would update the status in your backend here
    console.log(`Updating status of alert ${alertId} to ${newStatus}`)
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
      <nav className="bg-white shadow-sm flex justify-between">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
              <Image
        src="./logo.svg"
        alt="Company Logo"
        width={80}
        height={80}
        priority
      />
                <span className="ml-2 text-2xl font-bold text-gray-900">Litigence</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <a href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-mediumm">
                  Dashboard
                </a>
                <a href="/caselisting" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Case Listings
                </a>
                <a href="/fraudalert" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Fraud Reports
                </a>
                <a href="/uploadorder" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Upload Order
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>New high-risk alert: CASE-1095</DropdownMenuItem>
            <DropdownMenuItem>5 cases require investigation</DropdownMenuItem>
            <DropdownMenuItem>Monthly fraud report available</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAlerts.filter(a => a.fraudScore >= 80).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAlerts.filter(a => a.status === 'Resolved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Fraud Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockAlerts.reduce((sum, alert) => sum + alert.fraudScore, 0) / mockAlerts.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fraud Cases Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="fraudCases" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="filterScore">Minimum Fraud Score</Label>
          <Input
            id="filterScore"
            type="number"
            placeholder="Minimum Score"
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="filterDate">From Date</Label>
          <Input
            id="filterDate"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="filterState">State</Label>
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger id="filterState">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All">All States</SelectItem>
                <SelectItem value="CA">Maharashtra</SelectItem>
                <SelectItem value="NY">Gujarat</SelectItem>
                <SelectItem value="TX">New Delhi</SelectItem>
                <SelectItem value="TX">Karnataka</SelectItem>
                <SelectItem value="TX">Telangana</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 flex items-end">
          <Button className="w-full" onClick={() => setCurrentPage(1)}>
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fraud Score</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{alert.id}</TableCell>
                <TableCell>{alert.date}</TableCell>
                <TableCell>
                <Badge variant={alert.fraudScore >= 80 ? "destructive" : alert.fraudScore >= 50 ? "secondary" : "default"}>
  {alert.fraudScore}
</Badge>

                </TableCell>
                <TableCell>{alert.state}</TableCell>
                <TableCell>{alert.status}</TableCell>
                <TableCell>
                  <Select
                    value={alert.status}
                    onValueChange={(value) => handleStatusChange(alert.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unresolved">Unresolved</SelectItem>
                      <SelectItem value="Investigated">Investigated</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex-1 text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}