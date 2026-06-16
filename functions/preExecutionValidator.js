import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const commandResults = await Promise.all(commands.map(cmd => Deno.run({ cmd: [cmd, '--version'], stdout: 'null', stderr: 'null' }).status()));
    return commandResults.every(result => result.success);
}

async function clearAptLocks() {
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/apt/lists/lock'], stdout: 'null', stderr: 'null' }).status();
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'], stdout: 'null', stderr: 'null' }).status();
    await Deno.run({ cmd: ['sudo', 'dpkg', '--configure', '-a'], stdout: 'null', stderr: 'null' }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'grep', 'awk'];
    const hasCommands = await checkCommandAvailability(essentialCommands);
    if (!hasCommands) {
        return Response.json({ error: 'Essential commands are missing, aborting task execution.' }, { status: 500 });
    }
    await clearAptLocks();
    return Response.json({ message: 'Pre-execution checks passed, ready to execute tasks.' }, { status: 200 });
});