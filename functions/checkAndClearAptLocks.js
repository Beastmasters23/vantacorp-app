import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check if process is running as root (sudo)
        const isRoot = Deno.run({
            cmd: ['id', '-u'],
            stdin: 'null',
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = new TextDecoder().decode(await isRoot.output());
        isRoot.close();

        if (parseInt(output.trim()) !== 0) {
            return Response.json({ error: 'Sudo privileges are required for this operation.' }, { status: 403 });
        }

        // Clear apt lock files before proceeding
        const clearLocks = Deno.run({
            cmd: ['bash', '-c', "if [ -f '/var/lib/apt/lists/lock' ]; then rm -f '/var/lib/apt/lists/lock'; fi; if [ -f '/var/cache/apt/archives/lock' ]; then rm -f '/var/cache/apt/archives/lock'; fi; if [ -f '/var/lib/dpkg/lock' ]; then rm -f '/var/lib/dpkg/lock'; fi;"],
            stdin: 'null',
            stdout: 'piped',
            stderr: 'piped'
        });
        const clearOutput = new TextDecoder().decode(await clearLocks.output());
        clearLocks.close();

        // Return successful response
        return Response.json({ success: 'Apt locks cleared successfully.', output: clearOutput }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});