import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Users, 
  TrendingUp,
  Calendar,
  BarChart3,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Marketing: React.FC = () => {
  const { toast } = useToast();

  const campaigns = [
    {
      id: '1',
      name: 'Holiday Special Offer',
      type: 'Email',
      status: 'active',
      sent: 1245,
      opened: 567,
      clicked: 89,
      created: '2025-11-20'
    },
    {
      id: '2',
      name: 'New Year Promotion',
      type: 'SMS',
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
      created: '2025-11-21'
    },
  ];

  const handleCreateCampaign = () => {
    toast({
      title: "Create Campaign",
      description: "Opening campaign creation wizard...",
    });
  };

  const handleViewReport = () => {
    toast({
      title: "View Report",
      description: "Loading marketing analytics...",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
            <p className="text-gray-600">Create and manage marketing campaigns</p>
          </div>
        </div>
        <Button onClick={handleCreateCampaign} className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Users className="h-5 w-5 text-black" />
              </div>
              <div>
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-sm text-gray-500">Total Customers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">89%</div>
                <div className="text-sm text-gray-500">Open Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </div>
              <div>
                <div className="text-2xl font-bold">12.5%</div>
                <div className="text-sm text-gray-500">Click Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Target className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-gray-500">Active Campaigns</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {campaign.type === 'Email' ? (
                      <Mail className="h-5 w-5 text-black" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{campaign.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{campaign.type}</span>
                      <span>•</span>
                      <span>Created {new Date(campaign.created).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {campaign.status === 'active' && (
                    <>
                      <div className="text-center">
                        <div className="font-medium">{campaign.sent.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{campaign.opened}</div>
                        <div className="text-xs text-gray-500">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{campaign.clicked}</div>
                        <div className="text-xs text-gray-500">Clicked</div>
                      </div>
                    </>
                  )}
                  <Badge 
                    variant={campaign.status === 'active' ? 'default' : 'secondary'}
                    className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {campaign.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewReport}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-black mx-auto mb-3" />
            <h3 className="font-medium mb-2">Email Campaign</h3>
            <p className="text-sm text-gray-500 mb-4">Send targeted emails to customer segments</p>
            <Button variant="outline" size="sm" onClick={handleCreateCampaign}>
              Create Email
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium mb-2">SMS Campaign</h3>
            <p className="text-sm text-gray-500 mb-4">Reach customers with text messages</p>
            <Button variant="outline" size="sm" onClick={handleCreateCampaign}>
              Create SMS
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] mx-auto mb-3" />
            <h3 className="font-medium mb-2">Loyalty Program</h3>
            <p className="text-sm text-gray-500 mb-4">Set up automated loyalty rewards</p>
            <Button variant="outline" size="sm" onClick={() => toast({title: "Coming Soon", description: "Loyalty program features coming soon"})}>
              Setup Program
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Marketing;