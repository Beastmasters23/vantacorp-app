import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const results = {};
    for (const command of commands) {
        const status = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        results[command] = status.length > 0;
    }
    return results;
}

async function clearAPTLocks() {
    const process = Deno.run({
        cmd: ['sudo', 'rm', '-rf', '/var/lib/dpkg/lock*', '/var/cache/apt/archives/lock'],
        stdout: 'piped',
        stderr: 'piped',
    });
    await process.status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commands = ['cat', 'apt-get', 'dpkg']; // key commands to check
        const availability = await checkCommandAvailability(commands);
        if (Object.values(availability).every(status => !status)) {
            throw new Error('Required commands are not available.');
        }
        await clearAPTLocks();
        return Response.json({ message: 'Checks completed successfully', availability });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});