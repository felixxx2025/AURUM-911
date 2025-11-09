// @ts-nocheck
/**
 * HR API Services
 * 
 * This file contains all API service functions for HR modules.
 * Each function corresponds to a specific API endpoint.
 */

import { apiClient } from './client'

// Types
export interface Training {
  id: string
  title: string
  category: string
  instructor: string
  duration: number
  enrolledCount: number
  capacity: number
  status: string
  startDate: string
  completionRate?: number
}

export interface PerformanceReview {
  id: string
  employeeName: string
  department: string
  position: string
  reviewPeriod: string
  reviewDate: string
  overallScore: number
  status: string
  reviewer: string
}

export interface Vacation {
  id: string
  employeeName: string
  department: string
  startDate: string
  endDate: string
  days: number
  status: string
  requestDate: string
  approver?: string
  type: string
}

// Training Services
export const trainingService = {
  // Get all trainings
  getAll: (params?: { status?: string; category?: string }) =>
    apiClient.get<Training[]>('/hr/trainings', { params }),

  // Get single training
  getById: (id: string) =>
    apiClient.get<Training>(`/hr/trainings/${id}`),

  // Create training
  create: (data: Omit<Training, 'id'>) =>
    apiClient.post<Training>('/hr/trainings', data),

  // Update training
  update: (id: string, data: Partial<Training>) =>
    apiClient.put<Training>(`/hr/trainings/${id}`, data),

  // Delete training
  delete: (id: string) =>
    apiClient.delete(`/hr/trainings/${id}`),
}

// Performance Review Services
export const performanceService = {
  // Get all reviews
  getAll: (params?: { status?: string; department?: string }) =>
    apiClient.get<PerformanceReview[]>('/hr/performance', { params }),

  // Get single review
  getById: (id: string) =>
    apiClient.get<PerformanceReview>(`/hr/performance/${id}`),

  // Create review
  create: (data: Omit<PerformanceReview, 'id'>) =>
    apiClient.post<PerformanceReview>('/hr/performance', data),

  // Update review
  update: (id: string, data: Partial<PerformanceReview>) =>
    apiClient.put<PerformanceReview>(`/hr/performance/${id}`, data),

  // Delete review
  delete: (id: string) =>
    apiClient.delete(`/hr/performance/${id}`),
}

// Vacation Services
export const vacationService = {
  // Get all vacations
  getAll: (params?: { status?: string; type?: string }) =>
    apiClient.get<Vacation[]>('/hr/vacations', { params }),

  // Get single vacation
  getById: (id: string) =>
    apiClient.get<Vacation>(`/hr/vacations/${id}`),

  // Create vacation request
  create: (data: Omit<Vacation, 'id'>) =>
    apiClient.post<Vacation>('/hr/vacations', data),

  // Update vacation
  update: (id: string, data: Partial<Vacation>) =>
    apiClient.put<Vacation>(`/hr/vacations/${id}`, data),

  // Approve vacation
  approve: (id: string) =>
    apiClient.post(`/hr/vacations/${id}/approve`),

  // Reject vacation
  reject: (id: string, reason: string) =>
    apiClient.post(`/hr/vacations/${id}/reject`, { reason }),

  // Delete vacation
  delete: (id: string) =>
    apiClient.delete(`/hr/vacations/${id}`),
}

// Payroll Services
export const payrollService = {
  getAll: (params?: { period?: string; status?: string }) =>
    apiClient.get('/hr/payroll', { params }),

  getById: (id: string) =>
    apiClient.get(`/hr/payroll/${id}`),

  process: (data: any) =>
    apiClient.post('/hr/payroll/process', data),
}

// Time Tracking Services
export const timeTrackingService = {
  getAll: (params?: { date?: string; status?: string }) =>
    apiClient.get('/hr/time', { params }),

  getById: (id: string) =>
    apiClient.get(`/hr/time/${id}`),

  create: (data: any) =>
    apiClient.post('/hr/time', data),

  update: (id: string, data: any) =>
    apiClient.put(`/hr/time/${id}`, data),
}

// Recruitment Services
export const recruitmentService = {
  getAll: (params?: { status?: string; department?: string }) =>
    apiClient.get('/hr/recruitment', { params }),

  getById: (id: string) =>
    apiClient.get(`/hr/recruitment/${id}`),

  create: (data: any) =>
    apiClient.post('/hr/recruitment', data),

  update: (id: string, data: any) =>
    apiClient.put(`/hr/recruitment/${id}`, data),
}

// Benefits Services
export const benefitsService = {
  getAll: (params?: { status?: string }) =>
    apiClient.get('/hr/benefits', { params }),

  getById: (id: string) =>
    apiClient.get(`/hr/benefits/${id}`),

  create: (data: any) =>
    apiClient.post('/hr/benefits', data),

  update: (id: string, data: any) =>
    apiClient.put(`/hr/benefits/${id}`, data),
}

// Reports Services
export const reportsService = {
  getAll: (params?: { category?: string }) =>
    apiClient.get('/hr/reports', { params }),

  generate: (reportType: string, params?: any) =>
    apiClient.post(`/hr/reports/generate/${reportType}`, params),

  schedule: (reportType: string, schedule: any) =>
    apiClient.post(`/hr/reports/schedule/${reportType}`, schedule),
}
