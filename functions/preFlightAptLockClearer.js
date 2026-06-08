import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const result = await Deno.run({
            cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await result.output();
        await result.status();
        return new TextDecoder().decode(output);
    } catch (error) {
        throw new Error(`Failed to clear apt locks: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check and clear apt locks
        const clearResult = await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared successfully', details: clearResult }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});