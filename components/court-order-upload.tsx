'use client'

import React, { useState, useRef, useEffect } from 'react'
import Layout from './Navbar'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileIcon } from "lucide-react"
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_KEY = 'AIzaSyD7rysGof45XoGHYw6jxVmhjTOFJanuGnU'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`

export default function CourtOrderUploadComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fraudScore, setFraudScore] = useState<number | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([`importScripts('${pdfjsWorker}')`], { type: 'application/javascript' }))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + ' '
    }

    return fullText.trim()
  }

  const sendToGeminiFlash = async (pdfText: string): Promise<{ score: number, aiResponse: string }> => {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Analyze the following litigation text from the insurance sector and determine if the content exhibits fraudulent patterns related to insurance claims. Provide a fraud score between 0 and 100, where 0 means no fraud and 100 means highly fraudulent. Also, highlight key patterns or reasons for assigning the fraud score:\n\n"${pdfText}"`
            }
          ]
        }
      ]
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data && data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0]
        const fraudScoreText = candidate.content.parts[0].text
        
        const scoreMatch = fraudScoreText.match(/\d+/)
        const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0

        const explanation = fraudScoreText.split('\n').slice(1).join('\n').trim()

        return { score, aiResponse: explanation }
      } else {
        throw new Error('Failed to retrieve fraudulent score.')
      }
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setFraudScore(null)
    setAiResponse(null)

    try {
      const pdfText = await extractTextFromPDF(file)
      console.log('Extracted text:', pdfText)

      const { score, aiResponse } = await sendToGeminiFlash(pdfText)
      setFraudScore(score)
      setAiResponse(aiResponse)
    } catch (error) {
      console.error('Processing failed:', error)
      setAiResponse('Failed to analyze the document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getFraudScoreColor = (score: number): string => {
    if (score < 30) return 'text-green-600'
    if (score < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Court Order</h1>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  id="court-order"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label htmlFor="court-order" className="cursor-pointer text-lg">
                  {file ? file.name : 'Click or drag to upload Court Order (PDF)'}
                </Label>
              </div>
              {file && (
                <Alert>
                  <FileIcon className="mr-2 h-4 w-4" />
                  <AlertDescription>{file.name}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={uploading || !file}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" /> Analyzing...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>

              {fraudScore !== null && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold">Fraud Score:</h2>
                  <p className={`text-3xl font-bold ${getFraudScoreColor(fraudScore)}`}>{fraudScore}</p>
                </div>
              )}

              {aiResponse && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold">AI Analysis:</h2>
                  <Alert>
                    <AlertDescription>{aiResponse}</AlertDescription>
                  </Alert>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}