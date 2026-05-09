// Shim for "server-only" package — vitest runs in Node, not in a Next.js
// bundler context, so this package would throw. Replace it with a no-op.
export {};
