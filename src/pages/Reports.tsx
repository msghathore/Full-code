import React from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Reports: React.FC = () => {
  const { toast } = useToast();

  const reports = [
    {
      id: '1',
      name: 'Revenue Report',
      type: 'Financial',
      status: 'ready',
      lastGenerated: '2025-11-22',
      format: 'PDF'
    },
    {
      id: '2',
      name: 'Staff Performance',
      type: 'Staff',
      status: 'ready',
      lastGenerated: '2025-11-21',
      format: 'Excel'
    },
    {
      id: '3',
      name: 'Customer Analytics',
      type: 'Customer',
      status: 'generating',
      lastGenerated: '2025-11-20',
      format: 'PDF'
    },
  ];

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'New Customers',
      value: '24',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Appointments',
      value: '156',
      change: '-2.1%',
      trend: 'down',
      icon: Calendar,
      color: 'amber'
    },
    {
      title: 'Conversion Rate',
      value: '24.5%',
      change: '+3.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'orange'
    },
  ];

  const handleGenerateReport = () => {
    toast({
      title: "Generate Report",
      description: "Preparing your report...",
    });
  };

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: "Download Report",
      description: `Downloading report ${reportId}...`,
    });
  };

  return (
    <AuthWrapper>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Analyze your business performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast({title: "Refresh", description: "Updating reports..."})}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleGenerateReport} className="bg-orange-600 hover:bg-orange-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = {
            green: 'bg-green-100 text-green-600',
            blue: 'bg-violet-100 text-violet-600',
            amber: 'bg-amber-100 text-amber-600',
            orange: 'bg-orange-100 text-orange-600'
          };

          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{metric.title}</div>
                      <div className="text-2xl font-bold">{metric.value}</div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${metric.trend === 'up' ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'}`}
                  >
                    {metric.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>Generated {new Date(report.lastGenerated).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{report.format}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge 
                    variant={report.status === 'ready' ? 'default' : 'secondary'}
                    className={report.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {report.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(report.id)}
                    disabled={report.status !== 'ready'}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => toast({title: "Revenue Report", description: "Generating revenue report..."})}
              className="h-20 flex-col"
            >
              <DollarSign className="h-6 w-6 mb-2" />
              Revenue Report
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({title: "Staff Report", description: "Generating staff performance report..."})}
              className="h-20 flex-col"
            >
              <Users className="h-6 w-6 mb-2" />
              Staff Performance
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({title: "Customer Report", description: "Generating customer analytics..."})}
              className="h-20 flex-col"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              Customer Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </AuthWrapper>
  );
};

export default Reports;