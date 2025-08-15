'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  Target,
  Users,
  Mail,
  Printer,
  Share,
  Eye,
  Settings,
  Zap,
  Award,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { Database } from '../../lib/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface ReportConfig {
  name: string
  type: 'inventory' | 'waste' | 'financial' | 'performance' | 'compliance' | 'custom'
  dateRange: {
    start: string
    end: string
    preset: string
  }
  filters: {
    categories: string[]
    suppliers: string[]
    locations: string[]
    status: string[]
  }
  metrics: string[]
  format: 'pdf' | 'excel' | 'csv' | 'json'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    recipients: string[]
    enabled: boolean
  }
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  icon: any
  metrics: string[]
  defaultFilters: any
  isPremium?: boolean
}

interface ReportGeneratorProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  userProfile: any
  isPremium: boolean
}

export function ReportGenerator({ 
  inventoryItems, 
  menuItems, 
  userProfile, 
  isPremium 
}: ReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: '',
    type: 'inventory',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      preset: 'last-30-days'
    },
    filters: {
      categories: [],
      suppliers: [],
      locations: [],
      status: []
    },
    metrics: [],
    format: 'pdf'
  })
  const [showPreview, setShowPreview] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [savedReports, setSavedReports] = useState<any[]>([])

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'inventory-summary',
      name: 'Inventory Summary',
      description: 'Complete overview of current inventory levels, values, and alerts',
      type: 'inventory',
      icon: Package,
      metrics: ['total_value', 'item_count', 'low_stock_alerts', 'expiring_items', 'category_breakdown'],
      defaultFilters: { status: ['active'] }
    },
    {
      id: 'waste-analysis',
      name: 'Waste Analysis Report',
      description: 'Detailed analysis of food waste patterns and reduction opportunities',
      type: 'waste',
      icon: AlertTriangle,
      metrics: ['waste_percentage', 'waste_cost', 'waste_trends', 'top_waste_items', 'reduction_opportunities'],
      defaultFilters: { categories: ['all'] }
    },
    {
      id: 'financial-performance',
      name: 'Financial Performance',
      description: 'Cost analysis, budget tracking, and profitability metrics',
      type: 'financial',
      icon: DollarSign,
      metrics: ['total_spend', 'budget_utilization', 'cost_per_serving', 'profit_margins', 'savings_achieved'],
      defaultFilters: {}
    },
    {
      id: 'supplier-performance',
      name: 'Supplier Performance',
      description: 'Supplier reliability, delivery times, and cost analysis',
      type: 'performance',
      icon: Users,
      metrics: ['supplier_ratings', 'delivery_performance', 'cost_comparison', 'order_frequency'],
      defaultFilters: { status: ['active'] },
      isPremium: true
    },
    {
      id: 'menu-optimization',
      name: 'Menu Optimization',
      description: 'Menu item performance, profitability, and optimization recommendations',
      type: 'performance',
      icon: Target,
      metrics: ['sales_performance', 'profit_margins', 'waste_by_item', 'optimization_suggestions'],
      defaultFilters: {},
      isPremium: true
    },
    {
      id: 'compliance-audit',
      name: 'Compliance Audit',
      description: 'Food safety compliance, expiry tracking, and audit trail',
      type: 'compliance',
      icon: CheckCircle,
      metrics: ['expiry_compliance', 'rotation_tracking', 'temperature_logs', 'audit_trail'],
      defaultFilters: {},
      isPremium: true
    },
    {
      id: 'ai-insights',
      name: 'AI Insights Report',
      description: 'Advanced AI-powered recommendations and predictive analytics',
      type: 'custom',
      icon: Zap,
      metrics: ['ai_recommendations', 'predictive_analytics', 'optimization_opportunities', 'trend_analysis'],
      defaultFilters: {},
      isPremium: true
    }
  ]

  // Filter templates based on premium status
  const availableTemplates = reportTemplates.filter(template => 
    !template.isPremium || isPremium
  )

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setReportConfig(prev => ({
      ...prev,
      name: template.name,
      type: template.type as any,
      metrics: template.metrics,
      filters: { ...prev.filters, ...template.defaultFilters }
    }))
  }

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const reportData = generateReportData(reportConfig, inventoryItems, menuItems, userProfile)
      
      // In a real app, this would call an API to generate the actual report
      downloadReport(reportData, reportConfig.format)
      
      toast.success(`${reportConfig.name} generated successfully!`)
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = (data: any, format: string) => {
    let content: string
    let mimeType: string
    let filename: string

    switch (format) {
      case 'csv':
        content = convertToCSV(data)
        mimeType = 'text/csv'
        filename = `${reportConfig.name.replace(/\s+/g, '_')}.csv`
        break
      case 'json':
        content = JSON.stringify(data, null, 2)
        mimeType = 'application/json'
        filename = `${reportConfig.name.replace(/\s+/g, '_')}.json`
        break
      default:
        // For PDF and Excel, we'd typically call a backend service
        toast.info(`${format.toUpperCase()} generation would be handled by backend service`)
        return
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any): string => {
    if (!data || !data.summary) return ''
    
    const headers = Object.keys(data.summary)
    const values = Object.values(data.summary)
    
    return [
      headers.join(','),
      values.join(',')
    ].join('\n')
  }

  const generateReportData = (
    config: ReportConfig, 
    inventory: InventoryItem[], 
    menu: MenuItem[], 
    profile: any
  ) => {
    const summary = {
      report_name: config.name,
      generated_at: new Date().toISOString(),
      date_range: `${config.dateRange.start} to ${config.dateRange.end}`,
      restaurant_name: profile?.restaurant_name || 'Restaurant',
      total_inventory_items: inventory.length,
      total_menu_items: menu.length,
      total_inventory_value: inventory.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0),
      low_stock_items: inventory.filter(item => item.quantity <= item.reorder_point).length,
      expiring_items: inventory.filter(item => {
        if (!item.expiry_date) return false
        const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0
      }).length,
      avg_waste_percentage: menu.length > 0 
        ? menu.reduce((sum, item) => sum + item.waste_percentage, 0) / menu.length 
        : 0
    }

    return {
      summary,
      inventory_details: inventory,
      menu_details: menu,
      metrics: config.metrics,
      filters_applied: config.filters
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            Generate comprehensive reports for your restaurant's inventory and performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Scheduled Reports
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Report</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Report Template</CardTitle>
              <CardDescription>
                Select from our pre-built report templates designed for restaurant operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTemplates.map((template) => {
                  const Icon = template.icon
                  return (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              {template.isPremium && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.metrics.slice(0, 3).map((metric) => (
                            <Badge key={metric} variant="outline" className="text-xs">
                              {metric.replace('_', ' ')}
                            </Badge>
                          ))}
                          {template.metrics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.metrics.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Configure Report: {selectedTemplate.name}</CardTitle>
                <CardDescription>
                  Customize the report parameters and filters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="report_name">Report Name</Label>
                    <Input
                      id="report_name"
                      value={reportConfig.name}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter report name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={reportConfig.format} onValueChange={(value: any) => setReportConfig(prev => ({ ...prev, format: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                        <SelectItem value="json">JSON Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <Select 
                      value={reportConfig.dateRange.preset} 
                      onValueChange={(value) => {
                        const ranges = getDateRangePresets()
                        const range = ranges[value]
                        setReportConfig(prev => ({
                          ...prev,
                          dateRange: {
                            preset: value,
                            start: range.start,
                            end: range.end
                          }
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                        <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                        <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="this-quarter">This Quarter</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      value={reportConfig.dateRange.start}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value, preset: 'custom' }
                      }))}
                    />

                    <Input
                      type="date"
                      value={reportConfig.dateRange.end}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value, preset: 'custom' }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Included Metrics</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {selectedTemplate.metrics.map((metric) => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox
                          id={metric}
                          checked={reportConfig.metrics.includes(metric)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setReportConfig(prev => ({
                                ...prev,
                                metrics: [...prev.metrics, metric]
                              }))
                            } else {
                              setReportConfig(prev => ({
                                ...prev,
                                metrics: prev.metrics.filter(m => m !== metric)
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={metric} className="text-sm capitalize">
                          {metric.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setShowPreview(true)} variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={handleGenerateReport} disabled={generating}>
                    {generating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>
                Build a custom report with your specific requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Custom Report Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced custom report builder coming soon
                </p>
                {!isPremium && (
                  <Badge variant="outline">Premium Feature</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Set up automatic report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Scheduled Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Automatic report scheduling coming soon
                </p>
                {!isPremium && (
                  <Badge variant="outline">Premium Feature</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                View and download previously generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Inventory Summary - January 2025', date: '2025-01-12', format: 'PDF', size: '2.3 MB' },
                  { name: 'Waste Analysis - December 2024', date: '2025-01-01', format: 'Excel', size: '1.8 MB' },
                  { name: 'Financial Performance - Q4 2024', date: '2024-12-31', format: 'PDF', size: '3.1 MB' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Generated on {report.date} • {report.format} • {report.size}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Preview Dialog */}
      <ReportPreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        reportConfig={reportConfig}
        reportData={generateReportData(reportConfig, inventoryItems, menuItems, userProfile)}
      />
    </div>
  )
}

// Report Preview Dialog Component
function ReportPreviewDialog({
  isOpen,
  onClose,
  reportConfig,
  reportData
}: {
  isOpen: boolean
  onClose: () => void
  reportConfig: ReportConfig
  reportData: any
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Preview: {reportConfig.name}</DialogTitle>
          <DialogDescription>
            Preview of your report before generating the final version
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Report Header */}
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold">{reportConfig.name}</h1>
            <div className="text-sm text-muted-foreground mt-2">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Period: {reportConfig.dateRange.start} to {reportConfig.dateRange.end}</p>
              <p>Restaurant: {reportData.summary.restaurant_name}</p>
            </div>
          </div>

          {/* Summary Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Items</div>
                <div className="text-xl font-bold">{reportData.summary.total_inventory_items}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-xl font-bold">${reportData.summary.total_inventory_value.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Low Stock</div>
                <div className="text-xl font-bold text-yellow-600">{reportData.summary.low_stock_items}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Expiring Soon</div>
                <div className="text-xl font-bold text-orange-600">{reportData.summary.expiring_items}</div>
              </div>
            </div>
          </div>

          {/* Sample Data Table */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Inventory Details (Sample)</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Item Name</th>
                    <th className="text-left p-3">Quantity</th>
                    <th className="text-left p-3">Unit</th>
                    <th className="text-left p-3">Value</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.inventory_details.slice(0, 5).map((item: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{item.unit}</td>
                      <td className="p-3">${(item.quantity * item.price_per_unit).toFixed(2)}</td>
                      <td className="p-3">
                        <Badge variant={item.quantity <= item.reorder_point ? 'secondary' : 'default'}>
                          {item.quantity <= item.reorder_point ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reportData.inventory_details.length > 5 && (
              <p className="text-sm text-muted-foreground mt-2">
                ... and {reportData.inventory_details.length - 5} more items
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Generate Full Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get date range presets
function getDateRangePresets(): Record<string, { start: string; end: string }> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  return {
    'last-7-days': {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: today
    },
    'last-30-days': {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: today
    },
    'last-90-days': {
      start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: today
    },
    'this-month': {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      end: today
    },
    'last-month': {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
      end: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
    },
    'this-quarter': {
      start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString().split('T')[0],
      end: today
    }
  }
}