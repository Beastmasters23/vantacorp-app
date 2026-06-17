import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        const result = await Deno.run({
            cmd: ['sudo', 'apt-get', 'clean'],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        return new TextDecoder().decode(result);
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        throw new Error('APT lock clearance failed.');
    }
}

async function commandAvailable(command) {
    try {
        const result = await Deno.run({
            cmd: ['which', command],
            stdout: 'piped',
            stderr: 'piped'
        }).output();
        return result.length > 0;
    } catch (error) {
        console.error('Command availability check failed:', command, error);
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commands = ['cat', 'ls', 'echo']; // Replace with essential commands
        await clearAptLocks();

        for (const cmd of commands) {
            if (!(await commandAvailable(cmd))) {
                throw new Error(`Required command ${cmd} is missing.`);
            }
        }

        return Response.json({ message: 'Pre-execution checks passed, all commands available.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});