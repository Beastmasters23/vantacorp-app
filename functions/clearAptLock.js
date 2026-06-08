import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLock() {
    const response = await Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -vki /var/lib/dpkg/lock'],
        stdout: 'piped',
        stderr: 'piped',
    });
    const output = await response.output();
    const errorOutput = await response.stderrOutput();
    if (response.status.code !== 0) {
        throw new Error(String(new TextDecoder().decode(errorOutput))); 
    }
    return String(new TextDecoder().decode(output));
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Attempt to clear APT lock before executing any tasks.
        await clearAptLock();
        return Response.json({ message: "APT lock cleared successfully!" });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});