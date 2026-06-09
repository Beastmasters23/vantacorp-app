import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function verifyEnvironment() {
    const requiredCommands = ['cat', 'echo', 'ls'];
    const commandChecks = await Promise.all(requiredCommands.map(cmd => checkCommandAvailability(cmd)));
    const allAvailable = commandChecks.every(res => res);

    if (!allAvailable) {
        throw new Error('One or more required commands are not available.');
    }
}

async function checkCommandAvailability(command) {
    try {
        const { stdout } = await runCommand(`command -v ${command}`);
        return !!stdout;
    } catch {
        return false;
    }
}

async function runCommand(cmd) {
    const process = Deno.run({
        cmd: ['sh', '-c', cmd],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await process.status();
    const stdout = new TextDecoder().decode(await process.output());
    const stderr = new TextDecoder().decode(await process.stderrOutput());
    process.close();

    if (code !== 0) {
        throw new Error(stderr);
    }
    return { stdout, stderr };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await verifyEnvironment(); // Check command availability before processing other tasks
        // Additional task processing code can go here
        return new Response('Environment verified successfully', { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});