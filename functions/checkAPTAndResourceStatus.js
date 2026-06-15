import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndCheckResources() {
    const resourceUsage = await Deno.run({
        cmd: ['sh', '-c', 'free -m && df -h'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await resourceUsage.output();
    const error = await resourceUsage.stderrOutput();
    if (error.length) throw new Error(new TextDecoder().decode(error));
    return new TextDecoder().decode(output);
}

async function checkAPTStatus() {
    const aptLock = await Deno.run({
        cmd: ['sh', '-c', 'lsof /var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await aptLock.output();
    const error = await aptLock.stderrOutput();
    if (error.length) throw new Error(new TextDecoder().decode(error));
    return output.length === 0; // No locks means we are good
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptReady = await checkAPTStatus();
        const resourceStatus = await clearAPTAndCheckResources();
        if (!aptReady) {
            return Response.json({ error: 'APT lock detected, cannot proceed.' }, { status: 503 });
        }
        return Response.json({ message: 'System is ready for task execution.', resources: resourceStatus });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});