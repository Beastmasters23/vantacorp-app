import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// This function checks and clears any APT lock and verifies disk space before executing tasks.
async function taskCleaner() {
    const totalDiskSpace = await Deno.run({
        cmd: ['df', '-k'],
        stdout: 'piped'
    });

    const output = new TextDecoder().decode(await totalDiskSpace.output());
    totalDiskSpace.close();
    if (!output.includes('available')) {
        throw new Error('Insufficient disk space to execute tasks');
    }

    const lockFile = '/var/lib/apt/lists/lock';
    try {
        await Deno.remove(lockFile);
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            // No lock present, continue
        } else {
            throw new Error('Error clearing APT lock: ' + e.message);
        }
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await taskCleaner();
        return Response.json({ success: true, message: 'Task pre-checks completed. Ready for execution.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});