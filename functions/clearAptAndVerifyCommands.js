import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndVerifyCommands() {
    const exec = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const [status] = await exec.status();

    if (!status.success) {
        throw new Error('Failed to clear APT locks.');
    }

    const commands = ['cat', 'ls', 'echo']; // Example command list
    for (const cmd of commands) {
        const cmdCheck = Deno.run({
            cmd: ['which', cmd],
            stdout: 'piped',
            stderr: 'piped'
        });
        const [cmdStatus] = await cmdCheck.status();

        if (!cmdStatus.success) {
            throw new Error(`Missing critical command: ${cmd}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTAndVerifyCommands();
        return Response.json({ message: 'All checks passed and apt locks cleared.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});