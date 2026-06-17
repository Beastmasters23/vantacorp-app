import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const shell = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'null',
        stderr: 'piped'
    });
    const { code } = await shell.status();
    if (code !== 0) {
        const error = await shell.stderrOutput();
        console.error(new TextDecoder().decode(error));
        throw new Error('Failed to clear APT locks');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'APT locks cleared successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});