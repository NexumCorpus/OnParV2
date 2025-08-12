'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Package, 
  DollarSign,
  TrendingUp,
  Mail,
  Smartphone,
  Settings,
  Check,
  X,
  Eye,
  EyeOff,
  Filter,
  Search,
  Calendar,
  Users,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Trash2,
  MarkAsUnread
} from 'lucide-react'
import { toast } from 'sonner'
import { Database } from '@/lib/supabase'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface Notification {
  id: string
  type: 'low_stock' | 'expiring' | 'expired' | 'budget' | 'waste' | 'supplier' | 'system' | 'ai_insight'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  data?: any
  read: boolean
  dismissed: boolean
  created_at: string
  expires_at?: string
  action_url?: string
  action_label?: string
}

interface NotificationSettings {
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  low_stock_threshold: number
  expiry_warning_days: number
  budget_warning_percentage: number
  waste_threshold_percentage: number
  quiet_hours_start: string
  quiet_hours_end: string
  notification_types: {
    low_stock: boolean
    expiring_items: boolean
    budget_alerts: boolean
    waste_alerts: boolean
    supplier_updates: boolean
    ai_insights: boolean
    system_updates: boolean
  }
}

interface NotificationCenterProps {
  inventoryItems: InventoryItem[]
  menuItems: MenuItem[]
  userProfile: any
  isPremium: boolean
}

