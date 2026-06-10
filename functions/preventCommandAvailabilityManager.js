import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const checkCommandAvailability = async (command) => {
        const cmd = await Deno.run({
            cmd: ['command', '-v', command],
            stdout: 'null',
            stderr: 'null'
        });
        const status = await cmd.status();
        return status.success;
    };

    const clearAptLocks = async () => {
        await Deno.run({ cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock*'], stdout: 'null', stderr: 'null' }).status();
    };

    const executeTaskWithChecks = async (task) => {
        const commands = ['cat', 'echo']; // Add critical commands needed for tasks
        for (const command of commands) {
            if (!await checkCommandAvailability(command)) {
                throw new Error(`Command ${command} is missing.`);
            }
        }
        await clearAptLocks();
        const taskRun = await Deno.run({ cmd: task, stdout: 'piped', stderr: 'piped' });
        const { code } = await taskRun.status();
        if (code !== 0) {
            const rawError = await taskRun.stderrOutput();
            throw new Error(new TextDecoder().decode(rawError));
        }
    };

    try {
        const tasks = [['/tmp/vanta_task_TLGRla'], ['/tmp/vanta_task_PyExcG']]; // Example tasks
        for (const task of tasks) {
            await executeTaskWithChecks(task);
        }
        return Response.json({ message: 'All tasks executed successfully' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});