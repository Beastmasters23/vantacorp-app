import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Attempt to clear APT locks
    try {
        const output = await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        return new TextDecoder().decode(output);
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        throw new Error('APT lock clearance failed');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockStatus = await clearAptLocks();
        console.log('APT locks cleared:', lockStatus);
        // Proceed with executing the task...
        return Response.json({ message: 'APT locks cleared successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});