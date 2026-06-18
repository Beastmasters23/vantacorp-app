import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAPTAndLoad() {
    const lockFileExists = await Deno.stat('/var/lib/dpkg/lock').catch(() => false);
    const loadAvg = await Deno.run({
        cmd: ['uptime'],
        stdout: 'piped'
    }).output();
    const load = new TextDecoder().decode(loadAvg);
    const loadValues = load.match(/load average: ([0-9.]+), ([0-9.]+), ([0-9.]+)/);
    const currentLoad = loadValues ? parseFloat(loadValues[1]) : 0;
    return { lockFileExists, currentLoad };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { lockFileExists, currentLoad } = await checkAPTAndLoad();
        if (lockFileExists) {
            return Response.json({ error: 'APT lock detected. Please resolve before proceeding.' }, { status: 403 });
        }
        if (currentLoad > 2.0) {
            return Response.json({ error: 'High system load detected: ' + currentLoad + '. Please retry later.' }, { status: 503 });
        }
        // Proceed with the task execution logic here
        return Response.json({ success: 'No issues detected. Task can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});