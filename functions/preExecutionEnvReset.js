import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear APT Locks
        await clearAptLocks();
        // Log available commands
        const commands = await logAvailableCommands();
        return Response.json({ message: 'APT locks cleared and available commands logged.', commands }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo rm -f /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock*'],
    });
    const { code } = await result.status();
    if (code !== 0) {
        throw new Error('Failed to clear APT locks');
    }
}

async function logAvailableCommands() {
    const commands = ['ls', 'cat', 'echo', 'grep', 'vanta']; // Add more commands as needed
    const availableCommands = [];
    for (const cmd of commands) {
        const result = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
        });
        const { code } = await result.status();
        if (code === 0) {
            availableCommands.push(cmd);
        }
    }
    return availableCommands;
}