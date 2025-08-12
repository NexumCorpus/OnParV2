'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Video, 
  Phone, 
  Mail,
  ExternalLink,
  Search,
  ChefHat,
  Package,
  BarChart3,
  Zap,
  Star,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

interface HelpCenterProps {
  userProfile?: any
}

export function HelpCenter({ userProfile }: HelpCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  })

  const quickHelp = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of OnPar inventory management',
      icon: ChefHat,
      category: 'basics',
      articles: [
        'Setting up your first inventory items',
        'Adding menu items and tracking performance',
        'Understanding waste reduction insights',
        'Mobile app usage in the kitchen'
      ]
    },
    {
      title: 'Inventory Management',
      description: 'Master your inventory tracking and optimization',
      icon: Package,
      category: 'inventory',
      articles: [
        'Setting reorder points effectively',
        'Managing expiry dates and FIFO rotation',
        'Bulk importing inventory data',
        'Understanding low stock alerts'
      ]
    },
    {
      title: 'Analytics & Reports',
      description: 'Get insights from your restaurant data',
      icon: BarChart3,
      category: 'analytics',
      articles: [
        'Reading your waste reduction reports',
        'Understanding cost analysis charts',
        'Exporting data for accounting',
        'Setting up automated reports'
      ]
    },
    {
      title: 'AI Features (Premium)',
      description: 'Maximize savings with AI-powered insights',
      icon: Zap,
      category: 'premium',
      articles: [
        'Understanding AI waste predictions',
        'Implementing AI recommendations',
        'Optimizing menu performance with AI',
        'Advanced forecasting features'
      ]
    }
  ]

  const faqs = [
    {
      question: 'How do I add my first inventory items?',
      answer: 'Go to the Inventory tab and click "Add Item". You can enter items manually or use our CSV import feature for bulk uploads. Start with your most expensive or frequently used items.',
      category: 'basics'
    },
    {
      question: 'What is a reorder point and how do I set it?',
      answer: 'A reorder point is the minimum quantity that triggers a low stock alert. Set it based on your usage rate and supplier delivery time. For example, if you use 10 units per week and delivery takes 3 days, set your reorder point to 5-7 units.',
      category: 'inventory'
    },
    {
      question: 'How accurate are the waste reduction predictions?',
      answer: 'Our AI analyzes your historical data and industry benchmarks to provide 85-95% accurate predictions. The more data you input, the more accurate the predictions become.',
      category: 'premium'
    },
    {
      question: 'Can I use OnPar on my phone in the kitchen?',
      answer: 'Yes! OnPar is designed mobile-first. You can update inventory, check alerts, and view reports from any smartphone or tablet. The interface works great even with kitchen gloves.',
      category: 'basics'
    },
    {
      question: 'How do I export my data for accounting?',
      answer: 'Go to the Reports tab and select "Financial Performance" or "Inventory Summary". You can export in Excel, CSV, or PDF format. Reports include all the data your accountant needs.',
      category: 'analytics'
    },
    {
      question: 'What happens if I cancel my subscription?',
      answer: 'You can export all your data before canceling. Your account remains accessible for 30 days after cancellation, giving you time to transition to another system if needed.',
      category: 'billing'
    }
  ]

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate support ticket submission
    toast.success('Support ticket submitted! We\'ll respond within 2-4 hours.')
    setSupportForm({ subject: '', message: '', priority: 'medium' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            OnPar Help Center
          </DialogTitle>
          <DialogDescription>
            Get help, find answers, and learn how to maximize your restaurant's efficiency
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="help" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="help">Quick Help</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="help" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickHelp.map((section) => {
                const Icon = section.icon
                return (
                  <Card key={section.title} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {section.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.articles.map((article, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                              {article}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {faq.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Options</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Live Chat</div>
                      <div className="text-sm text-muted-foreground">Available 9 AM - 6 PM EST</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-muted-foreground">support@onpar.app</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Phone className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Phone Support</div>
                      <div className="text-sm text-muted-foreground">(843) 555-0123</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Response Times</span>
                  </div>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Live Chat: Immediate</li>
                    <li>• Email: 2-4 hours</li>
                    <li>• Phone: 1-2 hours callback</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Submit Support Ticket</h3>
                
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={supportForm.priority}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low - General question</option>
                      <option value="medium">Medium - Feature help</option>
                      <option value="high">High - System issue</option>
                      <option value="urgent">Urgent - Business critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={supportForm.message}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe your issue in detail..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Submit Support Ticket
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Tutorials
                  </CardTitle>
                  <CardDescription>
                    Step-by-step video guides for all features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Getting Started (5 min)</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inventory Setup (8 min)</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Features Tour (12 min)</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Documentation
                  </CardTitle>
                  <CardDescription>
                    Comprehensive guides and best practices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Manual (PDF)</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Documentation</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Best Practices Guide</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community
                  </CardTitle>
                  <CardDescription>
                    Connect with other restaurant owners
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OnPar Community Forum</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Facebook Group</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Stories</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Premium Support
                  </CardTitle>
                  <CardDescription>
                    Enhanced support for premium users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {userProfile?.premium_subscription ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Priority Support Queue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Dedicated Account Manager</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Phone Support Available</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Upgrade to Premium for enhanced support
                      </p>
                      <Button size="sm" variant="outline">
                        <Star className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}