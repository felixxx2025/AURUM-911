// @ts-nocheck
'use client'

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface ExportButtonProps {
  data: any[]
  filename?: string
  formats?: ('csv' | 'excel' | 'pdf')[]
  onExport?: (format: string) => void
}

export function ExportButton({
  data,
  filename = 'export',
  formats = ['csv', 'excel'],
  onExport,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatLabels = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF',
  }

  const handleExport = (format: string) => {
    setIsOpen(false)
    
    if (onExport) {
      onExport(format)
      return
    }

    // Default export implementation
    if (format === 'csv') {
      exportToCSV(data, filename)
    } else if (format === 'excel') {
      // Placeholder for Excel export
      console.log('Excel export would be implemented here')
    } else if (format === 'pdf') {
      // Placeholder for PDF export
      console.log('PDF export would be implemented here')
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || '')).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
        Exportar
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {formats.map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exportar como {formatLabels[format]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
