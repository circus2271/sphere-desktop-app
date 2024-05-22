import { defineConfig, mergeConfig } from 'vite';
import {
  getBuildConfig,
  getBuildDefine,
  external,
  pluginHotRestart,
} from './vite.base.config.mjs';
import commonjs from '@rollup/plugin-commonjs';

// import { viteStaticCopy } from 'vite-plugin-static-copy'
// import path from 'path';


// https://vitejs.dev/config
export default defineConfig((env) => {
  /** @type {import('vite').ConfigEnv<'build'>} */
  const forgeEnv = env;
  const { forgeConfigSelf } = forgeEnv;
  const define = getBuildDefine(forgeEnv);
  const config = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry,
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external,
      },
    },
    plugins: [
      commonjs(),

      // viteStaticCopy({
      //   targets: [
      //     {
      //       // src: 'helpers',
      //       src: path.join(__dirname, 'src/helpers/index.js'),
      //       dest: 'helpers'
      //     }
      //   ]
      // }),
        pluginHotRestart('restart'),

    ],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});
