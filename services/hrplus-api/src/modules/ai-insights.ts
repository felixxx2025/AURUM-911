import { FastifyInstance } from 'fastify'
import { prisma } from '../plugins/prisma'
import { openai } from '../integrations/openai'

interface PredictiveInsight {
  type: 'turnover' | 'performance' | 'hiring' | 'salary'
  confidence: number
  prediction: any
  factors: string[]
  recommendations: string[]
}

export class AIInsightsModule {
  constructor(private fastify: FastifyInstance) {}

  async predictTurnover(tenantId: string): Promise<PredictiveInsight> {
    const employees = await prisma.employee.findMany({
      where: { tenantId },
      include: {
        auditLogs: {
          where: { action: { in: ['login', 'performance_review', 'salary_change'] } },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    })

    // Analyze patterns
    const riskFactors = []
    const predictions = []

    for (const employee of employees) {
      const lastLogin = employee.auditLogs.find(log => log.action === 'login')
      const daysSinceLogin = lastLogin ? 
        Math.floor((Date.now() - lastLogin.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 999

      const performanceReviews = employee.auditLogs.filter(log => log.action === 'performance_review')
      const avgPerformance = performanceReviews.length > 0 ? 
        performanceReviews.reduce((sum, review) => sum + (review.metadata?.score || 3), 0) / performanceReviews.length : 3

      let riskScore = 0
      if (daysSinceLogin > 30) riskScore += 0.3
      if (avgPerformance < 2.5) riskScore += 0.4
      if (employee.createdAt < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) riskScore += 0.2

      if (riskScore > 0.5) {
        predictions.push({
          employeeId: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          riskScore,
          factors: [
            ...(daysSinceLogin > 30 ? ['Baixa atividade recente'] : []),
            ...(avgPerformance < 2.5 ? ['Performance abaixo da média'] : []),
          ],
        })
      }
    }

    return {
      type: 'turnover',
      confidence: 0.75,
      prediction: {
        highRiskEmployees: predictions.length,
        totalEmployees: employees.length,
        riskPercentage: (predictions.length / employees.length) * 100,
        employees: predictions,
      },
      factors: ['Baixa atividade', 'Performance', 'Tempo de empresa'],
      recommendations: [
        'Realizar check-ins regulares com funcionários de alto risco',
        'Implementar programa de reconhecimento',
        'Revisar políticas de desenvolvimento profissional',
      ],
    }
  }

  async analyzePerformanceTrends(tenantId: string): Promise<PredictiveInsight> {
    const performanceData = await prisma.auditLog.findMany({
      where: {
        tenantId,
        action: 'performance_review',
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    })

    const monthlyPerformance = new Map<string, number[]>()
    
    performanceData.forEach(log => {
      const month = log.createdAt.toISOString().substring(0, 7)
      const score = log.metadata?.score || 3
      
      if (!monthlyPerformance.has(month)) {
        monthlyPerformance.set(month, [])
      }
      monthlyPerformance.get(month)!.push(score)
    })

    const trends = Array.from(monthlyPerformance.entries()).map(([month, scores]) => ({
      month,
      avgScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      count: scores.length,
    }))

    const recentTrend = trends.slice(-3).reduce((sum, t) => sum + t.avgScore, 0) / 3
    const previousTrend = trends.slice(-6, -3).reduce((sum, t) => sum + t.avgScore, 0) / 3
    const trendDirection = recentTrend > previousTrend ? 'improving' : 'declining'

    return {
      type: 'performance',
      confidence: 0.8,
      prediction: {
        currentAverage: recentTrend,
        trendDirection,
        monthlyData: trends,
        projectedNext3Months: recentTrend + (recentTrend - previousTrend) * 3,
      },
      factors: ['Avaliações recentes', 'Tendência histórica', 'Sazonalidade'],
      recommendations: [
        trendDirection === 'declining' ? 'Implementar treinamentos adicionais' : 'Manter práticas atuais',
        'Aumentar frequência de feedback',
        'Revisar metas e objetivos',
      ],
    }
  }

  async generateHiringRecommendations(tenantId: string, jobDescription: string): Promise<PredictiveInsight> {
    // Use OpenAI to analyze job description and generate insights
    const prompt = `
      Analise esta descrição de vaga e forneça insights sobre:
      1. Habilidades mais importantes
      2. Perfil ideal do candidato
      3. Faixa salarial sugerida
      4. Tempo estimado para preenchimento
      
      Descrição da vaga: ${jobDescription}
    `

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const analysis = aiResponse.choices[0]?.message?.content || ''

    // Get historical hiring data
    const historicalHires = await prisma.employee.findMany({
      where: { tenantId },
      select: {
        createdAt: true,
        salary: true,
        position: true,
      },
    })

    const avgTimeToHire = 21 // days (would calculate from actual data)
    const avgSalary = historicalHires.reduce((sum, emp) => sum + (emp.salary || 0), 0) / historicalHires.length

    return {
      type: 'hiring',
      confidence: 0.7,
      prediction: {
        estimatedTimeToHire: avgTimeToHire,
        suggestedSalaryRange: {
          min: avgSalary * 0.8,
          max: avgSalary * 1.2,
        },
        aiAnalysis: analysis,
        marketDemand: 'medium', // Would integrate with job market APIs
      },
      factors: ['Histórico de contratações', 'Análise de mercado', 'IA generativa'],
      recommendations: [
        'Focar em canais de recrutamento mais eficazes',
        'Ajustar descrição da vaga baseada na análise',
        'Considerar benefícios competitivos',
      ],
    }
  }

  async predictSalaryAdjustments(tenantId: string): Promise<PredictiveInsight> {
    const employees = await prisma.employee.findMany({
      where: { tenantId },
      include: {
        auditLogs: {
          where: { action: 'salary_change' },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const recommendations = []

    for (const employee of employees) {
      const lastSalaryChange = employee.auditLogs[0]
      const monthsSinceLastChange = lastSalaryChange ? 
        Math.floor((Date.now() - lastSalaryChange.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 12

      if (monthsSinceLastChange >= 12) {
        recommendations.push({
          employeeId: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          currentSalary: employee.salary,
          suggestedIncrease: employee.salary ? employee.salary * 0.05 : 0, // 5% increase
          reason: 'Sem reajuste há mais de 12 meses',
        })
      }
    }

    return {
      type: 'salary',
      confidence: 0.85,
      prediction: {
        employeesForAdjustment: recommendations.length,
        totalBudgetImpact: recommendations.reduce((sum, rec) => sum + rec.suggestedIncrease, 0),
        recommendations,
      },
      factors: ['Tempo desde último reajuste', 'Inflação', 'Performance'],
      recommendations: [
        'Priorizar funcionários com melhor performance',
        'Considerar reajustes escalonados',
        'Revisar política de remuneração',
      ],
    }
  }
}