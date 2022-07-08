/**
 * Object Utilities
 */

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export const deepUpdate: <T>(partial: DeepPartial<T>, obj: T) => T =
  <T>(partial: DeepPartial<T>, obj: T): T =>
    Object.keys(partial).reduce((acc: T, curr) => ({
      ...acc,
      // @ts-ignore
      [curr]: typeof partial[curr] === 'object'
        // @ts-ignore
        ? deepUpdate(partial[curr], typeof acc[curr] === 'object' ? acc[curr] : {})
        // @ts-ignore
        : partial[curr],
    }), obj);
