import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  '#FFD700', // Gold
  '#FF69B4', // Pink
  '#00CED1', // Cyan
  '#FF6347', // Coral
];

const Confetti = ({ isActive, duration = 3000 }: { isActive: boolean; duration?: number }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: `${piece.x}vw`,
              y: -20,
              rotate: 0,
              scale: piece.scale,
            }}
            animate={{
              y: '110vh',
              rotate: piece.rotation + 720,
              x: `${piece.x + (Math.random() - 0.5) * 20}vw`,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2.5 + Math.random(),
              delay: piece.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Confetti;
