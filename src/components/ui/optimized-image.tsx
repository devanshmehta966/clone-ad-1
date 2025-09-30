"use client"

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    fallbackSrc?: string
    showSkeleton?: boolean
    skeletonClassName?: string
}

export function OptimizedImage({
    src,
    alt,
    className,
    fallbackSrc = '/placeholder.svg',
    showSkeleton = true,
    skeletonClassName,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [currentSrc, setCurrentSrc] = useState(src)

    const handleLoad = () => {
        setIsLoading(false)
        setHasError(false)
    }

    const handleError = () => {
        setIsLoading(false)
        setHasError(true)
        if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc)
        }
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {isLoading && showSkeleton && (
                <Skeleton
                    className={cn(
                        "absolute inset-0 z-10",
                        skeletonClassName
                    )}
                />
            )}
            <Image
                {...props}
                src={currentSrc}
                alt={alt}
                className={cn(
                    "transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100",
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
                // Performance optimizations
                priority={props.priority}
                quality={props.quality || 85}
                placeholder={props.placeholder || 'blur'}
                blurDataURL={props.blurDataURL || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='}
            />
        </div>
    )
}

// Preload critical images
export function preloadImage(src: string, priority: boolean = false) {
    if (typeof window !== 'undefined') {
        const link = document.createElement('link')
        link.rel = priority ? 'preload' : 'prefetch'
        link.as = 'image'
        link.href = src
        document.head.appendChild(link)
    }
}

// Image optimization utilities
export const imageOptimization = {
    // Generate responsive image sizes
    generateSizes: (breakpoints: Record<string, number>) => {
        return Object.entries(breakpoints)
            .map(([breakpoint, width]) => `(max-width: ${breakpoint}px) ${width}px`)
            .join(', ')
    },

    // Generate blur data URL for placeholder
    generateBlurDataURL: (width: number = 8, height: number = 8) => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.fillStyle = '#f3f4f6'
            ctx.fillRect(0, 0, width, height)
        }
        return canvas.toDataURL()
    }
}