import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    try {
        const { stdout, stderr } = await Deno.run({
            cmd: ['sh', '-c', 'sudo apt-get unlock'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        if (stderr.length > 0) throw new Error(new TextDecoder().decode(stderr));
        console.log(new TextDecoder().decode(stdout));
    } catch (error) {
        console.error(`APT lock check/clear failed: ${error.message}`);
        return false;
    }
    return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockCleared = await checkAndClearAptLocks();
        if (!lockCleared) {
            return Response.json({ error: 'Failed to clear APT locks.' }, { status: 500 });
        }
        return Response.json({ message: 'APT locks checked and cleared if necessary.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});