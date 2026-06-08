import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndClearAptLocks() {
    const exec = Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -k /var/lib/dpkg/lock']
    });
    const { code } = await exec.status();
    await exec.close();
    return code === 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const lockCleared = await checkAndClearAptLocks();
        if (!lockCleared) {
            return Response.json({ error: "Could not clear APT lock" }, { status: 503 });
        }

        // Proceed with executing the task after clearing APT locks
        // [Insert task execution logic here]

        return Response.json({ success: "Task executed successfully." });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});