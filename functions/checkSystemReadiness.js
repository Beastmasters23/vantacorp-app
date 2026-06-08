import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function isAptLocked() {
    const process = Deno.run({
        cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock > /dev/null; then echo 1; fi'],
        stdout: 'piped'
    });
    const output = await process.output();
    process.close();
    return new TextDecoder().decode(output).trim() === '1';
}

async function checkSystemReadiness() {
    const aptLocked = await isAptLocked();
    // Implement other checks (like system resource usage) if needed
    return !aptLocked;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isReady = await checkSystemReadiness();
        if (!isReady) {
            return Response.json({ error: 'System is not ready, apt lock detected.' }, { status: 503 });
        }
        // Proceed with task execution
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});