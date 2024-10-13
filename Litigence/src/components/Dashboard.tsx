"use client"

import { useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, BarChart3, FileText, Scale } from "lucide-react"
import Image from 'next/image'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export function DashboardComponent() {
  const [selectedState, setSelectedState] = useState('All')
  const [selectedCourtType, setSelectedCourtType] = useState('All')
  const [selectedFraudRisk, setSelectedFraudRisk] = useState('All')

  // Mock data
  const casesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Cases',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  const fraudRiskData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
                <a href="/dashboard" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/caselisting" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Case Listings
                </a>
                <a href="/fraudalert" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between mb-6">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[180px]">
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
            <Select value={selectedCourtType} onValueChange={setSelectedCourtType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Court Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Courts</SelectItem>
                <SelectItem value="Federal">Supreme Court</SelectItem>
                <SelectItem value="State">High Court</SelectItem>
                <SelectItem value="Local">District Court</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFraudRisk} onValueChange={setSelectedFraudRisk}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Fraud Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Risks</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fraud Detected</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Cases</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">789</div>
                <p className="text-xs text-muted-foreground">+7% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disposed Cases</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">400</div>
                <p className="text-xs text-muted-foreground">+4.75% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cases Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={casesData} options={{ responsive: true, maintainAspectRatio: false }} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fraud Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Pie data={fraudRiskData} options={{ responsive: true, maintainAspectRatio: false }} />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Fraud Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  { id: 1, title: "Suspicious activity detected in Case #12345", date: "2023-09-25" },
                  { id: 2, title: "Potential fraud identified in Court XYZ", date: "2023-09-24" },
                  { id: 3, title: "Unusual pattern observed in recent filings", date: "2023-09-23" },
                ].map((alert) => (
                  <li key={alert.id} className="flex items-center space-x-4">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-gray-500">{alert.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}