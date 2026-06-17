import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const isLocked = await checkForAPTlock(); // Check for APT lock
        if (isLocked) {
            await clearAPTlock(); // Clear the APT lock if present
        }
        // Proceed with task execution
        return Response.json({ message: 'APT lock cleared, ready to execute tasks.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function checkForAPTlock() {
    // Logic to check if APT lock is present
    const result = await Deno.run({
        cmd: ['bash', '-c', 'if [ -f /var/lib/dpkg/lock ]; then echo locked; else echo unlocked; fi'],
        stdout: 'piped',
    });
    const output = await result.output();
    return new TextDecoder().decode(output).trim() === 'locked';
}

async function clearAPTlock() {
    // Logic to remove APT lock
    await Deno.run({
        cmd: ['bash', '-c', 'sudo rm -f /var/lib/dpkg/lock'],
    }).status();
}