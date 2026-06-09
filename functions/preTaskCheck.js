import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preTaskCheck() {
    // Check for existing APT locks
    const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'];
    for (const lockFile of lockFiles) {
        try {
            await Deno.stat(lockFile);
            console.error(`APT lock detected: ${lockFile}`);
            throw new Error(`APT lock found at ${lockFile}.`);
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                console.log(`No lock found at: ${lockFile}`);
            } else {
                throw error;
            }
        }
    }

    // Validate command availability
    const requiredCommands = ['cat', 'echo', 'ls'];
    for (const command of requiredCommands) {
        try {
            const process = Deno.run({
                cmd: [command, '--version'],
                stdout: 'null',
            });
            await process.status();
        } catch (error) {
            console.error(`Missing command: ${command}`);
            throw new Error(`Command not found: ${command}`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await preTaskCheck();
        return Response.json({ status: 'Pre-task checks passed.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});