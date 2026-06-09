import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAPTAndCommands() {
    // Check for APT locks
    const aptLocks = await Deno.run({
        cmd: ['sh', '-c', "if lsof /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend; then echo 'locked'; else echo 'unlocked'; fi"],
        stdout: 'piped',
        stderr: 'piped',
    });
    const aptStatus = await aptLocks.output();
    const isAPTLocked = new TextDecoder().decode(aptStatus).includes('locked');
    if (isAPTLocked) {
        return { success: false, message: 'APT is locked. Please try later.' };
    }

    // Check for command availability
    const commands = ['cat', 'bash']; // List of necessary commands
    for (let cmd of commands) {
        const process = Deno.run({
            cmd: ['command', '-v', cmd],
            stdout: 'piped',
            stderr: 'piped',
        });
        const cmdAvailable = await process.status();
        if (!cmdAvailable.success) {
            return { success: false, message: `${cmd} command not found.` };
        }
    }

    return { success: true, message: 'All checks passed.' };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const checks = await checkAPTAndCommands();
        if (!checks.success) {
            return Response.json({ error: checks.message }, { status: 400 });
        }

        // Proceed with the actual task here
        return Response.json({ success: true, message: 'Task execution can proceed.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});