import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    integrations: [
        react(),
        tailwind({
            // Disable default base styles to use existing Tailwind config
            applyBaseStyles: false,
        }),
    ],
    output: 'server',
    server: {
        port: 4321,
        host: true
    }
});
