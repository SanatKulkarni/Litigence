'use client'

import React from 'react'
import Layout from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { AlertCircle, BarChart3, FileText, Scale } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// Mock data for demonstration
const fraudCasesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Fraud Cases',
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
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

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">AI-Driven Fraud Detection Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Cases" value="50,000" icon={<FileText className="h-6 w-6" />} />
          <StatCard title="Fraud Alerts" value="1,234" icon={<AlertCircle className="h-6 w-6" />} />
          <StatCard title="Pending Cases" value="789" icon={<Scale className="h-6 w-6" />} />
          <StatCard title="Avg. Fraud Score" value="42.5" icon={<BarChart3 className="h-6 w-6" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Cases Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={fraudCasesData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fraud Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={fraudRiskData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Fraud Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, title: "Suspicious activity detected in Case #12345", date: "2023-09-25", risk: "High" },
                { id: 2, title: "Potential fraud identified in Court XYZ", date: "2023-09-24", risk: "Medium" },
                { id: 3, title: "Unusual pattern observed in recent filings", date: "2023-09-23", risk: "Low" },
              ].map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                  <div className="flex items-center space-x-4">
                    <AlertCircle className={`h-6 w-6 ${alert.risk === 'High' ? 'text-red-500' : alert.risk === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-gray-500">{alert.date}</p>
                    </div>
                  </div>
                  <Button variant="outline">View Details</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}