import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    const command = "sudo fuser -v /var/lib/dpkg/lock*";
    const { stdout, stderr } = await Deno.run({
        cmd: ['sh', '-c', command],
        stdout: 'piped',
        stderr: 'piped'
    }).output();
    const output = new TextDecoder().decode(stdout);
    const errorOutput = new TextDecoder().decode(stderr);

    if (errorOutput) {
        throw new Error(`Error clearing APT locks: ${errorOutput}`);
    }
    return output;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const locksCleared = await clearAPTLocks();
        return Response.json({ message: "APT locks cleared successfully.", details: locksCleared }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});