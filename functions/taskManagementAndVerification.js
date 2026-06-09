import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function verifyCommandAvailability(command: string): Promise<boolean> {
    const processResult = await Deno.run({
        cmd: ['bash', '-c', `command -v ${command}`],
        stdout: 'null',
        stderr: 'null',
    }).status();
    return processResult.success;
}

async function clearAptLocks(): Promise<void> {
    await Deno.run({ cmd: ['bash', '-c', 'sudo rm /var/lib/apt/lists/lock /var/cache/apt/archives/lock /var/lib/dpkg/lock'], stderr: 'null' }).status();
}

async function manageLongRunningTask(childProcess: Deno.Process): Promise<boolean> {
    const timeout = 300; // 5 minutes
    const timeoutPromise = new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout * 1000));
    const taskPromise = childProcess.status();

    return Promise.race([taskPromise, timeoutPromise]).then(() => true).catch(() => {
        childProcess.kill(); // kill the long-running task
        return false;
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandToRun = 'cat'; // Example command to check
    let taskSuccessful = false;

    try {
        const commandAvailable = await verifyCommandAvailability(commandToRun);
        if (!commandAvailable) {
            await clearAptLocks();
            throw new Error('Essential command not available');
        }

        const child = Deno.run({ cmd: [commandToRun], stdout: 'piped', stderr: 'piped' });
        taskSuccessful = await manageLongRunningTask(child);

        if (!taskSuccessful) {
            console.error('Task failed due to timeout.');
            return Response.json({ error: 'Task execution timed out.' }, { status: 500 });
        }

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});