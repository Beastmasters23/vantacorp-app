import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const result = await Deno.run({
        cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await result.output();
    const errorOutput = await result.stderrOutput();
    return { output: output, error: errorOutput, success: result.status.success }; 
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Attempt to clear any APT locks if present
        const unlockAttempt = await clearAptLocks();
        if (!unlockAttempt.success) {
            console.warn('APT lock clearance failed:', unlockAttempt.error);
            return Response.json({ error: 'Unable to clear APT locks. Check system status.' }, { status: 503 });
        }
        // Proceed with next tasks or functions here
        return Response.json({ message: 'APT locks cleared successfully.', output: unlockAttempt.output });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});