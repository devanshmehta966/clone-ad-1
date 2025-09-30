import React from 'react'
import { render, screen } from '@testing-library/react'
import { MetricCard } from '@/components/dashboard/MetricCard'

describe('MetricCard', () => {
    const defaultProps = {
        title: 'Total Revenue',
        value: '$12,345',
        change: '+12.5%',
        changeType: 'positive' as const,
        icon: 'DollarSign',
    }

    it('renders metric card with all props', () => {
        render(<MetricCard {...defaultProps} />)

        expect(screen.getByText('Total Revenue')).toBeInTheDocument()
        expect(screen.getByText('$12,345')).toBeInTheDocument()
        expect(screen.getByText('+12.5%')).toBeInTheDocument()
    })

    it('displays positive change with correct styling', () => {
        render(<MetricCard {...defaultProps} changeType="positive" />)

        const changeElement = screen.getByText('+12.5%')
        expect(changeElement).toHaveClass('text-green-600')
    })

    it('displays negative change with correct styling', () => {
        render(
            <MetricCard
                {...defaultProps}
                change="-5.2%"
                changeType="negative"
            />
        )

        const changeElement = screen.getByText('-5.2%')
        expect(changeElement).toHaveClass('text-red-600')
    })

    it('displays neutral change with correct styling', () => {
        render(
            <MetricCard
                {...defaultProps}
                change="0%"
                changeType="neutral"
            />
        )

        const changeElement = screen.getByText('0%')
        expect(changeElement).toHaveClass('text-gray-600')
    })

    it('renders without change when not provided', () => {
        const propsWithoutChange = {
            title: 'Total Users',
            value: '1,234',
            icon: 'Users',
        }

        render(<MetricCard {...propsWithoutChange} />)

        expect(screen.getByText('Total Users')).toBeInTheDocument()
        expect(screen.getByText('1,234')).toBeInTheDocument()
        expect(screen.queryByText('%')).not.toBeInTheDocument()
    })

    it('renders with loading state', () => {
        render(<MetricCard {...defaultProps} loading={true} />)

        expect(screen.getByTestId('metric-card-loading')).toBeInTheDocument()
        expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })

    it('renders with error state', () => {
        render(<MetricCard {...defaultProps} error="Failed to load data" />)

        expect(screen.getByTestId('metric-card-error')).toBeInTheDocument()
        expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    it('handles large numbers with proper formatting', () => {
        render(
            <MetricCard
                {...defaultProps}
                value="$1,234,567.89"
            />
        )

        expect(screen.getByText('$1,234,567.89')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
        const { container } = render(
            <MetricCard
                {...defaultProps}
                className="custom-class"
            />
        )

        expect(container.firstChild).toHaveClass('custom-class')
    })

    it('has proper accessibility attributes', () => {
        render(<MetricCard {...defaultProps} />)

        const card = screen.getByRole('article')
        expect(card).toHaveAttribute('aria-label', 'Total Revenue metric')
    })

    it('renders different icons correctly', () => {
        const { rerender } = render(<MetricCard {...defaultProps} icon="Users" />)
        expect(screen.getByTestId('metric-icon-users')).toBeInTheDocument()

        rerender(<MetricCard {...defaultProps} icon="TrendingUp" />)
        expect(screen.getByTestId('metric-icon-trending-up')).toBeInTheDocument()

        rerender(<MetricCard {...defaultProps} icon="Activity" />)
        expect(screen.getByTestId('metric-icon-activity')).toBeInTheDocument()
    })

    it('handles click events when clickable', () => {
        const handleClick = jest.fn()

        render(
            <MetricCard
                {...defaultProps}
                onClick={handleClick}
                clickable={true}
            />
        )

        const card = screen.getByRole('button')
        card.click()

        expect(handleClick).toHaveBeenCalledTimes(1)
        expect(card).toHaveClass('cursor-pointer')
    })

    it('displays tooltip when provided', async () => {
        render(
            <MetricCard
                {...defaultProps}
                tooltip="This shows the total revenue for the selected period"
            />
        )

        const tooltipTrigger = screen.getByTestId('metric-tooltip-trigger')
        expect(tooltipTrigger).toBeInTheDocument()
    })

    it('renders with subtitle when provided', () => {
        render(
            <MetricCard
                {...defaultProps}
                subtitle="vs last month"
            />
        )

        expect(screen.getByText('vs last month')).toBeInTheDocument()
    })
})