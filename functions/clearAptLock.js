import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPT_Lock() {
    // Command to check and clear APT locks
    const result = await Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo dpkg --configure -a'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { stdout, stderr } = await result.output();
    // Return the output for diagnostic purposes
    return stdout ? new TextDecoder().decode(stdout) : new TextDecoder().decode(stderr);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockCleared = await clearAPT_Lock();
        return Response.json({ message: lockCleared }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});