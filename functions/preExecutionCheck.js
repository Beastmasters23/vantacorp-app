import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAPTandCommands() {
    try {
        // Check for APT locks
        const aptStatus = await Deno.run({
            cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock; then echo "APT is locked"; else echo "APT is clear"; fi'],
            stdout: "piped"
        });
        const output = await aptStatus.output();
        const aptMessage = new TextDecoder().decode(output);
        if (aptMessage.includes('locked')) {
            throw new Error('APT is currently locked.');
        }

        // Check for essential commands
        const commands = ['cat', 'echo'];  // Add other essential commands as needed
        for (const cmd of commands) {
            const cmdStatus = await Deno.run({
                cmd: ['which', cmd],
                stdout: 'piped',
                stderr: 'piped'
            });
            const cmdOutput = await cmdStatus.output();
            if (cmdOutput.length === 0) {
                throw new Error(`Command ${cmd} is not available.`);
            }
        }
        return true;
    } catch (error) {
        throw new Error(`Pre-execution validation failed: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Run pre-execution checks
        await checkAPTandCommands();

        // Proceed with the task execution logic here
        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});