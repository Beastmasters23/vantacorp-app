import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const aptLockStatus = await checkAndClearAptLocks();
        return Response.json({ success: true, message: 'APT locks checked and cleared if necessary', aptLockStatus }, { status: 200 });
    } catch(error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearAptLocks() {
    const locks = await Deno.run({
        cmd: ['bash', '-c', 'lsof /var/lib/dpkg/lock | awk \'{print $2}\'']
    });
    const output = new TextDecoder().decode(await locks.output());
    if (output) {
        const lockProcesses = output.split('\n').filter(Boolean);
        for (let pid of lockProcesses) {
            console.log(`Killing apt lock process with PID: ${pid}`);
            await Deno.run({ cmd: ['kill', pid] });
        }
        console.log('Cleared existing apt locks.');
        return { cleared: true, pids: lockProcesses };
    } else {
        console.log('No apt locks found.');
        return { cleared: false, pids: [] };
    }
}