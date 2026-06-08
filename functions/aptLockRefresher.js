import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTLocks() {
    try {
        const result = await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();

        const output = new TextDecoder().decode(result);
        return output;
    } catch (error) {
        throw new Error(`Failed to clear APT locks: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockClearanceResult = await clearAPTLocks();
        return Response.json({ message: 'APT locks cleared successfully.', details: lockClearanceResult }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});