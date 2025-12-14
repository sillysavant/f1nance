// jsdom does not implement matchMedia → provide a minimal mock
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {}, // deprecated API used by some libs
    removeListener: () => {}, // deprecated API
    dispatchEvent: () => false,
  }),
});
