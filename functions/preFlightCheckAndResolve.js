import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function preFlightCheck() {
    // Check for APT locks
    const aptCheck = await Deno.run({
      cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock']
    });
    const { code } = await aptCheck.status();
    if (code === 0) {
        console.log('APT is locked. Attempting to clear...');
        await Deno.run({cmd: ['bash', '-c', 'sudo fuser -k /var/lib/dpkg/lock']}).status();
    }

    // Command availability check
    const commandList = ['cat', 'ls', 'echo']; // Add more commands as needed
    for (const command of commandList) {
        const cmdCheck = await Deno.run({cmd: ['which', command]});
        const { code } = await cmdCheck.status();
        if (code !== 0) {
            throw new Error(`Command ${command} is not available.`);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await preFlightCheck();
        return Response.json({ message: 'Pre-flight check completed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});