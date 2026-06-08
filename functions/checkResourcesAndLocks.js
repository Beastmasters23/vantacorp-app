import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const checkAptLocks = async () => {
    const output = await Deno.run({
        cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock*'],
        stdout: 'piped',
        stderr: 'piped'
    }).output;
    return new TextDecoder().decode(output).trim();
};

const checkSystemResources = async () => {
    const memoryInfo = await Deno.run({
        cmd: ['bash', '-c', 'free -m'],
        stdout: 'piped',
        stderr: 'piped'
    }).output;
    const cpuUsage = await Deno.run({
        cmd: ['bash', '-c', 'top -bn1 | grep 