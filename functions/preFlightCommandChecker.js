import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndResolveAPT() {
    try {
        const result = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock || true; sudo fuser -k /var/cache/apt/archives/lock || true;']
        }).status();
        return result.success;
    } catch (error) {
        console.error('Error resolving APT locks:', error);
        return false;
    }
}

async function checkCommandAvailability(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await process.output();
    const status = await process.status();
    return status.success && output.length > 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'echo']; // Add more commands if needed
    const APTResolving = await checkAndResolveAPT();

    if (!APTResolving) {
        return Response.json({ error: 'Unable to resolve APT locks. Task cannot proceed.' }, { status: 500 });
    }

    for (const command of commandsToCheck) {
        const commandAvailable = await checkCommandAvailability(command);
        if (!commandAvailable) {
            return Response.json({ error: `Required command ${command} is not available.` }, { status: 500 });
        }
    }

    return Response.json({ message: 'All conditions checked. Ready for task execution.' });
});