import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndVerifyCommands() {
    const commandList = ['cat', 'ls', 'echo']; // List of essential commands
    try {
        const aptLockCheck = await Deno.run({
            cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock*'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        const isLocked = new TextDecoder().decode(aptLockCheck);
        if (isLocked) {
            await Deno.run({
                cmd: ['bash', '-c', 'sudo rm -f /var/lib/dpkg/lock*'],
                stdout: 'piped',
                stderr: 'piped'
            }).status();
        }

        for (const cmd of commandList) {
            const commandCheck = await Deno.run({
                cmd: ['bash', '-c', `command -v ${cmd}`],
                stdout: 'piped',
                stderr: 'piped'
            }).output();
            if (!new TextDecoder().decode(commandCheck).trim()) {
                throw new Error(
                    `Essential command '${cmd}' not found.`
                );
            }
        }

        return true; // All checks passed
    } catch (error) {
        console.error('Pre-execution check failed:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const checksPassed = await clearAPTAndVerifyCommands();
        if (!checksPassed) {
            return Response.json({ error: 'Pre-execution checks failed.' }, { status: 500 });
        }
        // Proceed with the task if checks passed
        return Response.json({ message: 'Pre-execution checks passed, task can continue.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});