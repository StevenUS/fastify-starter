/**
 * This file contains global TypeScript declarations and ambient type
 * augmentations that apply project-wide.
 *
 * Examples include:
 * - Extending built-in interfaces like ImportMeta
 * - Declaring global types or modules
 * - Adding typings for runtime features not yet recognized by TypeScript
 *
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html#global-augmentation
 */

export {}; // needed to make this a module

declare global {
  interface ImportMeta {
    // https://nodejs.org/api/esm.html#importmetamain
    main?: boolean;
  }
}
