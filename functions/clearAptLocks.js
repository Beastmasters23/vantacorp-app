import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPT_Locks() {
    const exec = Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await exec.status();
    if (code !== 0) {
        const rawError = await exec.stderrOutput();
        const errorString = new TextDecoder().decode(rawError);
        throw new Error(`Failed to clear APT locks: ${errorString}`);
    }
    console.log('APT locks cleared successfully.');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPT_Locks();
        return Response.json({ message: 'APT locks cleared and system is ready for task execution.' }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});