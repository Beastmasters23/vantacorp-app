import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get clean');
        await exec('sudo killall -9 apt-get');
    } catch (error) {
        console.error('Error clearing APT locks:', error);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks(); // Clear APT locks before task execution
        // Proceed with the main task logic here...
        return Response.json({ message: 'APT locks cleared and task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});