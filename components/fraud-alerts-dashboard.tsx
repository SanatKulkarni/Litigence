'use client'

import React, { useState } from "react"
import Layout from './Navbar'
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

export default function FraudAlertsDashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterScore, setFilterScore] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [filterState, setFilterState] = useState("all") // Updated initial state
  const itemsPerPage = 10

  // Apply filters
  const filteredAlerts = mockAlerts.filter(alert => 
    (filterScore === "" || alert.fraudScore >= parseInt(filterScore)) &&
    (filterDate === "" || alert.date >= filterDate) &&
    (filterState === "all" || alert.state === filterState) // Updated filter logic
  )

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleStatusChange = (alertId: string, newStatus: string) => {
    // In a real application, you would update the status in your backend here
    console.log(`Updating status of alert ${alertId} to ${newStatus}`)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Fraud Alerts Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
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
                    <SelectItem value="all">All States</SelectItem> {/* Updated SelectItem value */}
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="New Delhi">New Delhi</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Telangana">Telangana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex items-end">
                <Button className="w-full" onClick={() => setCurrentPage(1)}>
                  <Filter className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fraud Alerts</CardTitle>
          </CardHeader>
          <CardContent>
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
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change Status" />
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
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  )
}