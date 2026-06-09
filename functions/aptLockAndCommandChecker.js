import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    const { exec } = Deno;
    try {
        await exec('sudo apt-get clean');
        await exec('sudo apt-get update');
        return true;
    } catch (error) {
        console.error('Failed to clear APT locks:', error);
        return false;
    }
}

async function checkCommandAvailability(command) {
    try {
        await exec(`which ${command}`);
        return true;
    } catch {
        return false;
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'mkdir', 'rm', 'cp'];
    let allAvailable = true;

    for (const command of commandsToCheck) {
        const isAvailable = await checkCommandAvailability(command);
        if (!isAvailable) {
            console.warn(\