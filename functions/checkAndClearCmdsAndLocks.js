import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const commandExists = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null'
        }).status();
        if (!commandExists.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

async function clearAptLocks() {
    await Deno.run({ cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock-frontend'], stderr: 'inherit' }).status();
    await Deno.run({ cmd: ['sudo', 'fuser', '-k', '/var/cache/apt/archives/lock'], stderr: 'inherit' }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'python3']; // Add other critical commands as needed.

    try {
        const missingCommands = await checkCommandAvailability(requiredCommands);
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }

        await clearAptLocks();
        // Proceed with the task execution logic here, e.g., vantaSelfHeal();
        return Response.json({ message: 'All checks passed. Task can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});