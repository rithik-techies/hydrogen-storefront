import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    tailwindcss(),
    hydrogen(),
    oxygen(),
    reactRouter({ ssr: true }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    ssr: true,
    rollupOptions: {
      input: './server.js',
      output: {
        entryFileNames: 'server/index.js',
      },
    },
  },
  ssr: {
    noExternal: [
      '@shopify/hydrogen',
      '@shopify/remix-oxygen',
      '@shopify/mini-oxygen',
    ],
  },
  optimizeDeps: {
    exclude: ['./app/entry.server.jsx'],
  },
});




// import {defineConfig} from 'vite';
// import {hydrogen} from '@shopify/hydrogen/vite';
// import {oxygen} from '@shopify/mini-oxygen/vite';
// import {reactRouter} from '@react-router/dev/vite';
// import tsconfigPaths from 'vite-tsconfig-paths';
// import tailwindcss from '@tailwindcss/vite';

// export default defineConfig({
//   plugins: [
//     tailwindcss(),
//     hydrogen(),
//     oxygen(),
//     reactRouter(),
//     tsconfigPaths(),
//   ],
//   build: {
//     // Allow a strict Content-Security-Policy
//     // withtout inlining assets as base64:
//     assetsInlineLimit: 0,
//   },
//   ssr: {
//     optimizeDeps: {
//       /**
//        * Include dependencies here if they throw CJS<>ESM errors.
//        * For example, for the following error:
//        *
//        * > ReferenceError: module is not defined
//        * >   at /Users/.../node_modules/example-dep/index.js:1:1
//        *
//        * Include 'example-dep' in the array below.
//        * @see https://vitejs.dev/config/dep-optimization-options
//        */
//       include: [],
//     },
//   },
// });
