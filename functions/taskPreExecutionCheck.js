import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks
        const aptLockCheck = await Deno.run({
            cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock; then echo "APT is locked"; else echo "APT is free"; fi'],
            stdout: 'piped',
        });
        const { code } = await aptLockCheck.status();
        const output = await aptLockCheck.output();
        aptLockCheck.close();
        const aptStatus = new TextDecoder().decode(output);

        if (aptStatus.includes('APT is locked')) {
            return Response.json({ error: "APT is currently locked. Cannot proceed with tasks." }, { status: 503 });
        }

        // Verify command availability
        const requiredCommands = ['cat', 'echo', 'ls'];
        for (const cmd of requiredCommands) {
            const cmdCheck = await Deno.run({
                cmd: ['which', cmd],
                stdout: 'piped',
            });
            const { code } = await cmdCheck.status();
            if (code !== 0) {
                return Response.json({ error: `Command missing: ${cmd}` }, { status: 400 });
            }
        }

        // Proceed with executing the main task logic here...
        return Response.json({ message: "All checks passed, ready to execute tasks." });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});