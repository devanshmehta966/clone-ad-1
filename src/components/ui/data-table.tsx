"use client"

import { useState, useMemo } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Skeleton } from './skeleton'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationInfo {
    page: number
    limit: number
    total: number
    pages: number
}

export interface DataTableProps<T> {
    data: T[]
    pagination: PaginationInfo
    loading?: boolean
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
    onSearch?: (search: string) => void
    searchPlaceholder?: string
    columns: Array<{
        key: keyof T | string
        label: string
        render?: (item: T, value: any) => React.ReactNode
        sortable?: boolean
        className?: string
    }>
    emptyMessage?: string
    className?: string
}

export function DataTable<T extends Record<string, any>>({
    data,
    pagination,
    loading = false,
    onPageChange,
    onLimitChange,
    onSearch,
    searchPlaceholder = "Search...",
    columns,
    emptyMessage = "No data available",
    className
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('')

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        onSearch?.(value)
    }

    const renderCell = (item: T, column: typeof columns[0]): React.ReactNode => {
        const keyStr = String(column.key)
        const value = keyStr.includes('.')
            ? keyStr.split('.').reduce((obj, key) => obj?.[key], item)
            : item[column.key]

        return column.render ? column.render(item, value) : String(value || '')
    }

    const pageNumbers = useMemo(() => {
        const { page, pages } = pagination
        const delta = 2
        const range = []
        const rangeWithDots = []

        for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
            range.push(i)
        }

        if (page - delta > 2) {
            rangeWithDots.push(1, '...')
        } else {
            rangeWithDots.push(1)
        }

        rangeWithDots.push(...range)

        if (page + delta < pages - 1) {
            rangeWithDots.push('...', pages)
        } else if (pages > 1) {
            rangeWithDots.push(pages)
        }

        return rangeWithDots
    }, [pagination])

    return (
        <div className={cn("space-y-4", className)}>
            {/* Search and Controls */}
            <div className="flex items-center justify-between gap-4">
                {onSearch && (
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select
                        value={pagination.limit.toString()}
                        onValueChange={(value) => onLimitChange(parseInt(value))}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className={cn(
                                            "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                                            column.className
                                        )}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: pagination.limit }).map((_, index) => (
                                    <tr key={index} className="border-b">
                                        {columns.map((_, colIndex) => (
                                            <td key={colIndex} className="p-4">
                                                <Skeleton className="h-4 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                // Empty state
                                <tr>
                                    <td colSpan={columns.length} className="h-24 text-center">
                                        <div className="text-muted-foreground">{emptyMessage}</div>
                                    </td>
                                </tr>
                            ) : (
                                // Data rows
                                data.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-muted/50">
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={cn("p-4 align-middle", column.className)}
                                            >
                                                {renderCell(item, column)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={pagination.page === 1 || loading}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {pageNumbers.map((pageNum, index) => (
                        <Button
                            key={index}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                            disabled={typeof pageNum !== 'number' || loading}
                            className="min-w-[2.5rem]"
                        >
                            {pageNum}
                        </Button>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages || loading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pagination.pages)}
                        disabled={pagination.page === pagination.pages || loading}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}