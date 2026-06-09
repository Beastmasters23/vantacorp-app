import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
async function checkAptLocksAndCommands(commands) {
    const aptLocks = await Deno.run({
        cmd: ['bash', '-c', 'lsof /var/lib/dpkg/lock*'],
        stderr: 'piped',
        stdout: 'piped'
    }).output();

    const hasLock = aptLocks.length > 0;

    if (hasLock) {
        console.log('APT locks detected. Attempting to clear...');
        // Add logic here to clear apt locks if necessary
        // example: await Deno.run({ cmd: ['sudo', 'rm', '/var/lib/dpkg/lock*'] });
    }

    for (const command of commands) {
        const cmdResult = await Deno.run({cmd: ['bash', '-c', `command -v ${command}`], stderr: 'piped'}).output();
        if (!cmdResult.length) {
            throw new Error(
                `Required command ${command} is not available. Please install it before executing the task.`
            );
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['cat', 'echo', 'grep']; // Add necessary commands to check
    try {
        await checkAptLocksAndCommands(commands);
        // Proceed with task execution assuming checks passed
        return Response.json({ message: 'Pre-execution checks passed. Task can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});