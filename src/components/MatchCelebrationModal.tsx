import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PartyPopper, Sparkles, Mail, X, ArrowRight, CheckCircle } from 'lucide-react';
import Confetti from './Confetti';

interface MatchCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  brandEmail: string;
  campaignTitle: string;
}

const MatchCelebrationModal = ({
  isOpen,
  onClose,
  brandName,
  brandEmail,
  campaignTitle,
}: MatchCelebrationModalProps) => {
  const mailtoLink = `mailto:${brandEmail}?subject=Campaign: ${encodeURIComponent(campaignTitle)} - Collaboration Kickoff`;

  const handleSendEmail = () => {
    window.open(mailtoLink, '_blank');
    onClose();
  };

  return (
    <>
      <Confetti isActive={isOpen} duration={4000} />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0 overflow-visible">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-3xl" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/20 to-transparent rounded-tr-full" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors z-10"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Animated icons */}
              <div className="flex justify-center gap-3 mb-6">
                <motion.div
                  animate={{
                    rotate: [-10, 10, -10],
                    y: [0, -5, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
                >
                  <PartyPopper className="h-7 w-7 text-white" />
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="h-7 w-7 text-white" />
                </motion.div>
                <motion.div
                  animate={{
                    rotate: [10, -10, 10],
                    y: [0, -5, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
                >
                  <CheckCircle className="h-7 w-7 text-white" />
                </motion.div>
              </div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold mb-2"
              >
                It's a Match! 🎉
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground mb-6"
              >
                <span className="font-semibold text-foreground">{brandName}</span> wants to work with you!
              </motion.p>

              {/* Next steps */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-muted/50 rounded-2xl p-4 mb-6 text-left"
              >
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Next Steps
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Email the brand at <strong className="text-foreground">{brandEmail}</strong> to confirm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Review the campaign brief again</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Prepare your content concept</span>
                  </li>
                </ul>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  onClick={handleSendEmail}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white h-12 text-base group"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send Introduction Email
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 text-base border-border/50 hover:bg-muted/50"
                >
                  Close
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchCelebrationModal;
