import { prisma } from '../plugins/prisma'
import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'

interface ReportConfig {
  title: string
  type: 'pdf' | 'excel' | 'csv'
  filters: Record<string, any>
  columns: string[]
  groupBy?: string
  orderBy?: string
}

export class ReportBuilder {
  async generateReport(tenantId: string, config: ReportConfig) {
    const data = await this.fetchData(tenantId, config)
    
    switch (config.type) {
      case 'pdf':
        return this.generatePDF(data, config)
      case 'excel':
        return this.generateExcel(data, config)
      case 'csv':
        return this.generateCSV(data, config)
      default:
        throw new Error('Unsupported report type')
    }
  }

  private async fetchData(tenantId: string, config: ReportConfig) {
    // Base query with tenant isolation
    let query: any = {
      where: { tenantId, ...config.filters },
      select: this.buildSelectClause(config.columns)
    }

    if (config.orderBy) {
      query.orderBy = { [config.orderBy]: 'asc' }
    }

    return await prisma.employee.findMany(query)
  }

  private buildSelectClause(columns: string[]) {
    const select: any = {}
    columns.forEach(col => {
      select[col] = true
    })
    return select
  }

  private async generatePDF(data: any[], config: ReportConfig) {
    const doc = new PDFDocument()
    const chunks: Buffer[] = []

    doc.on('data', chunk => chunks.push(chunk))
    
    // Header
    doc.fontSize(20).text(config.title, 50, 50)
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80)

    // Table
    let y = 120
    const headers = config.columns
    
    // Headers
    headers.forEach((header, i) => {
      doc.text(header, 50 + (i * 100), y)
    })
    
    y += 20
    
    // Data rows
    data.forEach(row => {
      headers.forEach((header, i) => {
        doc.text(String(row[header] || ''), 50 + (i * 100), y)
      })
      y += 15
    })

    doc.end()

    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
    })
  }

  private async generateExcel(data: any[], config: ReportConfig) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(config.title)

    // Headers
    worksheet.addRow(config.columns)
    
    // Style headers
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // Data
    data.forEach(row => {
      const values = config.columns.map(col => row[col])
      worksheet.addRow(values)
    })

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15
    })

    return await workbook.xlsx.writeBuffer()
  }

  private generateCSV(data: any[], config: ReportConfig) {
    const headers = config.columns.join(',')
    const rows = data.map(row => 
      config.columns.map(col => `"${row[col] || ''}"`).join(',')
    )
    
    return Buffer.from([headers, ...rows].join('\n'))
  }

  async scheduleReport(tenantId: string, config: ReportConfig, schedule: string) {
    // Store scheduled report configuration
    await prisma.scheduledReport.create({
      data: {
        tenantId,
        title: config.title,
        config: config as any,
        schedule,
        active: true
      }
    })
  }
}