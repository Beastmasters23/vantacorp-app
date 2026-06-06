import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check if the process is running with sudo privileges
        const checkSudo = await Deno.run({
            cmd: ['sudo', '-n', 'true'],
            stdout: "null",
            stderr: "null"
        }).output();

        if (checkSudo[0] !== 0) {
            throw new Error('Sudo privileges are required for this operation.');
        }

        // Clear any existing apt lock files
        await Deno.run({
            cmd: ['sudo', 'rm', '-rf', '/var/lib/apt/lists/lock', '/var/cache/apt/archives/lock', '/var/lib/dpkg/lock*'],
            stdout: "null",
            stderr: "null"
        }).status();

        return Response.json({ message: 'Pre-flight check successful: sudo privileges validated and apt locks cleared.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});