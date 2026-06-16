import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    // Logic to check and clear APT locks
    const exec = Deno.run({
        cmd: ['sudo', 'apt-get', 'remove', '-y', 'lock'],
        stdout: 'piped',
        stderr: 'piped',
    });

    const { stdout, stderr } = await exec.output();
    exec.close();

    if (stderr.length > 0) throw new Error(new TextDecoder().decode(stderr));
    return new TextDecoder().decode(stdout);
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTLocks();
        return Response.json({ message: 'APT locks cleared successfully!' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});