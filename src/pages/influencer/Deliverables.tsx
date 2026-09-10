import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, Upload, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInfluencerDeliverables } from '@/hooks/useDeliverables';

const Deliverables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: deliverables = [], isLoading } = useInfluencerDeliverables();

  const filteredDeliverables = deliverables.filter(del =>
    del.application.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    del.application.campaign.brand.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      approved: {
        variant: 'success',
        icon: CheckCircle,
        label: 'Approved',
      },
      in_review: {
        variant: 'warning',
        icon: Clock,
        label: 'In Review',
      },
      pending: {
        variant: 'secondary',
        icon: Upload,
        label: 'Pending Upload',
      },
      rejected: {
        variant: 'destructive',
        icon: XCircle,
        label: 'Rejected',
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const handleUpload = (deliverableId: number) => {
    toast.success('Deliverable upload initiated');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            My <span className="text-foreground">Deliverables</span>
          </h1>
          <p className="text-muted-foreground">
            Manage and track your campaign deliverables.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search deliverables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          {filteredDeliverables.map((deliverable, index) => {
            const statusConfig = getStatusConfig(deliverable.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={deliverable.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="lift transition-all duration-200 ease-soft">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-2xl flex-shrink-0">
                          {deliverable.application.campaign.brand.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">
                            {deliverable.application.campaign.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            @{deliverable.application.campaign.brand.username}
                          </p>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                              <span className="font-medium">Type:</span> {deliverable.deliverable_type}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">Submitted:</span>{' '}
                              {new Date(deliverable.submitted_at).toLocaleDateString()}
                            </p>
                            {deliverable.link && (
                              <a
                                href={deliverable.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Content
                              </a>
                            )}
                            {deliverable.feedback && (
                              <div className="mt-2 p-3 rounded-lg bg-muted/50">
                                <p className="text-xs font-medium mb-1">Feedback:</p>
                                <p className="text-sm">{deliverable.feedback}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-3">
                        <Badge variant={statusConfig.variant as any} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>

                        {deliverable.status === 'pending' && (
                          <Button
                            size="sm"
                            className="bg-primary"
                            onClick={() => handleUpload(deliverable.id)}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Upload Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredDeliverables.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">
              No deliverables found.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Deliverables;
