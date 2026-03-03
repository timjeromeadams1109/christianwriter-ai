declare module "@stack/core" {
  export interface CircuitBreakerConfig {
    name?: string;
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    volumeThreshold?: number;
    rollingCountTimeout?: number;
    rollingCountBuckets?: number;
    fallback?: (...args: any[]) => any;
  }

  export class ServiceCircuitBreaker<T extends unknown[] = unknown[], R = unknown> {
    fire(...args: T): Promise<R>;
    isOpen(): boolean;
    getStats(): any;
  }

  export function createCircuitBreaker<T extends unknown[], R>(
    name: string,
    action: (...args: T) => Promise<R>,
    options?: Partial<CircuitBreakerConfig>
  ): ServiceCircuitBreaker<T, R>;

  export interface StackConfig {
    redis?: { host: string; port: number; password?: string };
    circuitBreaker?: Partial<CircuitBreakerConfig>;
  }

  export class Stack {
    constructor(config: StackConfig);
    createCircuitBreaker<T extends unknown[], R>(
      name: string,
      action: (...args: T) => Promise<R>,
      options?: Partial<CircuitBreakerConfig>
    ): ServiceCircuitBreaker<T, R>;
  }

  export function createStack(config?: StackConfig): Stack;
  export type ResilientQueue = any;
}
