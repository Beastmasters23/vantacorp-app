import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndValidateCommands() {
    const exec = Deno.run;
    const commands = ['cat', 'vanta']; // list of essential commands
    let locked = false;

    // Check for APT locks
    const aptLockOutput = await exec({
        cmd: ['sh', '-c', 'fuser /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend'],
        stdout: 'null',
        stderr: 'piped'
    }).output();
    if (aptLockOutput.length > 0) {
        locked = true;
        await exec({ cmd: ['sh', '-c', 'sudo fuser -k /var/lib/dpkg/lock'] });
    }

    // Validate command availability
    const missingCommands = commands.filter(async (cmd) => {
        const output = await exec({
            cmd: ['which', cmd],
            stdout: 'null',
            stderr: 'piped'
        }).output();
        return output.length === 0;
    });

    return { locked, missingCommands };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const { locked, missingCommands } = await clearLocksAndValidateCommands();
        if (locked || missingCommands.length) {
            return Response.json({
                error: {
                    message: 'Pre-execution checks failed.',
                    locked,
                    missingCommands
                }
            }, { status: 400 });
        }
        // Proceed with the task execution
        // ... (task execution code)
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});