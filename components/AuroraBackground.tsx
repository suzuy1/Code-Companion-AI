import React from 'react';

const AuroraBackground: React.FC = () => {
  return (
    <>
      <div
        className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          <div className="aurora-container">
            <div className="aurora-item" style={{ '--aurora-color': 'hsl(0, 0%, 15%)' } as React.CSSProperties}></div>
            <div className="aurora-item" style={{ '--aurora-color': 'hsl(0, 0%, 25%)' } as React.CSSProperties}></div>
            <div className="aurora-item" style={{ '--aurora-color': 'hsl(0, 0%, 10%)' } as React.CSSProperties}></div>
            <div className="aurora-item" style={{ '--aurora-color': 'hsl(0, 0%, 20%)' } as React.CSSProperties}></div>
          </div>
        </div>
      </div>
      <style>{`
        .aurora-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150vw;
          height: 150vh;
          filter: blur(80px) saturate(0.5);
          opacity: 0.1;
        }

        .aurora-item {
          position: absolute;
          border-radius: 50%;
          background: var(--aurora-color);
          animation: aurora-animation 30s infinite alternate;
        }

        .aurora-item:nth-child(1) {
          width: 40vw;
          height: 40vw;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .aurora-item:nth-child(2) {
          width: 35vw;
          height: 35vw;
          top: 20%;
          left: 60%;
          animation-delay: -7s;
        }

        .aurora-item:nth-child(3) {
          width: 30vw;
          height: 30vw;
          top: 60%;
          left: 5%;
          animation-delay: -15s;
        }
        
        .aurora-item:nth-child(4) {
          width: 38vw;
          height: 38vw;
          top: 55%;
          left: 55%;
          animation-delay: -4s;
        }

        @keyframes aurora-animation {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(calc(var(--aurora-color-x, 10vw)), calc(var(--aurora-color-y, 20vh))) scale(1.2);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default AuroraBackground;