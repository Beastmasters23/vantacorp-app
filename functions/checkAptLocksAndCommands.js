import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocksAndCommands() {
    // Check for APT locks
    const locks = await Deno.run({
        cmd: ['bash', '-c', 'test -f /var/lib/dpkg/lock-frontend && echo base'],
        stdout: 'piped'
    });
    const output = await locks.output();
    locks.close();
    if (output.length > 0) {
        return { aptLock: true };
    }

    // Check essential commands
    const commands = ['cat', 'echo', 'ls'];
    const missingCommands = [];
    for (const cmd of commands) {
        const commandCheck = await Deno.run({
            cmd: ['bash', '-c', `command -v ${cmd}`],
            stdout: 'piped'
        });
        const result = await commandCheck.output();
        commandCheck.close();
        if (result.length === 0) {
            missingCommands.push(cmd);
        }
    }

    return { aptLock: false, missingCommands };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { aptLock, missingCommands } = await checkAptLocksAndCommands();
        if (aptLock) {
            return Response.json({ error: 'APT lock detected, cannot proceed.' }, { status: 503 });
        }
        if (missingCommands.length > 0) {
            return Response.json({ error: 'Missing commands: ' + missingCommands.join(', ') }, { status: 400 });
        }
        // Continue with task execution
        return Response.json({ message: 'Environment ready for task execution.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});