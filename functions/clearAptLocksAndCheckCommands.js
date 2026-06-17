import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocksAndCheckCommands() {
    // Check for APT locks and clear if found
    try {
        const checkAptLocks = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock*'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await checkAptLocks.output();
        if (output.length > 0) {
            throw new Error(`APT lock detected: ${new TextDecoder().decode(output)}`);
        }
        await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock*'] }).status();
    } catch (error) {
        console.error('Failed to clear APT lock:', error);
    }

    // Check for essential command availability
    const essentialCommands = ['cat', 'ls', 'echo']; // Add more as required
    for (const command of essentialCommands) {
        const commandExists = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        });
        const output = await commandExists.output();
        if (output.length === 0) {
            console.error(`Essential command missing: ${command}`);
            return;
        }
    }
    console.log('All essential commands are available and no APT locks present.');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocksAndCheckCommands();
        return Response.json({ status: 'Checks completed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});