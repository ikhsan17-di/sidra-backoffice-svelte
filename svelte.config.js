import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),

		alias: {
			$lib: 'src/lib',
		},

		vite: {
			server: {
				proxy: {
					'/api': {
						target: 'http://localhost:8080',
						changeOrigin: true,
						rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
					},
				},
			},
		},
	},
}

export default config
