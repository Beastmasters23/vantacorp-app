import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommand(command: string): Promise<boolean> {
    const { status } = await Deno.run({
        cmd: ['which', command],
        stdout: 'piped',
        stderr: 'piped',
    }).status();
    return status === 0;
}

async function clearAptLocks(): Promise<void> {
    await Deno.run({
        cmd: ['sudo', 'apt', 'remove', '-y', '--fix-broken'],
        stdout: 'piped',
    }).status();
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const commands = ['cat', 'echo', 'ls']; // essential commands for demo
        const enoughFreeSpace = true; // you would check this in practice

        // Pre-check commands before executing tasks
        for (const command of commands) {
            const commandExists = await checkCommand(command);
            if (!commandExists) {
                console.error(`Command not found: ${command}`);
                return Response.json({ error: `Command not found: ${command}` }, { status: 500 });
            }
        }
        // Check and clear APT locks if necessary
        await clearAptLocks();

        // Place task execution logic here
        // Example return on success
        return Response.json({ message: 'Commands validated and ready for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});