import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Command to clear APT locks
    const result = await Deno.run({
        cmd: ['sudo', 'apt-get', 'clean'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await result.output();
    const errorOutput = await result.stderrOutput();
    result.close();
    return { success: result.status === 0, output: new TextDecoder().decode(output), error: new TextDecoder().decode(errorOutput) };
}

async function checkAptLocks() {
    // Check if there are any APT locks
    const result = await Deno.run({
        cmd: ['lsof', '/var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const { success } = await result.output();
    result.close();
    return success;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLocked = await checkAptLocks();
        if (aptLocked) {
            const clearResponse = await clearAptLocks();
            if (!clearResponse.success) {
                return Response.json({ error: clearResponse.error }, { status: 500 });
            }
        }
        return Response.json({ message: 'APT locks checked and cleared if present.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});