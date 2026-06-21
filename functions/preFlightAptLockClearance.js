import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    const { exec } = Deno;
    const { stdout, stderr } = await exec('sudo apt-get remove --purge lock');
    if (stderr) throw new Error('Failed to clear APT locks: ' + stderr);
    return stdout;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptClear = await clearAPTLocks();
        return Response.json({ message: 'APT locks cleared successfully.', details: aptClear });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});