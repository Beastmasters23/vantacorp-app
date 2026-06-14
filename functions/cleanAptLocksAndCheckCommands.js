import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
    // Check for APT locks and attempt to clear them
    const result = Deno.run({
        cmd: ['sh', '-c', 'sudo fuser -k /var/lib/dpkg/lock-frontend; sudo rm /var/lib/dpkg/lock-frontend;']
    });
    const status = await result.status();
    return status.success;
}

async function ensureCommandAvailability() {
    // List of critical commands to check
    const commands = ['cat', 'curl', 'apt-get'];
    for (const cmd of commands) {
        const result = Deno.run({ cmd: ['which', cmd] });
        const status = await result.status();
        if (!status.success) {
            console.error(\