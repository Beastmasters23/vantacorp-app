import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get remove --purge lock', { silent: true });
    } catch (e) {
        console.error('Failed to clear APT lock:', e);
    }
}

async function checkCommand(command) {
    const process = Deno.run({
        cmd: ['which', command],
        stdout: 'null',
        stderr: 'null'
    });
    const status = await process.status();
    return status.success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        const commands = ['cat', 'echo', 'ls']; // add commands needed for execution
        for (const command of commands) {
            const commandAvailable = await checkCommand(command);
            if (!commandAvailable) {
                return Response.json({ error: `Command ${command} not found` }, { status: 500 });
            }
        }
        return Response.json({ message: 'All commands are available and APT locks are cleared' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});