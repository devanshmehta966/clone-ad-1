"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Target,
    DollarSign,
    Calendar,
    MapPin,
    Users,
    Smartphone,
    Monitor,
    Tablet,
    // Clock,
    TrendingUp,
    Eye,
    MousePointer
} from "lucide-react"

interface CreateCampaignModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateCampaignModal({ open, onOpenChange }: CreateCampaignModalProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [campaignData, setCampaignData] = useState({
        // Basic Info
        name: "",
        objective: "",
        type: "",

        // Budget & Bidding
        budgetType: "daily",
        budget: "",
        biddingStrategy: "",
        targetCPA: "",
        targetROAS: "",

        // Targeting
        locations: [] as string[],
        languages: [] as string[],
        ageMin: "18",
        ageMax: "65+",
        gender: "all",
        devices: [] as string[],

        // Schedule
        startDate: "",
        endDate: "",
        adSchedule: "all_time",

        // Keywords & Audience
        keywords: [] as string[],
        negativeKeywords: [] as string[],
        audiences: [] as string[],

        // Ad Extensions
        sitelinks: true,
        callouts: true,
        structuredSnippets: true,

        // Advanced
        conversionTracking: true,
        dynamicSearchAds: false,
        adRotation: "optimize"
    })

    const campaignObjectives = [
        { value: "sales", label: "Sales", description: "Drive sales online, in app, by phone, or in store" },
        { value: "leads", label: "Leads", description: "Get leads and other conversions by encouraging customers to take action" },
        { value: "website_traffic", label: "Website Traffic", description: "Get the right people to visit your website" },
        { value: "brand_awareness", label: "Brand Awareness", description: "Reach people more likely to remember your ads" },
        { value: "app_promotion", label: "App Promotion", description: "Get more installs and interactions for your app" },
        { value: "local_store_visits", label: "Local Store Visits", description: "Drive visits to your physical locations" }
    ]

    const campaignTypes = [
        { value: "search", label: "Search", description: "Text ads on Google search results" },
        { value: "display", label: "Display", description: "Image ads on websites across the web" },
        { value: "shopping", label: "Shopping", description: "Product listings on Google" },
        { value: "video", label: "Video", description: "Video ads on YouTube and across the web" },
        { value: "performance_max", label: "Performance Max", description: "Ads across all Google channels" }
    ]

    const biddingStrategies = [
        { value: "maximize_conversions", label: "Maximize Conversions" },
        { value: "target_cpa", label: "Target CPA" },
        { value: "target_roas", label: "Target ROAS" },
        { value: "maximize_clicks", label: "Maximize Clicks" },
        { value: "manual_cpc", label: "Manual CPC" },
        { value: "enhanced_cpc", label: "Enhanced CPC" }
    ]

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1)
    }

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const handleSubmit = () => {
        console.log("Campaign Data:", campaignData)
        alert("Campaign created successfully!")
        onOpenChange(false)
        setCurrentStep(1)
    }

    const updateCampaignData = (field: string, value: any) => {
        setCampaignData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Create New Google Ads Campaign
                    </DialogTitle>
                    <DialogDescription>
                        Set up your campaign with targeting, budget, and ad preferences
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {step}
                            </div>
                            <div className="ml-2 text-sm">
                                {step === 1 && "Campaign Setup"}
                                {step === 2 && "Budget & Bidding"}
                                {step === 3 && "Targeting"}
                                {step === 4 && "Review & Launch"}
                            </div>
                            {step < 4 && <div className="w-12 h-0.5 bg-gray-200 mx-4" />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Campaign Setup */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Basics</CardTitle>
                                <CardDescription>Choose your campaign objective and type</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="campaign-name">Campaign Name</Label>
                                    <Input
                                        id="campaign-name"
                                        placeholder="e.g., Summer Sale 2024"
                                        value={campaignData.name}
                                        onChange={(e) => updateCampaignData("name", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Campaign Objective</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                        {campaignObjectives.map((objective) => (
                                            <div
                                                key={objective.value}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${campaignData.objective === objective.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => updateCampaignData("objective", objective.value)}
                                            >
                                                <div className="font-medium">{objective.label}</div>
                                                <div className="text-sm text-gray-600">{objective.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Campaign Type</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                        {campaignTypes.map((type) => (
                                            <div
                                                key={type.value}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${campaignData.type === type.value
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => updateCampaignData("type", type.value)}
                                            >
                                                <div className="font-medium">{type.label}</div>
                                                <div className="text-sm text-gray-600">{type.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 2: Budget & Bidding */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Budget & Bidding Strategy
                                </CardTitle>
                                <CardDescription>Set your budget and how you want to bid</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Budget Type</Label>
                                        <Select value={campaignData.budgetType} onValueChange={(value) => updateCampaignData("budgetType", value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily Budget</SelectItem>
                                                <SelectItem value="total">Total Campaign Budget</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Budget Amount ($)</Label>
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            value={campaignData.budget}
                                            onChange={(e) => updateCampaignData("budget", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Bidding Strategy</Label>
                                    <Select value={campaignData.biddingStrategy} onValueChange={(value) => updateCampaignData("biddingStrategy", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose bidding strategy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {biddingStrategies.map((strategy) => (
                                                <SelectItem key={strategy.value} value={strategy.value}>
                                                    {strategy.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {campaignData.biddingStrategy === "target_cpa" && (
                                    <div>
                                        <Label>Target CPA ($)</Label>
                                        <Input
                                            type="number"
                                            placeholder="25"
                                            value={campaignData.targetCPA}
                                            onChange={(e) => updateCampaignData("targetCPA", e.target.value)}
                                        />
                                    </div>
                                )}

                                {campaignData.biddingStrategy === "target_roas" && (
                                    <div>
                                        <Label>Target ROAS (%)</Label>
                                        <Input
                                            type="number"
                                            placeholder="400"
                                            value={campaignData.targetROAS}
                                            onChange={(e) => updateCampaignData("targetROAS", e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Start Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={campaignData.startDate}
                                            onChange={(e) => updateCampaignData("startDate", e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label>End Date (Optional)</Label>
                                        <Input
                                            type="date"
                                            value={campaignData.endDate}
                                            onChange={(e) => updateCampaignData("endDate", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 3: Targeting */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <Tabs defaultValue="location" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="location">Location</TabsTrigger>
                                <TabsTrigger value="audience">Audience</TabsTrigger>
                                <TabsTrigger value="devices">Devices</TabsTrigger>
                                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                            </TabsList>

                            <TabsContent value="location" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Location Targeting
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Target Locations</Label>
                                            <Input placeholder="Enter countries, states, cities..." />
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge variant="secondary">United States</Badge>
                                                <Badge variant="secondary">Canada</Badge>
                                                <Badge variant="secondary">+ Add Location</Badge>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Languages</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select languages" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="es">Spanish</SelectItem>
                                                    <SelectItem value="fr">French</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="audience" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Audience Targeting
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Age Range</Label>
                                                <div className="flex gap-2">
                                                    <Select value={campaignData.ageMin} onValueChange={(value) => updateCampaignData("ageMin", value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="18">18</SelectItem>
                                                            <SelectItem value="25">25</SelectItem>
                                                            <SelectItem value="35">35</SelectItem>
                                                            <SelectItem value="45">45</SelectItem>
                                                            <SelectItem value="55">55</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <span className="self-center">to</span>
                                                    <Select value={campaignData.ageMax} onValueChange={(value) => updateCampaignData("ageMax", value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="24">24</SelectItem>
                                                            <SelectItem value="34">34</SelectItem>
                                                            <SelectItem value="44">44</SelectItem>
                                                            <SelectItem value="54">54</SelectItem>
                                                            <SelectItem value="64">64</SelectItem>
                                                            <SelectItem value="65+">65+</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Gender</Label>
                                                <Select value={campaignData.gender} onValueChange={(value) => updateCampaignData("gender", value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Genders</SelectItem>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Custom Audiences</Label>
                                            <Input placeholder="Search for audience segments..." />
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge variant="outline">In-Market: Home & Garden</Badge>
                                                <Badge variant="outline">Affinity: Sports Fans</Badge>
                                                <Badge variant="outline">+ Add Audience</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="devices" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Device Targeting</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="w-4 h-4" />
                                                    <span>Desktop</span>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="w-4 h-4" />
                                                    <span>Mobile</span>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Tablet className="w-4 h-4" />
                                                    <span>Tablet</span>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="keywords" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Keywords & Match Types</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Keywords</Label>
                                            <Textarea
                                                placeholder="Enter keywords (one per line)&#10;running shoes&#10;athletic footwear&#10;sports sneakers"
                                                rows={4}
                                            />
                                        </div>

                                        <div>
                                            <Label>Negative Keywords</Label>
                                            <Textarea
                                                placeholder="Enter negative keywords (one per line)&#10;free&#10;cheap&#10;used"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge>Broad Match</Badge>
                                            <Badge variant="outline">Phrase Match</Badge>
                                            <Badge variant="outline">Exact Match</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {/* Step 4: Review & Launch */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Summary</CardTitle>
                                <CardDescription>Review your campaign settings before launching</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div>
                                            <span className="font-medium">Campaign Name:</span>
                                            <p className="text-gray-600">{campaignData.name || "Untitled Campaign"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Objective:</span>
                                            <p className="text-gray-600">{campaignData.objective || "Not selected"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Campaign Type:</span>
                                            <p className="text-gray-600">{campaignData.type || "Not selected"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Budget:</span>
                                            <p className="text-gray-600">
                                                ${campaignData.budget || "0"} {campaignData.budgetType}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <span className="font-medium">Bidding Strategy:</span>
                                            <p className="text-gray-600">{campaignData.biddingStrategy || "Not selected"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Start Date:</span>
                                            <p className="text-gray-600">{campaignData.startDate || "Not set"}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Age Range:</span>
                                            <p className="text-gray-600">{campaignData.ageMin} - {campaignData.ageMax}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Gender:</span>
                                            <p className="text-gray-600">{campaignData.gender}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-medium">Estimated Performance</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <Eye className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                                            <div className="text-sm text-gray-600">Impressions/day</div>
                                            <div className="font-semibold">1.2K - 3.5K</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <MousePointer className="w-5 h-5 mx-auto mb-1 text-green-600" />
                                            <div className="text-sm text-gray-600">Clicks/day</div>
                                            <div className="font-semibold">24 - 89</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <DollarSign className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                                            <div className="text-sm text-gray-600">Avg. CPC</div>
                                            <div className="font-semibold">$1.12 - $4.23</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-between pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                    >
                        Previous
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        {currentStep < 4 ? (
                            <Button onClick={handleNext}>
                                Next
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                                Launch Campaign
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}