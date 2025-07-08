import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			preprocess: vitePreprocess(),
		}),
		VitePWA({
			workbox: {
				runtimeCaching: [
					{
						urlPattern:
							/^https:\/\/((rsms\.me|cdnjs\.cloudflare\.com|unpkg\.com\/boxicons@.*?)\/.*|.*\.github\.io\/.*\.js)/i,
						handler: "CacheFirst",
						options: {
							cacheName: "runtime-cache",
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
				skipWaiting: true,
			},
			manifest: {
				name: "miq",
				short_name: "miq",
				description: "Preview and fire mic cues from Google Sheets",
				theme_color: "#000000",
				icons: [
					{
						src: "/favicon.png",
						sizes: "192x192",
						type: "image/png",
					},
				],
				display: "standalone",
				start_url: "/",
			},
		}),
		legacy({ targets: ["defaults", "not IE 11"] }),
	],
});
