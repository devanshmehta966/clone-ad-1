'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CreateReportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreateReport: (data: any) => void
}

export function CreateReportDialog({ open, onOpenChange, onCreateReport }: CreateReportDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        reportType: 'WEEKLY' as 'WEEKLY' | 'MONTHLY' | 'CUSTOM',
        startDate: '',
        endDate: '',
    })

    const getDefaultDateRange = (type: string) => {
        const now = new Date()
        const startDate = new Date()

        switch (type) {
            case 'WEEKLY':
                startDate.setDate(now.getDate() - 7)
                break
            case 'MONTHLY':
                startDate.setMonth(now.getMonth() - 1)
                break
            default:
                startDate.setDate(now.getDate() - 7)
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: now.toISOString().split('T')[0]
        }
    }

    const handleReportTypeChange = (type: 'WEEKLY' | 'MONTHLY' | 'CUSTOM') => {
        const { startDate, endDate } = getDefaultDateRange(type)
        setFormData(prev => ({
            ...prev,
            reportType: type,
            startDate,
            endDate
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.startDate || !formData.endDate) {
            return
        }

        setIsSubmitting(true)
        try {
            const submitData = {
                title: formData.title,
                reportType: formData.reportType,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                includeCharts: true,
            }
            await onCreateReport(submitData)
            setFormData({
                title: '',
                reportType: 'WEEKLY',
                startDate: '',
                endDate: '',
            })
            onOpenChange(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Initialize dates when dialog opens
    React.useEffect(() => {
        if (open && !formData.startDate) {
            const { startDate, endDate } = getDefaultDateRange(formData.reportType)
            setFormData(prev => ({
                ...prev,
                startDate,
                endDate
            }))
        }
    }, [open, formData.reportType, formData.startDate])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Report</DialogTitle>
                    <DialogDescription>
                        Generate a comprehensive marketing performance report.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Report Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter report title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reportType">Report Type</Label>
                        <Select
                            value={formData.reportType}
                            onValueChange={handleReportTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                <SelectItem value="CUSTOM">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !formData.title || !formData.startDate || !formData.endDate}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Report'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}