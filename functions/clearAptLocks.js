import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    try {
        await executeCommand('sudo fuser -k /var/lib/dpkg/lock');
        await executeCommand('sudo fuser -k /var/cache/apt/archives/lock');
        // Add more locks if necessary
      return true;
    } catch (error) {
      console.error('Failed to clear APT locks', error);
      return false;
    }
}

async function executeCommand(command) {
    return new Promise((resolve, reject) => {
        const process = Deno.run({
            cmd: command.split(' '),
            stdout: 'piped',
            stderr: 'piped',
        });

        (async () => {
            const { success } = await process.status();
            const output = await process.output();
            const error = await process.stderrOutput();
            process.close();

            if (success) {
                resolve(new TextDecoder().decode(output));
            } else {
                reject(new TextDecoder().decode(error));
            }
        })();
    });
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const lockCleared = await clearAptLocks();
    if (!lockCleared) {
        return Response.json({ error: 'Failed to clear APT locks' }, { status: 500 });
    }

    // Proceed with the subsequent operations...

    return Response.json({ message: 'APT locks cleared successfully.' });
});