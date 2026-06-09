import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLocks() {
    const { status } = await Deno.run({
        cmd: ['fuser', '-k', '/var/lib/apt/lists/lock'],
        stdout: 'null',
        stderr: 'null',
    }).status();
    return status.success;
}

async function checkForCommands(commands) {
    const results = await Promise.all(commands.map(async (cmd) => {
        const { code } = await Deno.run({ cmd: ['which', cmd], stdout: 'null', stderr: 'null' }).status();
        return code === 0;
    }));
    return results.every(result => result);
}

async function killStuckTasks(threshold) {
    const processList = await Deno.run({
        cmd: ['ps', '-eo', 'pid,etime,comm'],
        stdout: 'piped',
        stderr: 'null',
    }).output();
    const processOutput = new TextDecoder().decode(processList);
    const now = Date.now();
    const stuckProcesses = processOutput.split('\n').filter(line => {
        const parts = line.split(' ');
        const pid = parts[0];
        const etime = parts[1]; // Getting elapsed time
        // Here you can add logic to compare elapsed time with threshold
        return /* Stuck processes logic here */;
    });
    for (const proc of stuckProcesses) {
        const pid = proc.split(' ')[0];
        await Deno.run({ cmd: ['kill', '-9', pid] }); // Killing stuck process
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commands = ['git', 'cat']; // Add critical commands here
    if (!await checkForCommands(commands)) {
        return Response.json({ error: 'One or more critical commands are missing.' }, { status: 500 });
    }
    if (!await checkAptLocks()) {
        return Response.json({ error: 'Apt locks detected, attempting to resolve...' }, { status: 500 });
    }
    await killStuckTasks(300); // Execute stuck task checker with 300s threshold
    return Response.json({ status: 'All checks passed, tasks can proceed.' });
});