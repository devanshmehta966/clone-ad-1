import { NextRequest } from 'next/server'
import { BaseController } from './base.controller'
import { DashboardService } from '../services/dashboard.service'
import { MetricsQuerySchema, AlertsQuerySchema } from '../validation/dashboard.schemas'

export class DashboardController extends BaseController {
  private dashboardService = new DashboardService()

  async getMetrics(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      const query = this.validateQuery(request, MetricsQuerySchema)
      const metrics = await this.dashboardService.calculateMetrics(userId, query)
      return metrics
    })
  }

  async getAlerts(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      const query = this.validateQuery(request, AlertsQuerySchema)
      const alerts = await this.dashboardService.getActiveAlerts(userId, query)
      return alerts
    })
  }

  async getPerformanceData(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      const query = this.validateQuery(request, MetricsQuerySchema)
      const performance = await this.dashboardService.getPerformanceData(userId, query)
      return performance
    })
  }

  async getRevenueData(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      const query = this.validateQuery(request, MetricsQuerySchema)
      const revenue = await this.dashboardService.getRevenueData(userId, query)
      return revenue
    })
  }

  async getIntegrationStatus(userId: string) {
    return this.handleRequest(async () => {
      const integrations = await this.dashboardService.getIntegrationStatus(userId)
      return integrations
    })
  }

  async getClientSummary(userId: string) {
    return this.handleRequest(async () => {
      const clients = await this.dashboardService.getClientSummary(userId)
      return clients
    })
  }
}