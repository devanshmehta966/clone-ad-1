'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  FileText,
  Settings,
  TrendingUp,
  Search,
  Facebook,
  Linkedin,
  BarChart3,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Reports', url: '/reports', icon: FileText },
  { title: 'Settings', url: '/settings', icon: Settings },
]

const platformItems = [
  { title: 'Google Ads', url: '/google-ads', icon: Search },
  { title: 'Meta Ads', url: '/meta-ads', icon: Facebook },
  // { title: 'LinkedIn Ads', url: '/linkedin-ads', icon: Linkedin },
  { title: 'Google Analytics', url: '/google-analytics', icon: BarChart3 },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const isCollapsed = state === 'collapsed'

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  useEffect(() => {
    // Warm up the most common routes to reduce first navigation latency
    const urlsToPrefetch = Array.from(
      new Set([
        ...menuItems.map((m) => m.url),
        ...platformItems.map((p) => p.url),
      ])
    ).filter((url) => url !== pathname)
    urlsToPrefetch.forEach((url) => {
      try {
        router.prefetch(url)
      } catch {
        // ignore
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Sidebar collapsible="icon" className="border-r bg-card" variant="sidebar">
      <SidebarContent
        className={isCollapsed ? 'flex flex-col items-center px-2 py-4' : 'p-4'}
      >
        {/* Logo */}
        <div
          className={`mb-8 flex items-center ${isCollapsed ? 'w-full justify-center' : 'gap-3 px-3'}`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-primary">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold">OmniChannel</h1>
              <p className="text-xs text-muted-foreground">Marketing Hub</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup className={isCollapsed ? 'mb-6 w-full' : 'mb-4'}>
          <SidebarGroupContent
            className={isCollapsed ? 'flex flex-col items-center' : ''}
          >
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link
                    href={item.url}
                    prefetch={true}
                    aria-current={isActive(item.url) ? 'page' : undefined}
                    className={`flex items-center ${
                      isCollapsed
                        ? 'h-full w-full justify-center'
                        : 'gap-3 px-3 py-2'
                    } ${
                      isActive(item.url)
                        ? 'rounded-md bg-accent text-accent-foreground'
                        : 'rounded-md hover:bg-accent/60'
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Platform Integrations */}
        <SidebarGroup className={isCollapsed ? 'w-full' : ''}>
          <SidebarGroupContent
            className={isCollapsed ? 'flex flex-col items-center' : ''}
          >
            {!isCollapsed && (
              <div className="mb-2 px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Platforms
                </h3>
              </div>
            )}
            {isCollapsed && (
              <div className="mx-2 my-4 border-t border-border"></div>
            )}
            <SidebarMenu className="space-y-1">
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link
                    href={item.url}
                    prefetch={true}
                    aria-current={isActive(item.url) ? 'page' : undefined}
                    className={`flex items-center ${
                      isCollapsed
                        ? 'h-full w-full justify-center'
                        : 'gap-3 px-3 py-2'
                    } ${
                      isActive(item.url)
                        ? 'rounded-md bg-accent text-accent-foreground'
                        : 'rounded-md hover:bg-accent/60'
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
