import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Download, 
  Edit,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Forms: React.FC = () => {
  const { toast } = useToast();

  const forms = [
    {
      id: '1',
      name: 'Client Intake Form',
      type: 'Client Information',
      status: 'active',
      responses: 45,
      created: '2025-11-15'
    },
    {
      id: '2',
      name: 'Service Feedback Survey',
      type: 'Feedback',
      status: 'active',
      responses: 23,
      created: '2025-11-10'
    },
    {
      id: '3',
      name: 'Health Questionnaire',
      type: 'Medical',
      status: 'draft',
      responses: 0,
      created: '2025-11-20'
    },
  ];

  const handleCreateForm = () => {
    toast({
      title: "Create Form",
      description: "Opening form builder...",
    });
  };

  const handleViewResponses = (formId: string) => {
    toast({
      title: "View Responses",
      description: `Loading responses for form ${formId}...`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <FileText className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
            <p className="text-gray-600">Create and manage digital forms</p>
          </div>
        </div>
        <Button onClick={handleCreateForm} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <Card key={form.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{form.name}</CardTitle>
                <Badge 
                  variant={form.status === 'active' ? 'default' : 'secondary'}
                  className={form.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {form.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{form.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Responses:</span>
                  <span className="font-medium">{form.responses}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{new Date(form.created).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewResponses(form.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={handleCreateForm}
              className="h-20 flex-col"
            >
              <Plus className="h-6 w-6 mb-2" />
              Create Form
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({title: "Templates", description: "Loading form templates..."})}
              className="h-20 flex-col"
            >
              <FileText className="h-6 w-6 mb-2" />
              Browse Templates
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({title: "Import", description: "Import existing forms..."})}
              className="h-20 flex-col"
            >
              <Download className="h-6 w-6 mb-2" />
              Import Forms
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({title: "Analytics", description: "Loading form analytics..."})}
              className="h-20 flex-col"
            >
              <CheckCircle className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forms;