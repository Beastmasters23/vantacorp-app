import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
    const missingCommands = [];
    for (const command of commands) {
        const commandCheck = await Deno.run({
            cmd: ['which', command],
            stdout: 'null',
            stderr: 'null'
        });
        const status = await commandCheck.status();
        if (!status.success) {
            missingCommands.push(command);
        }
    }
    return missingCommands;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const criticalCommands = ['cat', 'grep', 'bash']; // Add any crucial commands here

    try {
        const missingCommands = await checkCommandAvailability(criticalCommands);
        if (missingCommands.length > 0) {
            return Response.json({ error: `Missing commands: ${missingCommands.join(', ')}` }, { status: 500 });
        }

        const tasksToMonitor = [
            { id: 'Task1', timeout: 60, command: 'run_some_command_1' },
            { id: 'Task2', timeout: 60, command: 'run_some_command_2' },
        ];

        for (const task of tasksToMonitor) {
            const taskProcess = Deno.run({
                cmd: [task.command],
                stdout: 'piped',
                stderr: 'piped'
            });

            const taskStatus = await taskProcess.status();
            if (!taskStatus.success) {
                taskProcess.kill();
                return Response.json({ error: `Task ${task.id} failed or took too long` }, { status: 500 });
            }
        }

        return Response.json({ success: 'All commands executed successfully' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});