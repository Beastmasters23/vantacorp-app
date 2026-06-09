import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preflightCheck(command) {
    try {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped',
        }).output();
        const output = new TextDecoder().decode(result);
        return output.trim() !== '';
    } catch (error) {
        console.error(`Error checking command ${command}: ${error.message}`);
        return false;
    }
}

async function clearAPTLocks() {
    try {
        await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
            stderr: 'piped',
        }).status();
    } catch (error) {
        console.error(`Error clearing APT locks: ${error.message}`);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'echo'];

    for (const command of commandsToCheck) {
        const commandAvailable = await preflightCheck(command);
        if (!commandAvailable) {
            return Response.json({ error: `Command ${command} is missing!` }, { status: 500 });
        }
    }

    await clearAPTLocks();
    // Proceed with executing the actual task
    return Response.json({ message: 'All checks passed. Proceeding to execute task.' });
});
