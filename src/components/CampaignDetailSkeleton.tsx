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

const CampaignDetailSkeleton = () => {
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
          {/* Back Button Skeleton */}
          <Skeleton className="h-10 w-40 mb-6" />

          {/* Header Card Skeleton */}
          <Card className="glass border-border/50 mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-5 w-full max-w-xl" />
                  <Skeleton className="h-5 w-3/4 mt-2" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="glass border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-16 mb-2" />
                            <Skeleton className="h-6 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>

          {/* Tabs Skeleton */}
          <Skeleton className="h-10 w-80 mb-6" />

          {/* Content Card Skeleton */}
          <Card className="glass border-border/50">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-32 mb-3" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailSkeleton;
