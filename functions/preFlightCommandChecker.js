import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndResolveLocks() {
    const cmdCheck = Deno.run({
        cmd: ['bash', '-c', 'fuser -v /var/lib/dpkg/lock']
    });
    const { code } = await cmdCheck.status();
    if (code === 0) {
        // If locks are detected, attempting to clear them
        await Deno.run({
            cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock']
        }).status();
    }
}

async function checkCommandAvailability(command) {
    const cmdCheck = Deno.run({
        cmd: ['which', command]
    });
    const { code } = await cmdCheck.status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndResolveLocks();
        const commandsToCheck = ['cat', 'bash']; // add necessary commands here
        for (const cmd of commandsToCheck) {
            if (!await checkCommandAvailability(cmd)) {
                throw new Error(`Command not available: ${cmd}`);
            }
        }
        return new Response('All checks passed', { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});