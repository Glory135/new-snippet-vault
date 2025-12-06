import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Snippet Vault',
        short_name: 'SnippetVault',
        description: 'An AI-Powered Code Snippet Manager',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0a0a0a',
        icons: [
            {
                // src: '/icon-192x192.png',
                src: '/manifest-icon-192.maskable.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                // src: '/icon-512x512.png',
                src: '/manifest-icon-512.maskable.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}