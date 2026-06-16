import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemReadiness() {
    // Check for APT locks and other system states that might block task execution
    const result = await Deno.run({
        cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock || lsof /var/lib/dpkg/lock-frontend; then echo "Locked"; else echo "Unlocked"; fi']
    });
    const output = new TextDecoder().decode(await result.output());
    result.close();
    return output.includes("Locked") ? false : true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isReady = await checkSystemReadiness();
        if (!isReady) {
            return Response.json({ error: "System is locked. Cannot execute tasks." }, { status: 503 });
        }
        // Continue with normal operations or task execution
        return Response.json({ message: "System is ready for task execution." }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});