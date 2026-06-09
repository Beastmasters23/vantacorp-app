import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = commands.filter(cmd => !Deno.run({ cmd: [cmd], stdout: 'null' }).status().code);
    return missingCommands.length === 0 ? true : missingCommands;
}

async function clearAptLocks() {
    try {
        await Deno.run({ cmd: ['sudo', 'apt-get', 'remove', '-y', '-q', 'lock'], stdout: 'null' }).status();
        await Deno.run({ cmd: ['sudo', 'dpkg', '--configure', '-a'], stdout: 'null' }).status();
    } catch (e) {
        console.error('Failed to clear APT locks:', e);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'grep', 'ls'];
    const missing = await checkCommandAvailability(requiredCommands);

    if (missing) {
        return Response.json({ error: `Missing commands: ${missing.join(', ')}` }, { status: 500 });
    } else {
        await clearAptLocks();
    }

    return Response.json({ message: 'All necessary commands are available and apt locks cleared.' }, { status: 200 });
});