import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Simulate checking and clearing APT locks
    const result = await Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -k /var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped'
    }).output();

    const output = new TextDecoder().decode(result);
    console.log(output);
    return output.includes('successfully cleared');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAptLocks();
        if (!locksCleared) {
            throw new Error('Failed to clear APT locks. Tasks cannot proceed.');
        }
        return Response.json({ message: 'APT locks cleared. Tasks can proceed.' });
    } catch(error) { 
        return Response.json({ error: error.message }, { status: 500 });
    }
});