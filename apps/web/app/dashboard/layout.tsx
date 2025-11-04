'use client'

import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}