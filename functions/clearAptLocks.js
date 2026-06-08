import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        const output = await exec({ cmd: ['sh', '-c', 'sudo apt-get clean; sudo dpkg --configure -a;']});
        console.log(output);
    } catch (error) {
        console.error('Error clearing apt locks:', error);
        throw new Error('Failed to clear apt locks.\n' + error.message);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        return Response.json({ message: 'Apt locks cleared successfully.' }, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});