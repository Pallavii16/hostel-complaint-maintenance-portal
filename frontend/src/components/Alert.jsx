import { useEffect, useRef } from 'react';

const Alert = ({ type = 'info', message, onClose, autoScroll = true }) => {
  const alertRef = useRef(null);

  useEffect(() => {
    if (message && autoScroll) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (alertRef.current) {
          // Get the alert's position relative to viewport
          const rect = alertRef.current.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.top < window.innerHeight - 100;
          
          // If alert is not visible (user has scrolled down), scroll to top of page
          // Otherwise, scroll to show the alert
          if (!isVisible) {
            window.scrollTo({ 
              top: 0, 
              behavior: 'smooth' 
            });
          } else {
            // Scroll to alert with some offset from top
            const offset = 80; // Account for sticky header
            const elementPosition = rect.top + window.pageYOffset;
            window.scrollTo({ 
              top: elementPosition - offset, 
              behavior: 'smooth' 
            });
          }
        } else {
          // Fallback: scroll to top if ref not available
          window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          });
        }
      }, 150);
    }
  }, [message, autoScroll]);

  if (!message) return null;

  return (
    <div ref={alertRef} className={`alert ${type}`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-close" aria-label="Dismiss message" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;

