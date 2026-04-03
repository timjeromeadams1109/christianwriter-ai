/**
 * Ambient type declarations for @stack/core
 *
 * The package builds its dist/ via a `prepare` script. In CI environments
 * where `bun install` installs from a GitHub dependency, the prepare script
 * may not execute, leaving dist/index.d.ts absent. These declarations ensure
 * TypeScript always resolves the module regardless of build state.
 *
 * Keep in sync with: node_modules/@stack/core/dist/
 */

declare module '@stack/core' {
  export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

  export interface CircuitBreakerConfig {
    name?: string
    timeout?: number
    errorThreshold?: number
    volumeThreshold?: number
    resetTimeout?: number
    fallback?: <T>() => T | Promise<T>
  }

  export interface CircuitStats {
    state: CircuitState
    failures: number
    successes: number
    rejects: number
    fallbacks: number
    latencyMean: number
    lastFailure?: Date
    lastSuccess?: Date
  }

  export declare class ServiceCircuitBreaker<T extends unknown[], R> {
    fire(...args: T): Promise<R>
    getState(): CircuitState
    getStats(): CircuitStats
    open(): void
    close(): void
    isHealthy(): boolean
  }

  export function createCircuitBreaker<T extends unknown[], R>(
    name: string,
    action: (...args: T) => Promise<R>,
    options?: Partial<CircuitBreakerConfig>
  ): ServiceCircuitBreaker<T, R>
}