export function NotificationCenter({ 
  inventoryItems, 
  menuItems, 
  userProfile, 
  isPremium 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    low_stock_threshold: 10,
    expiry_warning_days: 7,
    budget_warning_percentage: 80,
    waste_threshold_percentage: 10,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    notification_types: {
      low_stock: true,
      expiring_items: true,
      budget_alerts: true,
      waste_alerts: true,
      supplier_updates: true,
      ai_insights: isPremium,
      system_updates: true
    }
  })
  
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  // Generate notifications based on current data
  useEffect(() => {
    const generatedNotifications = generateNotifications(inventoryItems, menuItems, userProfile, settings, isPremium)
    setNotifications(generatedNotifications)
  }, [inventoryItems, menuItems, userProfile, settings, isPremium])

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesFilter = filter === 'all' || 
                           (filter === 'unread' && !notification.read) ||
                           (filter === 'priority' && ['high', 'critical'].includes(notification.priority)) ||
                           notification.type === filter

      const matchesSearch = searchTerm === '' || 
                           notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesFilter && matchesSearch && !notification.dismissed
    })
  }, [notifications, filter, searchTerm])

  // Notification counts
  const notificationCounts = useMemo(() => {
    const unread = notifications.filter(n => !n.read && !n.dismissed).length
    const priority = notifications.filter(n => ['high', 'critical'].includes(n.priority) && !n.dismissed).length
    const byType = notifications.reduce((acc, n) => {
      if (!n.dismissed) {
        acc[n.type] = (acc[n.type] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return { unread, priority, byType }
  }, [notifications])

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, dismissed: true } : n
    ))
  }

  const handleAction = (notification: Notification) => {
    if (notification.action_url) {
      // Navigate to action URL
      console.log('Navigate to:', notification.action_url)
    }
    handleMarkAsRead(notification.id)
  }

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    toast.success('Notification settings updated')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {notificationCounts.unread > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notificationCounts.unread}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Stay informed about your restaurant's inventory and operations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{notificationCounts.unread}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <p className="text-2xl font-bold text-red-600">{notificationCounts.priority}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{notificationCounts.byType.low_stock || 0}</p>
              </div>
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring</p>
                <p className="text-2xl font-bold text-orange-600">{notificationCounts.byType.expiring || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter notifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="priority">Priority Only</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="expiring">Expiring Items</SelectItem>
                <SelectItem value="budget">Budget Alerts</SelectItem>
                <SelectItem value="waste">Waste Alerts</SelectItem>
                {isPremium && <SelectItem value="ai_insight">AI Insights</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDismiss={() => handleDismiss(notification.id)}
                  onAction={() => handleAction(notification)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filter !== 'all' 
                    ? 'No notifications match your current filters'
                    : 'You\'re all caught up!'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Premium AI Insights */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Smart recommendations based on your notification patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-sm">Notification Pattern Analysis</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      You receive 40% more low stock alerts on Mondays. Consider adjusting weekend ordering.
                    </div>
                    <div className="text-xs text-blue-600 mt-2">Optimization opportunity</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <div className="font-medium text-sm">Alert Effectiveness</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Your response time to critical alerts has improved 25% this month.
                    </div>
                    <div className="text-xs text-green-600 mt-2">Great progress!</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <NotificationSettingsDialog
        settings={settings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={updateSettings}
        isPremium={isPremium}
      />
    </div>
  )
}

// Individual Notification Item Component
function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  onAction
}: {
  notification: Notification
  onMarkAsRead: () => void
  onDismiss: () => void
  onAction: () => void
}) {
  const priorityColors = {
    low: 'border-l-blue-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-orange-500',
    critical: 'border-l-red-500'
  }

  const typeIcons = {
    low_stock: Package,
    expiring: Clock,
    expired: XCircle,
    budget: DollarSign,
    waste: AlertTriangle,
    supplier: Users,
    system: Settings,
    ai_insight: Zap
  }

  const Icon = typeIcons[notification.type] || Bell

  return (
    <div className={`p-4 border-l-4 ${priorityColors[notification.priority]} bg-card rounded-lg ${!notification.read ? 'bg-muted/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${
            notification.priority === 'critical' ? 'bg-red-100 dark:bg-red-900' :
            notification.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900' :
            notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
            'bg-blue-100 dark:bg-blue-900'
          }`}>
            <Icon className={`h-4 w-4 ${
              notification.priority === 'critical' ? 'text-red-600' :
              notification.priority === 'high' ? 'text-orange-600' :
              notification.priority === 'medium' ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
              <Badge variant="outline" className="text-xs">
                {notification.type.replace('_', ' ')}
              </Badge>
              <Badge variant={
                notification.priority === 'critical' ? 'destructive' :
                notification.priority === 'high' ? 'secondary' :
                'outline'
              } className="text-xs">
                {notification.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{new Date(notification.created_at).toLocaleString()}</span>
              {notification.expires_at && (
                <span>Expires: {new Date(notification.expires_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          {notification.action_label && (
            <Button size="sm" variant="outline" onClick={onAction}>
              {notification.action_label}
            </Button>
          )}
          
          {!notification.read && (
            <Button size="sm" variant="ghost" onClick={onMarkAsRead}>
              <Check className="h-4 w-4" />
            </Button>
          )}
          
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Notification Settings Dialog
function NotificationSettingsDialog({
  settings,
  isOpen,
  onClose,
  onSave,
  isPremium
}: {
  settings: NotificationSettings
  isOpen: boolean
  onClose: () => void
  onSave: (settings: Partial<NotificationSettings>) => void
  isPremium: boolean
}) {
  const [formData, setFormData] = useState(settings)

  useEffect(() => {
    setFormData(settings)
  }, [settings, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const updateNotificationType = (type: keyof typeof settings.notification_types, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: enabled
      }
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Configure how and when you receive notifications
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="delivery" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="delivery">Delivery Methods</TabsTrigger>
              <TabsTrigger value="types">Notification Types</TabsTrigger>
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            </TabsList>

            <TabsContent value="delivery" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_enabled">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email_enabled"
                    checked={formData.email_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms_enabled">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                  </div>
                  <Switch
                    id="sms_enabled"
                    checked={formData.sms_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sms_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push_enabled">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                  </div>
                  <Switch
                    id="push_enabled"
                    checked={formData.push_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, push_enabled: checked }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet_hours_start">Quiet Hours Start</Label>
                    <Input
                      id="quiet_hours_start"
                      type="time"
                      value={formData.quiet_hours_start}
                      onChange={(e) => setFormData(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet_hours_end">Quiet Hours End</Label>
                    <Input
                      id="quiet_hours_end"
                      type="time"
                      value={formData.quiet_hours_end}
                      onChange={(e) => setFormData(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="types" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">When inventory falls below reorder point</p>
                  </div>
                  <Switch
                    checked={formData.notification_types.low_stock}
                    onCheckedChange={(checked) => updateNotificationType('low_stock', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Expiring Items</Label>
                    <p className="text-sm text-muted-foreground">When items are approaching expiry</p>
                  </div>
                  <Switch
                    checked={formData.notification_types.expiring_items}
                    onCheckedChange={(checked) => updateNotificationType('expiring_items', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">When approaching budget limits</p>
                  </div>
                  <Switch
                    checked={formData.notification_types.budget_alerts}
                    onCheckedChange={(checked) => updateNotificationType('budget_alerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Waste Alerts</Label>
                    <p className="text-sm text-muted-foreground">When waste exceeds thresholds</p>
                  </div>
                  <Switch
                    checked={formData.notification_types.waste_alerts}
                    onCheckedChange={(checked) => updateNotificationType('waste_alerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Supplier Updates</Label>
                    <p className="text-sm text-muted-foreground">Order confirmations and delivery updates</p>
                  </div>
                  <Switch
                    checked={formData.notification_types.supplier_updates}
                    onCheckedChange={(checked) => updateNotificationType('supplier_updates', checked)}
                  />
                </div>

                {isPremium && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Insights</Label>
                      <p className="text-sm text-muted-foreground">Smart recommendations and predictions</p>
                    </div>
                    <Switch
                      checked={formData.notification_types.ai_insights}
                      onCheckedChange={(checked) => updateNotificationType('ai_insights', checked)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">App updates and maintenance notices</p>
                  </div>
                  <Switch
                    checked={formData.notification_types.system_updates}
                    onCheckedChange={(checked) => updateNotificationType('system_updates', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry_warning_days">Expiry Warning (days)</Label>
                  <Input
                    id="expiry_warning_days"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.expiry_warning_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiry_warning_days: parseInt(e.target.value) || 7 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="budget_warning_percentage">Budget Warning (%)</Label>
                  <Input
                    id="budget_warning_percentage"
                    type="number"
                    min="50"
                    max="100"
                    value={formData.budget_warning_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_warning_percentage: parseInt(e.target.value) || 80 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="waste_threshold_percentage">Waste Threshold (%)</Label>
                  <Input
                    id="waste_threshold_percentage"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.waste_threshold_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, waste_threshold_percentage: parseInt(e.target.value) || 10 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="low_stock_threshold">Low Stock Multiplier</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Generate notifications based on current data
function generateNotifications(
  inventoryItems: InventoryItem[],
  menuItems: MenuItem[],
  userProfile: any,
  settings: NotificationSettings,
  isPremium: boolean
): Notification[] {
  const notifications: Notification[] = []
  const now = new Date()

  // Low stock notifications
  if (settings.notification_types.low_stock) {
    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.reorder_point)
    lowStockItems.forEach(item => {
      notifications.push({
        id: `low_stock_${item.id}`,
        type: 'low_stock',
        priority: item.quantity === 0 ? 'critical' : 'high',
        title: `Low Stock Alert: ${item.name}`,
        message: `Only ${item.quantity} ${item.unit} remaining. Reorder point: ${item.reorder_point}`,
        data: { item_id: item.id, current_quantity: item.quantity, reorder_point: item.reorder_point },
        read: false,
        dismissed: false,
        created_at: now.toISOString(),
        action_url: '/dashboard?tab=inventory',
        action_label: 'Reorder Now'
      })
    })
  }

  // Expiring items notifications
  if (settings.notification_types.expiring_items) {
    const expiringItems = inventoryItems.filter(item => {
      if (!item.expiry_date) return false
      const daysUntilExpiry = Math.ceil((new Date(item.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= settings.expiry_warning_days && daysUntilExpiry > 0
    })

    expiringItems.forEach(item => {
      const daysUntilExpiry = Math.ceil((new Date(item.expiry_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      notifications.push({
        id: `expiring_${item.id}`,
        type: 'expiring',
        priority: daysUntilExpiry <= 2 ? 'critical' : daysUntilExpiry <= 5 ? 'high' : 'medium',
        title: `Expiring Soon: ${item.name}`,
        message: `${item.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
        data: { item_id: item.id, days_until_expiry: daysUntilExpiry },
        read: false,
        dismissed: false,
        created_at: now.toISOString(),
        expires_at: item.expiry_date!,
        action_url: '/dashboard?tab=inventory',
        action_label: 'Use First'
      })
    })
  }

  // Budget notifications
  if (settings.notification_types.budget_alerts && userProfile?.monthly_budget) {
    const currentSpend = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0)
    const budgetPercentage = (currentSpend / userProfile.monthly_budget) * 100

    if (budgetPercentage >= settings.budget_warning_percentage) {
      notifications.push({
        id: 'budget_warning',
        type: 'budget',
        priority: budgetPercentage >= 95 ? 'critical' : 'high',
        title: 'Budget Alert',
        message: `You've used ${budgetPercentage.toFixed(1)}% of your monthly budget ($${currentSpend.toFixed(2)} of $${userProfile.monthly_budget})`,
        data: { current_spend: currentSpend, budget: userProfile.monthly_budget, percentage: budgetPercentage },
        read: false,
        dismissed: false,
        created_at: now.toISOString(),
        action_url: '/dashboard?tab=analytics',
        action_label: 'View Budget'
      })
    }
  }

  // Waste notifications
  if (settings.notification_types.waste_alerts) {
    const highWasteItems = menuItems.filter(item => item.waste_percentage > settings.waste_threshold_percentage)
    if (highWasteItems.length > 0) {
      notifications.push({
        id: 'high_waste_alert',
        type: 'waste',
        priority: 'medium',
        title: 'High Waste Alert',
        message: `${highWasteItems.length} menu items have waste above ${settings.waste_threshold_percentage}%`,
        data: { high_waste_items: highWasteItems.map(item => ({ id: item.id, name: item.name, waste: item.waste_percentage })) },
        read: false,
        dismissed: false,
        created_at: now.toISOString(),
        action_url: '/dashboard?tab=menu',
        action_label: 'Optimize Menu'
      })
    }
  }

  // AI Insights (Premium only)
  if (isPremium && settings.notification_types.ai_insights) {
    notifications.push({
      id: 'ai_insight_1',
      type: 'ai_insight',
      priority: 'medium',
      title: 'AI Recommendation: Bulk Order Opportunity',
      message: 'AI detected you could save 12% by consolidating orders with your top 2 suppliers',
      data: { potential_savings: 180, recommendation_type: 'bulk_order' },
      read: false,
      dismissed: false,
      created_at: now.toISOString(),
      action_url: '/dashboard?tab=suppliers',
      action_label: 'View Details'
    })
  }

  // System notifications
  if (settings.notification_types.system_updates) {
    notifications.push({
      id: 'system_update_1',
      type: 'system',
      priority: 'low',
      title: 'New Feature: Enhanced Analytics',
      message: 'Check out our new waste reduction analytics dashboard with improved insights',
      read: false,
      dismissed: false,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      action_url: '/dashboard?tab=analytics',
      action_label: 'Explore'
    })
  }

  return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}