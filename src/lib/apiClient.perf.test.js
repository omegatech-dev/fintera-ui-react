import { describe, it, vi, beforeEach, expect } from 'vitest';
import { request, setAuthToken } from './apiClient';

// Mock window.fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'success' }),
        text: () => Promise.resolve('{"data": "success"}'),
    })
);

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('apiClient Performance Benchmark', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('token', 'benchmark-token-value');
    });

    it('measures request performance with localStorage access', async () => {
        // Ensure authToken is null for baseline
        setAuthToken(null);
        const iterations = 50000;
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            await request('/test-endpoint');
        }

        const end = performance.now();
        const duration = end - start;
        console.log(`[Baseline] ${iterations} requests took ${duration.toFixed(2)}ms`);
        console.log(`[Baseline] Average per request: ${(duration / iterations).toFixed(4)}ms`);

        // Ensure localStorage was NOT called
        expect(localStorage.getItem).not.toHaveBeenCalled();
    });

    it('measures request performance with optimized in-memory token', async () => {
        setAuthToken('benchmark-token-value');
        const iterations = 50000;
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            await request('/test-endpoint');
        }

        const end = performance.now();
        const duration = end - start;
        console.log(`[Optimized] ${iterations} requests took ${duration.toFixed(2)}ms`);
        console.log(`[Optimized] Average per request: ${(duration / iterations).toFixed(4)}ms`);

        // Ensure localStorage was NOT called (short-circuited)
        expect(localStorage.getItem).not.toHaveBeenCalled();
    });
});
