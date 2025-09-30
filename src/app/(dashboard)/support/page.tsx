import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="mt-1 text-muted-foreground">How can we help you?</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Suggested approach: Provide a contact form that sends to your
            support inbox, plus links to documentation and a status page. For
            now, this page includes quick links.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href="/docs" target="_blank" rel="noreferrer">
                Documentation
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:support@yourcompany.com">Email Support</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/status" target="_blank" rel="noreferrer">
                System Status
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
