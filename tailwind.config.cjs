/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography"),require("daisyui")],
	daisyui: {
		themes: [{ portfolio: {
			"primary": "#0d2a1c", "primary-content": "#f7f7f7",
			"secondary": "#e3e9e4", "secondary-content": "#0d2a1c",
			"accent": "#f6e016", "accent-content": "#0d2a1c",
			"neutral": "#0d2a1c", "neutral-content": "#f7f7f7",
			"base-100": "#f7f7f7", "base-200": "#ebeeeb", "base-300": "#d7dfd8", "base-content": "#0d2a1c",
			"info": "#3a6470", "success": "#3c6d46", "warning": "#e7ce48", "error": "#b24242",
			"--rounded-box": "0.25rem", "--rounded-btn": "0rem", "--rounded-badge": "0rem", "--btn-text-case": "none"
		} }],
		darkTheme: "dark", // name of one of the included themes for dark mode
		logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
	  }
}
