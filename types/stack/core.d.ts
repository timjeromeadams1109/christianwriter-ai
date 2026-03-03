declare module '@stack/core' {
  export function createStack(config?: any): any;
  export function createCircuitBreaker(config?: any): any;
  export type Stack = any;
  export type ServiceCircuitBreaker = any;
  export type ResilientQueue = any;
}
