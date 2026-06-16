import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkRequiredCommands(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const cmdCheck = Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        });
        const status = await cmdCheck.status();
        if (!status.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

async function clearAptLocks() {
    try {
        await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
        }).status();
        await Deno.run({
            cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock'],
        }).status();
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'echo', 'ls']; // Add essential commands as needed
    try {
        const missingCommands = await checkRequiredCommands(requiredCommands);
        if (missingCommands.length > 0) {
            console.warn('Missing commands:', missingCommands);
            return Response.json({ error: 'Missing commands detected.', missingCommands }, { status: 500 });
        }
        await clearAptLocks();
        // Proceed with the task execution logic here...
        return Response.json({ message: 'All checks passed, task execution continues.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});