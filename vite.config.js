import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	server: { allowedHosts: ["calum07.zapus-monitor.ts.net"] },
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
		legacy({
			targets: ["defaults", "ios >= 12"],
		}),
	],
	define: {
		BUILD_TIME: JSON.stringify(new Date().toISOString()),
	},
});
