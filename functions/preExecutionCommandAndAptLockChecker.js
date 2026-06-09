import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const issues = [];
    for (const command of commands) {
        const isAvailable = await Deno.run({ cmd: ['which', command] }).status();
        if (!isAvailable.success) {
            issues.push(`Command not found: ${command}`);
        }
    }
    return issues;
}

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock'], stdout: 'null' }).status();
        await Deno.run({ cmd: ['sudo', 'fuser', '-k', '/var/cache/apt/archives/lock'], stdout: 'null' }).status();
    } catch (error) {
        return `Failed to clear apt locks: ${error.message}`;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'apt-get', 'dpkg'];
    let commandErrors = await checkCommandAvailability(commandsToCheck);

    if (commandErrors.length > 0) {
        return Response.json({ error: commandErrors }, { status: 500 });
    }

    try {
        await clearAptLocks();
        return Response.json({ message: 'Pre-execution check completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});