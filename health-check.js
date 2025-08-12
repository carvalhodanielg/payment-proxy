#!/usr/bin/env bun

// Script de health check para o Docker
// Verifica se a aplicação está respondendo corretamente

const PORT = process.env.PORT || 3000;
const HEALTH_URL = `http://localhost:${PORT}/payments/service-health`;

async function healthCheck() {
    try {
        const response = await fetch(HEALTH_URL, {
            method: 'GET',
            signal: AbortSignal.timeout(5000) // 5 segundos de timeout
        });

        if (!response.ok) {
            console.error(`Health check failed: HTTP ${response.status}`);
            process.exit(1);
        }

        const data = await response.json();

        if (data.failing === true) {
            console.error('Service is marked as failing');
            process.exit(1);
        }

        console.log('Health check passed');
        process.exit(0);
    } catch (error) {
        console.error('Health check error:', error.message);
        process.exit(1);
    }
}

healthCheck();
