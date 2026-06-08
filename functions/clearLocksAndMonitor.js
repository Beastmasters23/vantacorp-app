import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearLocksAndMonitor() {
    const aptLockCheckCommand = 'lsof /var/lib/dpkg/lock';
    const killStuckTasksCommand = 'pkill -f "[command of stuck task]"'; // replace with actual command if known
    try {
        // Check if APT lock exists
        const lockResult = await Deno.run({
            cmd: ['sh', '-c', aptLockCheckCommand],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { success } = await lockResult.status();
        if (success) {
            // Clear APT lock if found
            await Deno.run({ cmd: ['sudo', 'rm', '-f', '/var/lib/dpkg/lock'], status: true });
        }
        // Check for running tasks that might be stuck
        const tasks = await Deno.run({
            cmd: ['sh', '-c', 'pgrep -fl "[command of potential stuck task]"'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const taskOutput = new TextDecoder().decode(await tasks.output());
        if (taskOutput.trim() !== '') {
            // Kill stuck tasks
            await Deno.run({ cmd: ['sh', '-c', killStuckTasksCommand], status: true });
        }
    } catch (error) {
        console.error('Error during lock clearing or task monitoring:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearLocksAndMonitor();
        return Response.json({ message: 'Locks cleared and task monitoring completed.' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});