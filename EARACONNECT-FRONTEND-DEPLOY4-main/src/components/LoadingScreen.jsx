import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)'
    }}>
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="mb-8">
          <div className="relative">
            <div 
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%)',
                boxShadow: 'var(--shadow-xl)',
                animation: 'pulse 2s infinite'
              }}
            >
              <span className="text-3xl text-white">🏛️</span>
            </div>
            <div 
              className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-transparent"
              style={{
                borderTopColor: 'var(--primary-400)',
                animation: 'spin 1.5s linear infinite'
              }}
            ></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            EAC Secretary Portal
          </h2>
          <p className="text-lg" style={{color: 'var(--gray-600)'}}>
            {message}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: 'var(--primary-400)',
                animation: `bounce 1.4s infinite ${index * 0.2}s`
              }}
            ></div>
          ))}
        </div>

        {/* Subtle Footer */}
        <div className="mt-12">
          <p className="text-sm" style={{color: 'var(--gray-500)'}}>
            East African Community Connect
          </p>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: translateY(0);
            opacity: 0.4;
          }
          40% { 
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;