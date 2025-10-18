import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    page: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  // Send to backend
  if (navigator.sendBeacon) {
    navigator.sendBeacon(`${BACKEND_URL}/api/analytics/web-vitals`, body);
  } else {
    fetch(`${BACKEND_URL}/api/analytics/web-vitals`, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(console.error);
  }

  // Also send to Yandex.Metrika if available
  if (window.ym) {
    window.ym(45908091, 'params', {
      webVitals: {
        [metric.name]: metric.value
      }
    });
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics);  // Cumulative Layout Shift
  onFID(sendToAnalytics);  // First Input Delay
  onFCP(sendToAnalytics);  // First Contentful Paint
  onLCP(sendToAnalytics);  // Largest Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}
