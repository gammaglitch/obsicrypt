import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import path = require('path');

export default defineConfig({
	plugins: [preact()],
	build: {
		outDir: './build',
		sourcemap: 'hidden',
	},
	resolve: {
		alias: {
			react: 'preact/compat',
			'react-dom/test-utils': 'preact/test-utils',
			'react-dom': 'preact/compat',
			'react/jsx-runtime': 'preact/jsx-runtime',
			'@': path.resolve(__dirname, './src'),
		},
	},
});
