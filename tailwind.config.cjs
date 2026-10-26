/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography"),require("daisyui")],
	daisyui: {
		themes: [{ portfolio: {
			"primary": "#ce3c2b", "primary-content": "#f6f4ee",
			"secondary": "#eae7df", "secondary-content": "#292825",
			"accent": "#ce3c2b", "accent-content": "#f6f4ee",
			"neutral": "#292825", "neutral-content": "#f6f4ee",
			"base-100": "#f6f4ee", "base-200": "#eae7df", "base-300": "#d8d4cb", "base-content": "#292825",
			"info": "#3a6470", "success": "#3c6d46", "warning": "#e7ce48", "error": "#b24242",
			"--rounded-box": "0.25rem", "--rounded-btn": "0rem", "--rounded-badge": "0rem", "--btn-text-case": "none"
		} }],
		darkTheme: "dark", // name of one of the included themes for dark mode
		logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
	  }
}
