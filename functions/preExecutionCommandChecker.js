import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = commands.filter(command => {
        try {
            Deno.run({ cmd: [command, '--version'], stderr: 'null' });
            return false;
        } catch {
            return true;
        }
    });
    return missingCommands;
}

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock-frontend'], stderr: 'null' }).status();
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'], stderr: 'null' }).status();
    } catch(error) {
        console.error("Failed to clear apt locks:", error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'echo', 'ls']; // Add any critical commands needed

    const missingCommands = await checkCommandAvailability(commands);
    if (missingCommands.length > 0) {
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
    }

    await clearAptLocks();

    return Response.json({ status: 'Commands and locks are ready!' });
});