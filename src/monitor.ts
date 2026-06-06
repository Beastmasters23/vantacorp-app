import { serve } from "@base44/sdk";

// A function to monitor CPU and Disk usage, triggering alerts if usage exceeds thresholds
const CPU_THRESHOLD = 80; // percentage
const DISK_THRESHOLD = 90; // percentage

async function getSystemMetrics() {
    const cpuUsage = await Deno.run({
        cmd: ["sh", "-c", "top -b -n1 | grep 'Cpu(s)' | awk '{print $2}'"],
        stdout: "piped"
    }).output();
    const diskUsage = await Deno.run({
        cmd: ["sh", "-c", "df / | tail -1 | awk '{print $5}' | sed 's/%//'"],
        stdout: "piped"
    }).output();

    return {
        cpu: parseFloat(new TextDecoder().decode(cpuUsage)),
        disk: parseInt(new TextDecoder().decode(diskUsage))
    };
}

async function monitorResources() {
    const metrics = await getSystemMetrics();
    if (metrics.cpu > CPU_THRESHOLD) {
        console.warn(`High CPU Usage Alert: ${metrics.cpu}%`);
    }
    if (metrics.disk > DISK_THRESHOLD) {
        console.warn(`High Disk Usage Alert: ${metrics.disk}%`);
    }
}

// Serve the monitoring functionality
serve({
    '/monitor': async (req) => {
        await monitorResources();
        return new Response("Monitoring executed", { status: 200 });
    }
});