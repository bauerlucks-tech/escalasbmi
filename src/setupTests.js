import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
global.ResizeObserver = () => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
});

// Mock IntersectionObserver
global.IntersectionObserver = () => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
});
