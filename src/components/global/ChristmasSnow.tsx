import React from 'react';
import { useChristmas } from '../../context/ChristmasContext';

export const ChristmasSnow: React.FC = () => {
  const { isChristmasMode } = useChristmas();

  if (!isChristmasMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <style>{`
        @keyframes snow {
          0% {
            transform: translateY(-10px) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(100px);
            opacity: 0.3;
          }
        }
        .snowflake {
          position: absolute;
          top: -10px;
          color: white;
          font-size: 1em;
          animation-name: snow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .snowflake:nth-child(1) { left: 10%; animation-duration: 10s; animation-delay: 0s; }
        .snowflake:nth-child(2) { left: 20%; animation-duration: 6s; animation-delay: 1s; }
        .snowflake:nth-child(3) { left: 30%; animation-duration: 8s; animation-delay: 2s; }
        .snowflake:nth-child(4) { left: 40%; animation-duration: 7s; animation-delay: 0s; }
        .snowflake:nth-child(5) { left: 50%; animation-duration: 9s; animation-delay: 3s; }
        .snowflake:nth-child(6) { left: 60%; animation-duration: 6s; animation-delay: 1s; }
        .snowflake:nth-child(7) { left: 70%; animation-duration: 8s; animation-delay: 2s; }
        .snowflake:nth-child(8) { left: 80%; animation-duration: 7s; animation-delay: 0s; }
        .snowflake:nth-child(9) { left: 90%; animation-duration: 9s; animation-delay: 3s; }
        .snowflake:nth-child(10) { left: 25%; animation-duration: 11s; animation-delay: 4s; }
        .snowflake:nth-child(11) { left: 65%; animation-duration: 12s; animation-delay: 5s; }

        /* More snowflakes generated via JS would be better, but this is a simple CSS-only start */
        /* Let's generate a bunch with a map */
      `}</style>
      {Array.from({ length: 50 }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          animationDuration: `${5 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 5}s`,
          fontSize: `${0.5 + Math.random()}em`,
          opacity: Math.random()
        };
        return (
          <div key={i} className="snowflake" style={style}>
            ❄
          </div>
        );
      })}
    </div>
  );
};
