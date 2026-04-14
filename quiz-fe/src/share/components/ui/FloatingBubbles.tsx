"use client";
import React from 'react';

interface FloatingBubblesProps {
  className?: string;
}

export default function FloatingBubbles({ className = "" }: FloatingBubblesProps) {
  return (
    <svg className={`w-full h-full ${className}`} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bubble1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(200, 139, 255, 0.8)" />
          <stop offset="100%" stopColor="rgba(139, 192, 255, 0.6)" />
        </linearGradient>
        <linearGradient id="bubble2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 200, 139, 0.7)" />
          <stop offset="100%" stopColor="rgba(255, 139, 192, 0.5)" />
        </linearGradient>
        <linearGradient id="bubble3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(139, 255, 200, 0.6)" />
          <stop offset="100%" stopColor="rgba(192, 255, 139, 0.4)" />
        </linearGradient>
      </defs>
      
      {/* Bubble 1 */}
      <circle 
        cx="20" 
        cy="80" 
        r="8" 
        fill="url(#bubble1)"
        style={{
          transformOrigin: "20px 80px",
          animation: "float1 6s ease-in-out infinite"
        }}
      />
      
      {/* Bubble 2 */}
      <circle 
        cx="85" 
        cy="75" 
        r="6" 
        fill="url(#bubble2)"
        style={{
          transformOrigin: "85px 75px",
          animation: "float2 8s ease-in-out infinite 2s"
        }}
      />
      
      {/* Bubble 3 */}
      <circle 
        cx="65" 
        cy="45" 
        r="10" 
        fill="url(#bubble3)"
        style={{
          transformOrigin: "65px 45px",
          animation: "float3 7s ease-in-out infinite 1s"
        }}
      />
      
      {/* Bubble 4 */}
      <circle 
        cx="30" 
        cy="25" 
        r="4" 
        fill="url(#bubble1)"
        opacity="0.7"
        style={{
          transformOrigin: "30px 25px",
          animation: "float4 5s ease-in-out infinite 3s"
        }}
      />
      
      {/* Bubble 5 */}
      <circle 
        cx="90" 
        cy="20" 
        r="7" 
        fill="url(#bubble2)"
        opacity="0.6"
        style={{
          transformOrigin: "90px 20px",
          animation: "float5 9s ease-in-out infinite 1.5s"
        }}
      />
      
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(5px, -10px) scale(1.1); }
          50% { transform: translate(-3px, -15px) scale(0.9); }
          75% { transform: translate(8px, -5px) scale(1.05); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          30% { transform: translate(-8px, -12px) scale(1.2); }
          60% { transform: translate(4px, -8px) scale(0.8); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(-6px, 8px) scale(1.15); }
          40% { transform: translate(10px, -6px) scale(0.85); }
          80% { transform: translate(-4px, 12px) scale(1.1); }
        }
        
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          35% { transform: translate(12px, -8px) scale(1.3); }
          70% { transform: translate(-5px, 6px) scale(0.7); }
        }
        
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-10px, 15px) scale(1.1); }
          50% { transform: translate(6px, -10px) scale(0.9); }
          75% { transform: translate(-8px, 5px) scale(1.2); }
        }
      `}</style>
    </svg>
  );
}
