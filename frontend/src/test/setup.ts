import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// API configurada: en las pruebas `api` usa el cliente HTTP, no el modo demo.
window.__ENV = {
  VITE_API_URL: 'https://test-api.example.com/Prod',
};

globalThis.fetch = vi.fn();
