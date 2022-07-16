/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// https://lit.dev/docs/tools/production/#modern-only-build

import path from 'path';
import summary from 'rollup-plugin-summary';
import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import {copy} from '@web/rollup-plugin-copy';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import replace from '@rollup/plugin-replace';

// Should minify output
const shouldMinify = false;

export default {
  input: 'components',
  preserveEntrySignatures: 'strict',
  output: {
    file: 'dist/dist.js',
    sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
      // will replace relative paths with absolute paths
      return path.resolve(path.dirname(sourcemapPath), relativeSourcePath);
    },
    sourcemap: shouldMinify,
    format: 'esm',
  },
  plugins: [
    replace({
      'Reflect.decorate': 'undefined',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    // Resolve bare module specifiers to relative paths
    resolve(),

    // Minify HTML template literals
    shouldMinify && minifyHTML(),
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),

    // Print bundle summary
    summary({ showGzippedSize: true }),

    // Optional: copy any static assets to build directory
    copy({
      patterns: ['images/**/*'],
    }),
  ],
};
