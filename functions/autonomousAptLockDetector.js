import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    async function checkAndClearAPT() {
        const lockStatus = await Deno.run({
            cmd: ['bash', '-c', 'apt-get -qq update; apt-get -qq install --no-install-recommends dnf'],
            stdout: 'piped',
            stderr: 'piped'
        });
        const { success } = await lockStatus.status();
        if (success) {
            throw new Error('APT lock still active. Please resolve manually.');
        }
        // Clear the lock if it can be accessed
        await Deno.run({ cmd: ['sudo', 'rm', '-f', '/var/lib/dpkg/lock'], stderr: 'null' }); 
        await Deno.run({ cmd: ['sudo', 'rm', '-f', '/var/lib/apt/lists/lock'], stderr: 'null' });
    }
    async function executeTask(task) {
        try {
            await checkAndClearAPT();
            const taskRunner = Deno.run({ cmd: task, stdout: 'piped', stderr: 'piped' });
            const timeout = setTimeout(() => {
                taskRunner.kill(Deno.Signal.SIGTERM);
            }, 60000); // 60 seconds timeout
            const status = await taskRunner.status();
            clearTimeout(timeout);
            return status.success;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    try {
        const taskSuccessful = await executeTask(['some-command']); // Replace with actual tasks
        return Response.json({ taskSuccessful }, { status: taskSuccessful ? 200 : 500 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});