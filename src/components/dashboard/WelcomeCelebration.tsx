import { useEffect, useState, useRef } from "react";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  userName: string;
  onDismiss: () => void;
}

function createConfettiPiece(container: HTMLDivElement) {
  const colors = ["#B8860B", "#DAA520", "#FFD700", "#CD853F", "#F5DEB3", "#fff"];
  const piece = document.createElement("div");
  const size = Math.random() * 8 + 4;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = Math.random() * 2 + 2;
  const rotation = Math.random() * 720 - 360;

  piece.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size * 0.6}px;
    background: ${color};
    left: ${left}%;
    top: -10px;
    border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
    opacity: 0.9;
    animation: confetti-fall ${duration}s ease-in ${delay}s forwards;
    transform: rotate(${rotation}deg);
  `;
  container.appendChild(piece);
}

export function WelcomeCelebration({ userName, onDismiss }: Props) {
  const [visible, setVisible] = useState(true);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confettiRef.current) return;
    const container = confettiRef.current;
    for (let i = 0; i < 80; i++) {
      createConfettiPiece(container);
    }
    const timer = setTimeout(() => {
      container.innerHTML = "";
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      {/* Confetti layer */}
      <div
        ref={confettiRef}
        className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      />

      {/* Modal overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center animate-in zoom-in-95 fade-in duration-300">
          <button
            onClick={() => { setVisible(false); onDismiss(); }}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
            You're Registered!
          </h2>

          <p className="text-lg text-muted-foreground mb-2">
            Congratulations, {userName.split(" ")[0]}!
          </p>

          <p className="text-muted-foreground mb-8">
            You're now officially registered for the{" "}
            <span className="text-primary font-semibold">2026 Veteran Podcast Awards</span>.
            We can't wait to see your podcast shine.
          </p>

          <Button
            variant="gold"
            size="lg"
            className="w-full h-12 text-base"
            onClick={() => { setVisible(false); onDismiss(); }}
          >
            Let's Go!
          </Button>
        </div>
      </div>
    </>
  );
}
