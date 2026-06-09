import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const APT_LOCK_CHECK = 'lsof /var/lib/dpkg/lock';
const COMMAND_CHECKS = ['cat', 'echo', 'mkdir'];

async function checkCommandAvailability(commands) {
    const availableCommands = [];
    for (const command of commands) {
        const cmd = Deno.run({
            cmd: ['command', '-v', command],
            stdout: 'null',
            stderr: 'null'
        });
        const {code} = await cmd.status();
        if (code === 0) {
            availableCommands.push(command);
        }
        cmd.close();
    }
    return availableCommands;
}

async function checkAPTStatus() {
    const lockCheck = Deno.run({
        cmd: ['sh', '-c', APT_LOCK_CHECK],
        stdout: 'null',
        stderr: 'null'
    });
    const {code} = await lockCheck.status();
    lockCheck.close();
    return code !== 0;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptAvailable = await checkAPTStatus();
        const commandsAvailable = await checkCommandAvailability(COMMAND_CHECKS);

        if (!aptAvailable) {
            return Response.json({ error: 'APT is currently locked; cannot proceed with task execution.' }, { status: 503 });
        }

        if (commandsAvailable.length < COMMAND_CHECKS.length) {
            return Response.json({ error: 'One or more essential commands are unavailable: ' + 
                (COMMAND_CHECKS.filter(cmd => !commandsAvailable.includes(cmd))).join(', ') }, { status: 503 });
        }

        // Proceed with the task execution logic.
        return Response.json({ status: 'All checks passed; task can be executed safely.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});