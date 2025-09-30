import { NextRequest } from 'next/server'
import { BaseController } from './base.controller'
import { ReportsService } from '../services/reports.service'
import { CreateReportSchema, ReportsQuerySchema, CreateReportData } from '../validation/reports.schemas'

export class ReportsController extends BaseController {
  private reportsService = new ReportsService()

  async getReports(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      const query = this.validateQuery(request, ReportsQuerySchema)
      const reports = await this.reportsService.getUserReports(userId, query)
      return reports
    })
  }

  async getReport(reportId: string, userId: string) {
    return this.handleRequest(async () => {
      const report = await this.reportsService.getReportById(reportId, userId)
      return report
    })
  }

  async createReport(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      const data = await this.validateBody(request, CreateReportSchema) as CreateReportData
      const report = await this.reportsService.createReport(userId, data)
      return report
    })
  }

  async generateReport(reportId: string, userId: string) {
    return this.handleRequest(async () => {
      const report = await this.reportsService.generateReport(reportId, userId)
      return report
    })
  }

  async deleteReport(reportId: string, userId: string) {
    return this.handleRequest(async () => {
      await this.reportsService.deleteReport(reportId, userId)
      return { message: 'Report deleted successfully' }
    })
  }
}