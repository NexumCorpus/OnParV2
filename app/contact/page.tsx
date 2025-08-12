'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardNavbar } from '@/components/dashboard/navbar'
import { BreadcrumbNav } from '@/components/dashboard/breadcrumb-nav'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Calendar, Star, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    restaurant: '',
    subject: '',
    message: '',
    inquiryType: '',
    preferredContact: 'email'
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitted(true)
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <DashboardNavbar />
        <BreadcrumbNav />
        <div className="container mx-auto p-6">
          <div className="max-w-2xl mx-auto text-center py-24">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-6">Message Sent!</h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Thank you for contacting OnPar. Our team will review your message and respond within 24 hours.
            </p>
            <Button size="lg" className="btn-primary-enhanced px-8 py-4 text-lg font-bold rounded-2xl" onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <DashboardNavbar />
      <BreadcrumbNav />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-8 px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg font-bold">
            <MessageSquare className="w-5 h-5 mr-2" />
            Get in Touch
          </Badge>
          <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">Contact OnPar</span>
          </h1>
          <p className="text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            Have questions about OnPar? Want to schedule a demo? Our team is here to help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="card-premium shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-6">
                <CardTitle className="text-2xl font-bold">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold">Email Support</div>
                    <div className="text-sm text-muted-foreground">support@onpar.app</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold">Phone Support</div>
                    <div className="text-sm text-muted-foreground">(843) 555-ONPAR</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold">Location</div>
                    <div className="text-sm text-muted-foreground">Charleston, SC</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold">Response Time</div>
                    <div className="text-sm text-muted-foreground">Within 24 hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-premium shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-6">
                <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Link href="/beta-signup">
                  <Button className="w-full btn-primary-enhanced py-3 font-bold rounded-xl">
                    <Star className="h-4 w-4 mr-2" />
                    Apply for Beta Access
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" className="w-full py-3 font-bold rounded-xl">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Demo
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full py-3 font-bold rounded-xl">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="card-premium shadow-2xl">
              <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-8">
                <CardTitle className="text-3xl font-bold">Send us a Message</CardTitle>
                <p className="text-muted-foreground text-lg mt-2">
                  We'd love to hear from you and help with any questions
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-base font-semibold">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        required
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(843) 555-0123"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="restaurant" className="text-base font-semibold">Restaurant Name</Label>
                      <Input
                        id="restaurant"
                        value={formData.restaurant}
                        onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                        placeholder="Your restaurant name"
                        className="mt-2 h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="inquiryType" className="text-base font-semibold">Inquiry Type</Label>
                      <Select value={formData.inquiryType} onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}>
                        <SelectTrigger className="mt-2 h-12 text-base">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beta-access">Beta Access Request</SelectItem>
                          <SelectItem value="demo">Schedule Demo</SelectItem>
                          <SelectItem value="pricing">Pricing Questions</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                          <SelectItem value="integration">Integration Partnership</SelectItem>
                          <SelectItem value="general">General Question</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preferredContact" className="text-base font-semibold">Preferred Contact Method</Label>
                      <Select value={formData.preferredContact} onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}>
                        <SelectTrigger className="mt-2 h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="either">Either</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-base font-semibold">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your inquiry"
                      required
                      className="mt-2 h-12 text-base"
                    />
                  </div>

                

                  <div>
                    <Label htmlFor="message" className="text-base font-semibold">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your needs, questions, or how we can help..."
                      required
                      className="mt-2 min-h-[120px] text-base"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    size="lg"
                    className="w-full btn-primary-enhanced py-4 text-lg font-bold rounded-2xl shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-transparent mr-3"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-3" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card className="card-premium shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20 p-8">
              <CardTitle className="text-3xl font-bold text-center">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <h4 className="font-bold text-lg mb-3">How quickly can I get started?</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Most restaurants are up and running within 5 minutes. Our CSV import and guided setup make onboarding incredibly fast.
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <h4 className="font-bold text-lg mb-3">What's included in the beta program?</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Full access to all features, priority support, and discounted pricing when we launch. No cost during beta period.
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <h4 className="font-bold text-lg mb-3">Do you integrate with POS systems?</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Currently in development. We're working on integrations with major POS providers for seamless data sync.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <h4 className="font-bold text-lg mb-3">What kind of support do you provide?</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Email support, phone support, and for the $299 setup fee, we provide personalized onboarding and training.
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <h4 className="font-bold text-lg mb-3">How does the AI actually work?</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Our AI analyzes your sales patterns, waste data, and ordering history to predict optimal inventory levels and identify cost-saving opportunities.
                    </p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <h4 className="font-bold text-lg mb-3">Is my data secure?</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Absolutely. We use enterprise-grade encryption, SOC 2 compliance, and never share your data with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}