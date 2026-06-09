import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        await resolveAptLocks();
        await killStuckTasks();
        return Response.json({ status: 'All systems functional.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function resolveAptLocks() {
    const { stdout } = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock; sudo apt-get -y update; sudo apt-get -y upgrade'],
        stdout: 'piped',
    }).output();
    console.log(new TextDecoder().decode(stdout));
}

async function killStuckTasks() {
    const { stdout } = await Deno.run({
        cmd: ['bash', '-c', 'pkill -f TaskNameThatGetsStuck'],
        stdout: 'piped',
    }).output();
    console.log(new TextDecoder().decode(stdout));
}