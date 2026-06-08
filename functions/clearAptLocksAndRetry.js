import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await runCommand('sudo fuser -v /var/lib/dpkg/lock');
    if (result) return result.output; // Log or handle if any process is holding the lock
    await runCommand('sudo rm /var/lib/dpkg/lock');
    await runCommand('sudo rm /var/cache/apt/archives/lock');
    await runCommand('sudo dpkg --configure -a');
}

async function runCommand(command) {
    return Deno.run({
        cmd: ['bash', '-c', command],
        stdout: 'piped',
        stderr: 'piped'
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});