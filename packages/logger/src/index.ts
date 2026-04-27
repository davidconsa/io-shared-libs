/**
 * ILogger — puerto de logging estructurado.
 * Los paquetes consumen esta interfaz, nunca una implementación concreta.
 * Implementación completa pendiente para Fase 2 del roadmap.
 */
export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/**
 * Logger no-op — útil como valor por defecto en tests
 * y como placeholder hasta tener la implementación real.
 */
export const noopLogger: ILogger = {
  debug: () => undefined,
  info:  () => undefined,
  warn:  () => undefined,
  error: () => undefined,
};
