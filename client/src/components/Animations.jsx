import React from 'react';

// Fade In Animation
export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 500, 
  className = '' 
}) => {
  return (
    <div 
      className={`animate-fade-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Slide In from Bottom
export const SlideInUp = ({ 
  children, 
  delay = 0, 
  duration = 500, 
  className = '' 
}) => {
  return (
    <div 
      className={`animate-slide-up ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Slide In from Left
export const SlideInLeft = ({ 
  children, 
  delay = 0, 
  duration = 500, 
  className = '' 
}) => {
  return (
    <div 
      className={`animate-slide-left ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Scale In Animation
export const ScaleIn = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  className = '' 
}) => {
  return (
    <div 
      className={`animate-scale-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Stagger Animation for Lists
export const StaggeredList = ({ children, staggerDelay = 100 }) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * staggerDelay} key={index}>
          {child}
        </FadeIn>
      ))}
    </>
  );
};

// Hover Scale Effect
export const HoverScale = ({ children, scale = 1.05, className = '' }) => {
  return (
    <div className={`transition-transform duration-200 hover:scale-${scale === 1.05 ? '105' : '110'} ${className}`}>
      {children}
    </div>
  );
};

// Bounce Animation for Buttons
export const BounceButton = ({ children, onClick, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`transition-all duration-150 hover:scale-105 active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
