import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    for (const command of commands) {
        const { code } = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (code !== 0) {
            return false; // Command not available
        }
    }
    return true;
}

async function clearAptLocks() {
    // Implement logic to check and clear APT locks
    const { code } = await Deno.run({
        cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock'],
        stderr: 'null',
    }).status();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls', 'grep']; // Add necessary commands
    
    try {
        if (!(await checkCommandAvailability(requiredCommands))) {
            throw new Error('One or more required commands are missing.');
        }
        if (!(await clearAptLocks())) {
            throw new Error('Failed to clear APT locks.');
        }
        return Response.json({ status: 'Command checks successful.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});