import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndResolveAPT() {
    const lockPresent = await Deno.run({
        cmd: ['test', '-f', '/var/lib/dpkg/lock-frontend'],
        stdout: 'null'
    }).status();
    if (lockPresent.success) {
        console.error('APT lock detected. Attempting to clear.');
        await Deno.run({
            cmd: ['sudo', 'rm', '/var/lib/dpkg/lock-frontend']
        }).status();
    }

    const commands = ['apt-get', 'dpkg', 'cat'];
    for (const command of commands) {
        const cmdCheck = await Deno.run({
            cmd: ['which', command],
            stdout: 'null'
        }).status();
        if (!cmdCheck.success) {
            console.error(`Command not found: ${command}`);
            throw new Error(`Missing command: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndResolveAPT();
        return Response.json({ message: 'Pre-execution check completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});