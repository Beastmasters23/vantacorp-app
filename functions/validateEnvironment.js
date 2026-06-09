import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function validateEnvironment() {
    try {
        // Check for APT locks
        const locks = await Deno.run({ cmd: ['sudo', 'lsof', '/var/lib/dpkg/lock'] }).status();
        if (locks.success) throw new Error('APT lock detected!');

        // Check for necessary commands
        const requiredCommands = ['cat', 'grep', 'bash'];
        for (const cmd of requiredCommands) {
            const commandCheck = await Deno.run({ cmd: ['which', cmd] }).status();
            if (!commandCheck.success) throw new Error(`Required command ${cmd} is missing!`);
        }
    } catch (error) {
        throw new Error(`Environment validation failed: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await validateEnvironment();
        // Proceed with task execution here
        return Response.json({ success: true, message: 'Environment valid, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});