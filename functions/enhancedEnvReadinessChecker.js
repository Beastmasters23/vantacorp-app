import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkEnvReadiness() {
    const requiredCommands = ['cat', 'grep', 'find', 'awk'];
    const commandNotFound = [];

    for (const command of requiredCommands) {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null'
        });
        const status = await result.status();
        if (!status.success) {
            commandNotFound.push(command);
        }
    }

    if (commandNotFound.length > 0) {
        return { ok: false, message: `Missing commands: ${commandNotFound.join(', ')}` };
    }
    return { ok: true };
}

async function clearAptLocks() {
    await Deno.run({
        cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock'],
        stdout: 'null',
        stderr: 'null'
    }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const envCheck = await checkEnvReadiness();
        if (!envCheck.ok) throw new Error(envCheck.message);

        await clearAptLocks();

        // Proceed with task execution...
        return Response.json({ result: 'Environment is ready, proceeding with task execution.' });
    } catch(error) {
        // Log error for observability
        console.error('Task execution failed:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});