"use client";

interface IntegrationLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    headerActions?: React.ReactNode;
}

export function IntegrationLayout({ children, title, description, headerActions }: IntegrationLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
                <div className="flex items-center justify-between p-6">
                    <div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                        {description && (
                            <p className="text-muted-foreground text-sm">{description}</p>
                        )}
                    </div>
                    {headerActions && (
                        <div className="flex items-center gap-3">
                            {headerActions}
                        </div>
                    )}
                </div>
            </header>

            <main className="p-6">
                {children}
            </main>
        </div>
    );
}