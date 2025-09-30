import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Download,
  RefreshCw,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Report {
  id: string
  title: string
  reportType: 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
  startDate: string
  endDate: string
  data: any
  emailSentAt: string | null
  createdAt: string
}

interface ReportCardProps {
  report: Report
  onDownload: (reportId: string, title: string) => void
  onRegenerate: (reportId: string) => void
  onDelete: (reportId: string) => void
}

export function ReportCard({
  report,
  onDownload,
  onRegenerate,
  onDelete,
}: ReportCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getReportTypeVariant = (type: string) => {
    switch (type) {
      case 'WEEKLY':
        return 'default'
      case 'MONTHLY':
        return 'secondary'
      case 'CUSTOM':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  // const getStatusBadge = () => {
  //     const isReady = report.data && Object.keys(report.data).length > 0
  //     return (
  //         <Badge
  //             variant={isReady ? "default" : "secondary"}
  //             className={isReady ? "bg-success text-success-foreground" : ""}
  //         >
  //             {isReady ? "ready" : "pending"}
  //         </Badge>
  //     )
  // }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      await onRegenerate(report.id)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDelete = () => {
    onDelete(report.id)
    setDeleteDialogOpen(false)
  }

  const isReady = report.data && Object.keys(report.data).length > 0

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <h3 className="font-semibold">{report.title}</h3>
          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(report.startDate)} - {formatDate(report.endDate)}
            </span>
            <Badge variant={getReportTypeVariant(report.reportType)}>
              {report.reportType.toLowerCase()}
            </Badge>
            <span className="text-xs">
              Created {formatDate(report.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* {getStatusBadge()} */}
          {isReady && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload(report.id, report.title)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`}
                />
                Regenerate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{report.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
