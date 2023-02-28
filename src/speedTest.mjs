import http from 'http';
import https from 'https';
import URL from 'url';

const testUrl = URL.parse('https://www.google.com/');
const testCount = 5;

export async function testSpeed(proxy) {
    let proxyUrl = `${proxy.type}://${proxy.server}:${proxy.port}`;
    const auth = proxy.username && proxy.password ? `${proxy.username}:${proxy.password}` : undefined;
    if (auth) {
        proxyUrl = `${proxyUrl}@${auth}`;
    }
    const agent = proxyUrl ? new https.Agent({
        keepAlive: true,
        maxSockets: 1,
        proxy: proxyUrl,
    }) : undefined;

    const startTime = Date.now();
    for (let i = 0; i < testCount; i++) {
        const request = https.request({
            method: 'GET',
            host: testUrl.hostname,
            port: testUrl.port || (testUrl.protocol === 'https:' ? 443 : 80),
            path: testUrl.pathname + testUrl.search,
            agent,
        });

        await new Promise((resolve) => request.on('response', resolve));
        await new Promise((resolve) => request.on('end', resolve));
    }

    const endTime = Date.now();
    const elapsedMs = endTime - startTime;
    const averageTime = elapsedMs / testCount;
    const downloadSpeed = (testUrl.search.length * 8 * testCount) / elapsedMs;

    return {
        url: proxyUrl || 'DIRECT',
        latency: averageTime,
        downloadSpeed,
    };
}