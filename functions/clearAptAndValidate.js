import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAPTAndValidate() {
    const lockCheckCommand = 'sudo lsof /var/lib/dpkg/lock /var/cache/apt/archives/lock';
    const clearLockCommand = 'sudo rm -f /var/lib/dpkg/lock /var/cache/apt/archives/lock';

    // Check for existing APT locks
    const lockCheck = await Deno.run({
        cmd: lockCheckCommand.split(' '),
        stdout: 'piped',
        stderr: 'piped'
    });

    const { code } = await lockCheck.status();
    if (code === 0) {
        // If APT locks are found, clear them
        console.log('APT locks detected, clearing...');
        await Deno.run({
            cmd: clearLockCommand.split(' '),
        }).status();
    }
    else {
        console.log('No APT locks found.');
    }

    // Additional validation steps can go here (like checking for essential files)
} 

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAPTAndValidate();
        // Proceed with calling other critical functions after validation
        return Response.json({ status: 'success' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});