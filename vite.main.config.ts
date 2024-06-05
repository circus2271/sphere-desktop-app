import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';
import { getBuildConfig, getBuildDefine, external, pluginHotRestart } from './vite.base.config';
import { checker } from "vite-plugin-checker";

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>;
  const { forgeConfigSelf } = forgeEnv;
  const define = getBuildDefine(forgeEnv);
  const config: UserConfig = {
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external,
      },
    },
    plugins: [
      // checker({ typescript: true /** or an object config */ }),
        pluginHotRestart('restart'),
        // customized plugin
        // https://vite-plugin-checker.netlify.app/checkers/typescript.html
      // checker({ typescript: true /** or an object config */ })
    ],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
    // customized
    optimizeDeps: {
      include: ['electron-devtools-installer']
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  };

  return mergeConfig(getBuildConfig(forgeEnv), config);
});
