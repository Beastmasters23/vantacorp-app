import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const process = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stderr: 'piped',
        stdout: 'piped'
    });
    const { stdout, stderr } = await process.output();
    process.close();

    if (stderr.length > 0) {
        throw new Error(new TextDecoder().decode(stderr));
    }
    return new TextDecoder().decode(stdout);
}

async function checkCommands(commands) {
    for (const cmd of commands) {
        const process = Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { stdout, stderr } = await process.output();
        process.close();
        if (stderr.length > 0) {
            throw new Error(`Command not found: ${cmd}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const essentialCommands = ['cat', 'grep', 'curl'];
    try {
        await clearAptLocks();
        await checkCommands(essentialCommands);
        // Continue with the task executions here...
        return Response.json({ message: 'Pre-execution health check passed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});