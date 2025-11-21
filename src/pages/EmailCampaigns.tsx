import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import {
  Mail,
  Plus,
  Send,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockCampaigns, mockCustomers } from '@/lib/mock-bi-data';

gsap.registerPlugin(ScrollTrigger);

const EmailCampaigns = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'welcome' as const,
    targetSegment: '',
    subject: '',
    content: '',
    sendDate: ''
  });

  // Mock additional campaigns for demonstration
  const allCampaigns = [
    ...mockCampaigns,
    {
      id: 'CMP-004',
      name: 'Birthday Special',
      type: 'birthday' as const,
      status: 'scheduled' as const,
      targetSegment: 'Birthday Customers',
      sendDate: '2024-12-15',
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      revenue: 0,
      subject: 'Happy Birthday! Exclusive Birthday Offer',
      content: 'Birthday campaign content...'
    },
    {
      id: 'CMP-005',
      name: 'Loyalty Rewards',
      type: 'loyalty' as const,
      status: 'completed' as const,
      targetSegment: 'VIP Customers',
      sendDate: '2024-11-01',
      sentCount: 85,
      openRate: 42.3,
      clickRate: 15.7,
      conversionRate: 12.4,
      revenue: 2100,
      subject: 'Thank You for Your Loyalty - Special Rewards Await',
      content: 'Loyalty campaign content...'
    }
  ];

  const filteredCampaigns = allCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    // Animate dashboard entrance
    if (dashboardRef.current) {
      gsap.fromTo(dashboardRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }
      );
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'scheduled':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'draft':
        return <Edit className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateCampaign = () => {
    // In a real app, this would make an API call
    console.log('Creating campaign:', newCampaign);
    setIsCreateDialogOpen(false);
    setNewCampaign({
      name: '',
      type: 'welcome',
      targetSegment: '',
      subject: '',
      content: '',
      sendDate: ''
    });
  };

  const campaignStats = {
    total: allCampaigns.length,
    sent: allCampaigns.filter(c => c.status === 'sent' || c.status === 'completed').length,
    scheduled: allCampaigns.filter(c => c.status === 'scheduled').length,
    draft: allCampaigns.filter(c => c.status === 'draft').length,
    totalRevenue: allCampaigns.reduce((sum, c) => sum + c.revenue, 0),
    avgOpenRate: Math.round(allCampaigns.filter(c => c.sentCount > 0).reduce((sum, c) => sum + c.openRate, 0) /
                   allCampaigns.filter(c => c.sentCount > 0).length * 10) / 10,
    avgClickRate: Math.round(allCampaigns.filter(c => c.sentCount > 0).reduce((sum, c) => sum + c.clickRate, 0) /
                    allCampaigns.filter(c => c.sentCount > 0).length * 10) / 10
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="pt-24 px-4 md:px-8">
        <div ref={dashboardRef} className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif luxury-glow mb-2">Email Campaigns</h1>
              <p className="text-muted-foreground">Automated marketing campaigns for customer engagement</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="frosted-glass border-white/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                  <DialogDescription>
                    Set up an automated email campaign to engage with your customers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Campaign Name</label>
                      <Input
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                        className="bg-white/5 border-white/20"
                        placeholder="e.g., Holiday Promotion 2024"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Campaign Type</label>
                      <Select value={newCampaign.type} onValueChange={(value: any) => setNewCampaign({...newCampaign, type: value})}>
                        <SelectTrigger className="bg-white/5 border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="frosted-glass border-white/20">
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="reactivation">Reactivation</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                          <SelectItem value="birthday">Birthday</SelectItem>
                          <SelectItem value="loyalty">Loyalty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Target Segment</label>
                      <Select value={newCampaign.targetSegment} onValueChange={(value) => setNewCampaign({...newCampaign, targetSegment: value})}>
                        <SelectTrigger className="bg-white/5 border-white/20">
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                        <SelectContent className="frosted-glass border-white/20">
                          <SelectItem value="All Customers">All Customers</SelectItem>
                          <SelectItem value="VIP Customers">VIP Customers</SelectItem>
                          <SelectItem value="New Customers">New Customers</SelectItem>
                          <SelectItem value="At-Risk Customers">At-Risk Customers</SelectItem>
                          <SelectItem value="Birthday Customers">Birthday Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Send Date</label>
                      <Input
                        type="date"
                        value={newCampaign.sendDate}
                        onChange={(e) => setNewCampaign({...newCampaign, sendDate: e.target.value})}
                        className="bg-white/5 border-white/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Email Subject</label>
                    <Input
                      value={newCampaign.subject}
                      onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                      className="bg-white/5 border-white/20"
                      placeholder="Enter compelling subject line"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Email Content</label>
                    <Textarea
                      value={newCampaign.content}
                      onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                      className="bg-white/5 border-white/20 min-h-[120px]"
                      placeholder="Write your email content here..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleCreateCampaign} className="flex-1">
                      Create Campaign
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    <p className="text-2xl font-bold luxury-glow">{campaignStats.total}</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Campaign Revenue</p>
                    <p className="text-2xl font-bold luxury-glow">${campaignStats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                    <p className="text-2xl font-bold luxury-glow">{campaignStats.avgOpenRate}%</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="frosted-glass border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Click Rate</p>
                    <p className="text-2xl font-bold luxury-glow">{campaignStats.avgClickRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Management Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="frosted-glass border-white/10">
              <TabsTrigger value="campaigns" className="data-[state=active]:bg-white/10">Campaigns</TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-white/10">Templates</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10">Analytics</TabsTrigger>
              <TabsTrigger value="automation" className="data-[state=active]:bg-white/10">Automation</TabsTrigger>
            </TabsList>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-6">
              {/* Filters */}
              <Card className="frosted-glass border-white/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search campaigns..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/5 border-white/20"
                        />
                      </div>
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="frosted-glass border-white/20">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="frosted-glass border-white/10 hover:border-white/20 transition-all cursor-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getStatusIcon(campaign.status)}
                            {campaign.name}
                          </CardTitle>
                          <CardDescription>{campaign.subject}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{campaign.type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Target</p>
                          <p className="font-medium">{campaign.targetSegment}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Send Date</p>
                          <p className="font-medium">{formatDate(campaign.sendDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-medium">{campaign.sentCount.toLocaleString()}</p>
                        </div>
                      </div>

                      {campaign.sentCount > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Open Rate</span>
                            <span>{campaign.openRate}%</span>
                          </div>
                          <Progress value={campaign.openRate} className="h-2" />

                          <div className="flex justify-between text-sm">
                            <span>Click Rate</span>
                            <span>{campaign.clickRate}%</span>
                          </div>
                          <Progress value={campaign.clickRate} className="h-2" />

                          <div className="flex justify-between text-sm">
                            <span>Revenue</span>
                            <span>${campaign.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        {campaign.status === 'draft' && (
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Send Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Welcome Email', type: 'welcome', description: 'Welcome new customers to your salon' },
                  { name: 'Appointment Reminder', type: 'reminder', description: 'Remind customers of upcoming appointments' },
                  { name: 'Birthday Special', type: 'birthday', description: 'Celebrate customer birthdays with offers' },
                  { name: 'Re-engagement', type: 'reactivation', description: 'Bring back inactive customers' },
                  { name: 'Holiday Promotion', type: 'promotion', description: 'Seasonal offers and promotions' },
                  { name: 'Loyalty Rewards', type: 'loyalty', description: 'Reward loyal customers' }
                ].map((template, index) => (
                  <Card key={index} className="frosted-glass border-white/10 hover:border-white/20 transition-all cursor-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Mail className="h-8 w-8 text-blue-400" />
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{template.type}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      <Button className="w-full" variant="outline">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Campaign Performance</CardTitle>
                    <CardDescription>Overall email campaign metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Emails Sent</TableCell>
                          <TableCell className="text-right">{allCampaigns.reduce((sum, c) => sum + c.sentCount, 0).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Average Open Rate</TableCell>
                          <TableCell className="text-right">{campaignStats.avgOpenRate}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Average Click Rate</TableCell>
                          <TableCell className="text-right">{campaignStats.avgClickRate}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Revenue Generated</TableCell>
                          <TableCell className="text-right">${campaignStats.totalRevenue.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>ROI</TableCell>
                          <TableCell className="text-right text-green-400">+245%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="frosted-glass border-white/10">
                  <CardHeader>
                    <CardTitle>Campaign Types Performance</CardTitle>
                    <CardDescription>Performance by campaign type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['welcome', 'promotion', 'reactivation', 'birthday', 'loyalty'].map((type) => {
                        const typeCampaigns = allCampaigns.filter(c => c.type === type && c.sentCount > 0);
                        const avgOpenRate = typeCampaigns.length > 0 ?
                          Math.round(typeCampaigns.reduce((sum, c) => sum + c.openRate, 0) / typeCampaigns.length * 10) / 10 : 0;

                        return (
                          <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div>
                              <p className="font-medium capitalize">{type}</p>
                              <p className="text-sm text-muted-foreground">{typeCampaigns.length} campaigns</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{avgOpenRate}%</p>
                              <p className="text-xs text-muted-foreground">avg open rate</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation" className="space-y-6">
              <Card className="frosted-glass border-white/10">
                <CardHeader>
                  <CardTitle>Automated Workflows</CardTitle>
                  <CardDescription>Set up automatic email sequences based on customer behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      name: 'Welcome Series',
                      trigger: 'New customer signup',
                      status: 'Active',
                      description: 'Automated welcome emails for new customers'
                    },
                    {
                      name: 'Post-Appointment Follow-up',
                      trigger: 'Appointment completed',
                      status: 'Active',
                      description: 'Thank you emails and feedback requests after appointments'
                    },
                    {
                      name: 'Re-engagement Campaign',
                      trigger: 'No activity for 60 days',
                      status: 'Paused',
                      description: 'Bring back inactive customers with special offers'
                    },
                    {
                      name: 'Birthday Automation',
                      trigger: 'Customer birthday',
                      status: 'Active',
                      description: 'Automated birthday greetings and offers'
                    }
                  ].map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                          <p className="text-xs text-muted-foreground">Trigger: {workflow.trigger}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={workflow.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {workflow.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {workflow.status === 'Active' ? 'Pause' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EmailCampaigns;