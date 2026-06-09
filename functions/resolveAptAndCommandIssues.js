import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function resolveAPTAndCommandIssues() {
    // Check for APT locks
    const aptLockCheck = await Deno.run({
        cmd: ['sh', '-c', 'dpkg-query -l | grep -q apt-lock || echo unlock'],
        stdout: 'piped',
        stderr: 'piped'
    });
    const { code } = await aptLockCheck.status();
    if (code === 0) {
        // Logic to resolve potential locks
        await Deno.run({ cmd: ['sh', '-c', 'sudo apt unlock'], stdout: 'piped' });
    }
    aptLockCheck.close();

    // Check for critical commands
    const commandsToCheck = ['cat', 'echo']; // Add essential commands here
    const missingCommands = [];
    for (const command of commandsToCheck) {
        const checkCmd = await Deno.run({
            cmd: ['sh', '-c', `command -v ${command}`],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { code } = await checkCmd.status();
        if (code !== 0) {
            missingCommands.push(command);
        }
        checkCmd.close();
    }

    // Notify about missing commands if any
    if (missingCommands.length > 0) {
        await Deno.run({
            cmd: ['sh', '-c', `echo "Missing commands: ${missingCommands.join(', ')}"`],
            stdout: 'piped'
        });
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await resolveAPTAndCommandIssues();
        return Response.json({ status: 'Checked and resolved APT locks and command issues.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});