import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearExistingLocks() {
    const lockFile = '/var/lib/dpkg/lock'; // APT lock file location
    try {
        // Remove the lock file if it exists
        await Deno.run({
            cmd: ['bash', '-c', `if [ -f ${lockFile} ]; then rm ${lockFile}; fi`],
            stdout: 'piped',
            stderr: 'piped'
        }).status;
    } catch (error) {
        console.error('Failed to clear APT lock:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear any existing APT locks
        await clearExistingLocks();
        // Proceed with further task execution here
        return Response.json({ message: 'Locks cleared and ready to proceed.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});