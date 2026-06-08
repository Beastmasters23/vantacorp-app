import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Execute shell command to clear APT locks
    const { output } = await Deno.run({
        cmd: ['bash', '-c', 'sudo rm -f /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock'],
        stdout: "piped",
        stderr: "piped"
    }).output();

    // Check output for success/failure
    if (output.length > 0) {
        throw new Error(new TextDecoder().decode(output));
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Clear APT locks first
        await clearAptLocks();
        // Continue with the requested task processing here...
        return Response.json({ success: true }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});