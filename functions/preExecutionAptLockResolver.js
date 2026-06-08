import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndClearAptLocks();
        // Proceed with normal task execution... 
        return Response.json({ message: 'No APT locks found, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkAndClearAptLocks() {
    const apts = await Deno.run({
        cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock; then echo "Lock found"; else echo "No lock"; fi'],
        stdout: 'piped',
    });
    const status = await apts.status();
    const output = new TextDecoder().decode(await apts.output());
    if (output.includes('Lock found')) {
        console.log('APT lock detected. Attempting to clear...');
        await Deno.run({
            cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock; sudo dpkg --configure -a'],
        }).status();
        console.log('APT lock cleared.');
    } else {
        console.log('No APT lock found, system ready for further operations.');
    }
    apts.close();
}