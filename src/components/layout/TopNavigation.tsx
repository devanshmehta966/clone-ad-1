import {
  Bell,
  Search,
  LogOut,
  Building2,
  ChevronsUpDown,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export function TopNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  // Resolve user from session
  const userName = session?.user?.name || '—'
  const userEmail = session?.user?.email || '—'

  // Mock organizations for selection (replace with real data when wired up)
  const organizations = useMemo(
    () => [
      { id: 'org_1', name: 'Organization Name 1' },
      { id: 'org_2', name: 'Organization Name 2' },
      { id: 'org_3', name: 'Organization Name 3' },
    ],
    []
  )

  const initialOrgId =
    searchParams?.get('orgId') ||
    (typeof window !== 'undefined' && localStorage.getItem('selectedOrgId')) ||
    organizations[0].id
  const [selectedOrgId, setSelectedOrgId] = useState<string>(initialOrgId)

  useEffect(() => {
    // Keep URL and localStorage in sync with selection
    if (!selectedOrgId) return
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (params.get('orgId') !== selectedOrgId) {
      params.set('orgId', selectedOrgId)
      router.push(`${pathname}?${params.toString()}`)
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedOrgId', selectedOrgId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrgId])

  const selectedOrg = useMemo(
    () => organizations.find((o) => o.id === selectedOrgId) || organizations[0],
    [organizations, selectedOrgId]
  )

  const displayName = userName
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    // Sign out via NextAuth and redirect to signin
    signOut({ callbackUrl: '/signin' })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card/50 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="p-2" />

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search campaigns, reports, clients..."
            className="bg-background/50 pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning"></div>
                <span className="font-medium">High CPA Alert</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Google Ads CPA is 40% above target
              </p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success"></div>
                <span className="font-medium">Campaign Success</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Facebook campaign reached 150% of goal
              </p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="font-medium">Weekly Report Ready</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your marketing summary is ready to view
              </p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Organization */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden max-w-[180px] truncate sm:inline-block">
                {selectedOrg.name}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {/* <DropdownMenuLabel>Select organization</DropdownMenuLabel> */}
            {/* <DropdownMenuSeparator /> */}
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{org.name}</span>
                {org.id === selectedOrgId && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/support')}>
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
