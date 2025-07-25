// Test setup for vitest
import { vi } from 'vitest';

// Mock GSAP
vi.mock('gsap', () => ({
	gsap: {
		timeline: vi.fn(() => ({
			to: vi.fn(() => ({
				onUpdate: vi.fn(),
				onComplete: vi.fn()
			})),
			kill: vi.fn(),
			progress: vi.fn(() => 0)
		}))
	}
}));

// Mock window.requestAnimationFrame
(window as any).requestAnimationFrame = vi.fn((cb: any) => setTimeout(cb, 16)); 