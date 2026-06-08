import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        // Check for APT locks
        const isLocked = await checkAptLock();
        if (isLocked) {
            return Response.json({ error: 'APT is locked. Please clear locks before proceeding.' }, { status: 423 });
        }

        // Check for stuck tasks
        const stuckTasks = await getStuckTasks();
        if (stuckTasks.length > 0) {
            return Response.json({ warning: 'Some tasks are currently stuck: ' + stuckTasks.join(', ') }, { status: 424 });
        }

        return Response.json({ message: 'No locks or stuck tasks detected, ready for execution.' });
    } catch(err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
});

async function checkAptLock() {
    const result = await executeCommand('sudo lsof /var/lib/dpkg/lock');
    return result.stdout.length > 0;
}

async function getStuckTasks() {
    const result = await executeCommand('ps -eo pid,etime,cmd | grep -E "[Rr]unning"');
    const threshold = 3600; // 1 hour
    return result.stdout.split('\n').filter(task => {
        const timeParts = task.split(' ')[1].split(':');
        const totalTime = timeParts.length === 3 ? (parseInt(timeParts[0]) * 3600) + (parseInt(timeParts[1]) * 60) + parseInt(timeParts[2]) : (parseInt(timeParts[0]) * 60) + parseInt(timeParts[1]);
        return totalTime > threshold;
    }).map(task => task.split(' ')[2]);
}

async function executeCommand(command) {
    const process = Deno.run({
        cmd: command.split(' '),
        stdout: 'piped',
        stderr: 'piped'
    });
    const output = await process.output();
    process.close();
    return {
        stdout: new TextDecoder().decode(output).trim(),
        stderr: new TextDecoder().decode(await process.stderrOutput()).trim(),
    };
}