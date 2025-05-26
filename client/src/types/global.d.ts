declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: string | Element, parameters: unknown) => void;
      reset: () => void;
    };
  }
}

export {};