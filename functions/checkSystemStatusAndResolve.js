import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkSystemStatus() {
    const aptLockCheck = await Deno.run({
        cmd: ['sh', '-c', 'fuser -v /var/lib/dpkg/lock']
    }).status();

    if (aptLockCheck.success) {
        console.log('APT lock detected; clearing before execution.');
        // Attempt to unlock APT process
        await Deno.run({ cmd: ['sudo', 'killall', 'apt', 'apt-get', 'dpkg'] }).status();
    }

    const tasks = await Deno.run({
        cmd: ['systemctl', 'list-units', '--state=running']
    }).output();
    const runningTasks = new TextDecoder().decode(tasks);

    if (runningTasks.includes('myImportProcess.service')) {
        console.log('Import process running; will wait before executing new task.');
        await new Promise(resolve => setTimeout(resolve, 300000)); // Wait for 5 minutes
    }
    console.log('System is clear to run tasks.');
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkSystemStatus();
        // Place logic here for task execution
        return Response.json({ status: 'Execution started' });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});