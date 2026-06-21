import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get clean');  
        await exec('sudo rm /var/lib/apt/lists/lock');  
        await exec('sudo rm /var/cache/apt/archives/lock');  
        await exec('sudo rm /var/lib/dpkg/lock');  
        await exec('sudo dpkg --configure -a');  
    } catch (error) {
        console.error('Error clearing APT locks:', error);
        throw new Error('Failed to clear APT locks. Check logs for details.');
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await clearAptLocks();
        // Place additional logic for handling tasks here
        return Response.json({ message: 'APT locks cleared and ready for processing directives.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});