import {defineConfig} from 'vite';
import {svelte, vitePreprocess} from '@sveltejs/vite-plugin-svelte';
import {version} from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
    base: '',
    plugins: [
        svelte({
            preprocess: vitePreprocess(),
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                assetFileNames: `css/[name]-v${version}.[ext]`,
                entryFileNames: `js/[name]-v${version}.js`,
                dir: './dist',
            },
        },
    },
});
