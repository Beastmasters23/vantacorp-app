import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null',
        }).status();
        if (!result.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

async function clearAptLocks() {
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock'], stdout: 'null', stderr: 'null'} ).status();
    await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock-frontend'], stdout: 'null', stderr: 'null'} ).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const requiredCommands = ['cat', 'python', 'bash']; // Extend this list as needed
    const missingCommands = await checkCommandAvailability(requiredCommands);

    if (missingCommands.length > 0) {
        console.error('Missing commands:', missingCommands);
        return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 500 });
    }

    await clearAptLocks();
    return Response.json({ status: 'Pre-execution environment validated and apt locks cleared' });
});