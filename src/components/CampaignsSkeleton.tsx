import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const FloatingOrb = ({ 
  className, 
  delay = 0 
}: { 
  className?: string; 
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [0.2, 0.4, 0.2],
      scale: [1, 1.1, 1],
      y: [0, -20, 0]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  />
);

const CampaignsSkeleton = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <FloatingOrb 
        className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" 
        delay={0}
      />
      <FloatingOrb 
        className="absolute bottom-40 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" 
        delay={2}
      />
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-10 w-64 mb-3" />
                <Skeleton className="h-5 w-80" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Search Bar Skeleton */}
          <Card className="mb-6 glass border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="h-10 w-full md:w-48" />
                <Skeleton className="h-10 w-full md:w-48" />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full glass border-border/50">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="w-14 h-14 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-28 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsSkeleton;
