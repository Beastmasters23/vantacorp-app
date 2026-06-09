import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'echo', 'ls']; // Critical commands to check
    const lockFiles = ['/var/lib/apt/lists/lock', '/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'];

    try {
        // Check command availability
        for (const command of commands) {
            const commandAvailable = await Deno.run({
                cmd: ['which', command],
                stdout: 'null'
            }).status();
            if (!commandAvailable.success) {
                throw new Error(`Command not found: ${command}`);
            }
        }

        // Check for apt locks
        for (const lockFile of lockFiles) {
            if (await checkIfFileExists(lockFile)) {
                throw new Error(`Apt lock exists: ${lockFile}`);
            }
        }

        // Proceed with task execution
        // Your task execution logic here...

    } catch (error) {
        console.error(error.message);
        // Return detailed error information
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkIfFileExists(filePath) {
    try {
        await Deno.lstat(filePath);
        return true;
    } catch {
        return false;
    }
}