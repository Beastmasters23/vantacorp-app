import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await Deno.run({ cmd: ['sudo', 'apt-get', 'clean'], stdout: 'null', stderr: 'inherit' }).status();
    return result.success;
}

async function checkCommandAvailability(command) {
    const commandCheck = Deno.run({ cmd: ['command', '-v', command], stdout: 'null', stderr: 'inherit' });
    return commandCheck.status().success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'ls'];  // Example commands to check

    // Clear APT locks
    if (!(await clearAptLocks())) {
        return Response.json({ error: 'Failed to clear APT locks.' }, { status: 500 });
    }

    // Check if required commands are available
    for (const command of requiredCommands) {
        if (!(await checkCommandAvailability(command))) {
            return Response.json({ error: `Required command not found: ${command}` }, { status: 500 });
        }
    }

    return Response.json({ message: 'Pre-check passed, environment ready.' });
});