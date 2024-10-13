'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileIcon } from "lucide-react"
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';
import Image from 'next/image'

// Replace with your actual Gemini API key
const API_KEY = 'AIzaSyD7rysGof45XoGHYw6jxVmhjTOFJanuGnU';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

export function CourtOrderUploadComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'success' | null>(null)
  const [fraudScore, setFraudScore] = useState<number | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Dynamically set the workerSrc for pdfjs
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([`importScripts('${pdfjsWorker}')`], { type: 'application/javascript' }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>)
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
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data && data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        const fraudScoreText = candidate.content.parts[0].text;
        
        // Extract the numeric fraud score from the model response
        const scoreMatch = fraudScoreText.match(/\d+/);
        const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0;

        // Extract the explanation from the response
        const explanation = fraudScoreText.split('\n').slice(1).join('\n').trim();

        return { score, aiResponse: explanation };
      } else {
        throw new Error('Failed to retrieve fraudulent score.');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setUploadStatus(null)
    setFraudScore(null)
    setAiResponse(null)

    try {
      // Extract text from PDF
      const pdfText = await extractTextFromPDF(file)
      console.log('Extracted text:', pdfText)

      // Send text to Gemini API
      const { score, aiResponse } = await sendToGeminiFlash(pdfText)
      setFraudScore(score)
      setAiResponse(aiResponse)
      
      setUploadStatus('success')
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
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
                  <a href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="/caselisting" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Case Listings
                  </a>
                  <a href="/fraudalert" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Fraud Alert
                  </a>
                  <a href="/uploadorder" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Upload Order
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <br />
        <br />
        <br />

        <h1 className="ml-2 text-2xl font-bold text-gray-900">Upload Court Order</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors bg-white"
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
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Selected File:</h2>
              <Alert>
                <FileIcon className="mr-2 h-4 w-4" />
                <AlertDescription>{file.name}</AlertDescription>
              </Alert>
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Uploading...
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
              <h2 className="text-xl font-semibold">Analysis for Fraud Score:</h2>
              <Alert>
                <AlertDescription>{aiResponse}</AlertDescription>
              </Alert>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
