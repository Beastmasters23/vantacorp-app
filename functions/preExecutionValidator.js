import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    async function clearAPTLock() {
        try {
            const { stdout } = await Deno.run({
                cmd: ['sudo', 'apt-get', 'clean'],
                stdout: 'piped',
                stderr: 'piped'
            }).output();
            return new TextDecoder().decode(stdout);
        } catch (error) {
            console.error("Failed to clear APT lock:", error);
            throw new Error("APT lock clearance failed");
        }
    }

    async function checkCommandAvailability(commands) {
        for (const command of commands) {
            const process = Deno.run({
                cmd: ['which', command],
                stdout: 'piped',
                stderr: 'piped'
            });
            const { code } = await process.status();
            if (code !== 0) {
                throw new Error(`Required command missing: ${command}`);
            }
        }
    }

    const essentialCommands = ['cat', 'curl']; // Add more essential commands to the list as necessary

    try {
        await clearAPTLock();
        await checkCommandAvailability(essentialCommands);
        return Response.json({ message: "Pre-execution checks passed" }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});