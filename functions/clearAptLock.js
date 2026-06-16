import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLock() {
    const command = 'sudo fuser -v /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock';
    const process = Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped',
    });

    const { success } = await process.status();
    if (!success) {
        const rawError = await process.stderrOutput();
        const errorMessage = new TextDecoder().decode(rawError);
        throw new Error('Could not clear apt lock: ' + errorMessage);
    } 
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLock();
        return Response.json({ message: 'Apt lock cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});