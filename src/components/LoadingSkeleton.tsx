import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background mesh */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      {/* Floating orbs with pulse animation */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-3xl bg-primary/10 top-20 -left-20"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl bg-accent/10 bottom-20 -right-20"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Branded logo with pulse and glow animation */}
        <motion.div
          className="relative mb-8"
          animate={{ 
            scale: [1, 1.08, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Glow effect behind logo */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Logo image */}
          <motion.img
            src={logo}
            alt="FameSync"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain relative z-10 drop-shadow-lg"
            animate={{ 
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Animated loading dots */}
        <div className="flex items-center gap-2 mb-6">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 rounded-full bg-primary"
              animate={{ 
                y: [0, -12, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Skeleton content blocks */}
        <div className="w-full max-w-md space-y-4">
          <motion.div 
            className="h-8 bg-muted/50 rounded-xl mx-auto w-3/4"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="h-4 bg-muted/30 rounded-lg mx-auto w-1/2"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
        </div>

        {/* Bottom skeleton cards */}
        <div className="mt-12 flex gap-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-muted/20 border border-border/30"
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
                scale: [0.98, 1, 0.98]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
