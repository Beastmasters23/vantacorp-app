import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo fuser -k /var/cache/apt/archives/lock'],
        stdout: "piped",
        stderr: "piped",
    });
    const output = await result.output();
    await result.status();
    return new TextDecoder().decode(output);
}

async function checkSystemReadiness() {
    const output = await clearAPTLocks();
    // Add other readiness checks if needed
    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const readinessOutput = await checkSystemReadiness();
        return Response.json({ message: 'System is ready', details: readinessOutput }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});