import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkPreExecutionEnvironment();
        // Continue with regular task execution...
        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkPreExecutionEnvironment() {
    await checkAPT_Locks();
    await checkCommandAvailability();
}

async function checkAPT_Locks() {
    const result = await Deno.run({
        cmd: ['sh', '-c', 'apt-get -q -o Dpkg::Lock::Timeout=5 update'],
        stdout: "piped"
    });
    const status = await result.status();
    if (!status.success) {
        throw new Error('APT is locked, please resolve.');
    }
}

async function checkCommandAvailability() {
    const commands = ['cat', 'echo'];
    for (const cmd of commands) {
        const result = await Deno.run({
            cmd: ['which', cmd],
            stdout: "piped"
        });
        const status = await result.status();
        if (!status.success) {
            throw new Error(`Required command not found: ${cmd}`);
        }
    }
}