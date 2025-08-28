/**
 * Analytics Setup for PM-Focused Landing Page Experiment
 * 
 * This file contains all the analytics tracking configuration and helper functions
 * for the A/B test experiment targeting Product Managers.
 */

// Analytics Configuration
const ANALYTICS_CONFIG = {
  // Experiment details
  experimentName: 'pm_landing_conversion_test',
  variants: {
    control: 'landing_control_v1',
    variantB: 'landing_headline_cta_v1', 
    variantC: 'landing_role_targeted_v1'
  },
  
  // Traffic allocation (percentages)
  trafficAllocation: {
    control: 33,
    variantB: 33,
    variantC: 34
  },

  // Minimum sample size per variant for statistical significance
  minSampleSize: 1000,
  
  // Significance level
  significanceLevel: 0.05
};

// Event Names - Standardized across all variants
const EVENTS = {
  // Primary conversion events
  HERO_CTA_CLICK: 'hero_cta_click',
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  TRIAL_ACTIVATED: 'trial_activated',
  
  // Variant C specific events
  ROLE_SELECTED: 'role_selected',
  
  // Secondary engagement events
  DEMO_VIDEO_PLAY: 'demo_video_play',
  PRICING_VIEW: 'pricing_view',
  SOCIAL_SIGNIN_CLICK: 'social_signin_click',
  
  // Page events
  PAGE_VIEW: 'page_view',
  PAGE_EXIT: 'page_exit',
  SCROLL_DEPTH: 'scroll_depth'
};

/**
 * Initialize analytics tracking
 * Call this when the page loads
 */
function initializeAnalytics() {
  // Get or assign experiment variant
  const variant = getExperimentVariant();
  
  // Track page view with experiment context
  trackEvent(EVENTS.PAGE_VIEW, {
    experiment_name: ANALYTICS_CONFIG.experimentName,
    variant: variant,
    page_title: document.title,
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });

  // Set up scroll depth tracking
  setupScrollTracking(variant);
  
  // Set up exit intent tracking
  setupExitTracking(variant);
}

/**
 * Get or assign experiment variant for user
 * Uses consistent hashing based on user ID or session
 */
function getExperimentVariant() {
  // Check if variant already assigned in session/localStorage
  let variant = localStorage.getItem('experiment_variant');
  
  if (!variant) {
    // Get user ID or create session ID
    const userId = getUserId() || generateSessionId();
    
    // Use consistent hashing to assign variant
    const hash = simpleHash(userId + ANALYTICS_CONFIG.experimentName);
    const bucket = hash % 100;
    
    if (bucket < ANALYTICS_CONFIG.trafficAllocation.control) {
      variant = 'control';
    } else if (bucket < ANALYTICS_CONFIG.trafficAllocation.control + ANALYTICS_CONFIG.trafficAllocation.variantB) {
      variant = 'variantB';
    } else {
      variant = 'variantC';
    }
    
    // Store variant assignment
    localStorage.setItem('experiment_variant', variant);
  }
  
  return variant;
}

/**
 * Main tracking function - sends events to all configured analytics platforms
 */
function trackEvent(eventName, properties = {}) {
  const baseProperties = {
    experiment_name: ANALYTICS_CONFIG.experimentName,
    variant: getExperimentVariant(),
    timestamp: new Date().toISOString(),
    session_id: getSessionId(),
    page_url: window.location.href
  };
  
  const eventData = { ...baseProperties, ...properties };
  
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, eventData);
  }
  
  // Segment (if available)
  if (typeof analytics !== 'undefined' && analytics.track) {
    analytics.track(eventName, eventData);
  }
  
  // Custom analytics endpoint (if needed)
  sendToCustomAnalytics(eventName, eventData);
  
  // Console log for debugging (remove in production)
  console.log('Analytics Event:', eventName, eventData);
}

/**
 * Track hero CTA clicks with detailed context
 */
function trackHeroCTAClick(ctaText, variant, additionalProps = {}) {
  trackEvent(EVENTS.HERO_CTA_CLICK, {
    cta_text: ctaText,
    variant: variant,
    button_position: 'hero_primary',
    ...additionalProps
  });
}

/**
 * Track signup flow events
 */
function trackSignupStart(email, method = 'email', variant, additionalProps = {}) {
  trackEvent(EVENTS.SIGNUP_START, {
    email: hashEmail(email), // Hash email for privacy
    signup_method: method,
    variant: variant,
    ...additionalProps
  });
}

function trackSignupComplete(email, method = 'email', variant, additionalProps = {}) {
  trackEvent(EVENTS.SIGNUP_COMPLETE, {
    email: hashEmail(email),
    signup_method: method,
    variant: variant,
    conversion_time: getTimeOnPage(),
    ...additionalProps
  });
}

/**
 * Track role selection (Variant C only)
 */
function trackRoleSelection(role, variant) {
  trackEvent(EVENTS.ROLE_SELECTED, {
    role: role,
    variant: variant,
    selection_time: getTimeOnPage()
  });
}

/**
 * Set up scroll depth tracking
 */
function setupScrollTracking(variant) {
  const scrollThresholds = [25, 50, 75, 90];
  const trackedThresholds = new Set();
  
  function handleScroll() {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    scrollThresholds.forEach(threshold => {
      if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
        trackedThresholds.add(threshold);
        trackEvent(EVENTS.SCROLL_DEPTH, {
          scroll_depth: threshold,
          variant: variant
        });
      }
    });
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Set up exit intent tracking
 */
function setupExitTracking(variant) {
  let exitTracked = false;
  
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0 && !exitTracked) {
      exitTracked = true;
      trackEvent(EVENTS.PAGE_EXIT, {
        exit_type: 'mouse_leave',
        time_on_page: getTimeOnPage(),
        variant: variant
      });
    }
  });
  
  window.addEventListener('beforeunload', function() {
    if (!exitTracked) {
      trackEvent(EVENTS.PAGE_EXIT, {
        exit_type: 'page_unload',
        time_on_page: getTimeOnPage(),
        variant: variant
      });
    }
  });
}

/**
 * Utility functions
 */
function getUserId() {
  // Try to get user ID from your auth system
  // Return null if not available
  return null;
}

function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function getSessionId() {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function hashEmail(email) {
  // Simple hash for privacy - use a proper hashing library in production
  return simpleHash(email).toString();
}

function getTimeOnPage() {
  const startTime = sessionStorage.getItem('page_start_time');
  if (startTime) {
    return Date.now() - parseInt(startTime);
  }
  return 0;
}

function sendToCustomAnalytics(eventName, eventData) {
  // Send to your custom analytics endpoint if needed
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ event: eventName, data: eventData })
  // }).catch(console.error);
}

// Initialize page start time
sessionStorage.setItem('page_start_time', Date.now().toString());

// Export for use in React components
window.experimentAnalytics = {
  initializeAnalytics,
  trackEvent,
  trackHeroCTAClick,
  trackSignupStart,
  trackSignupComplete,
  trackRoleSelection,
  getExperimentVariant,
  EVENTS,
  ANALYTICS_CONFIG
};

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
  initializeAnalytics();
}
