import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkCommandAvailability(commands) {
  for (const command of commands) {
    const cmdResult = await Deno.run({
      cmd: ['which', command],
      stdout: 'piped',
      stderr: 'piped',
    }).output();
    if (new TextDecoder().decode(cmdResult).trim() === '') {
      return false;
    }
  }
  return true;
}

async function clearAptLocks() {
  const lockFiles = ['/var/lib/dpkg/lock', '/var/lib/dpkg/lock-frontend'];
  for (const lockFile of lockFiles) {
    try {
      await Deno.remove(lockFile);
    } catch (e) {
      // Locked or pre-existing state, log or handle it
    }
  }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const commandsToCheck = ['cat', 'ls', 'echo']; // Add essential commands here

    try {
        const commandAvailable = await checkCommandAvailability(commandsToCheck);
        if (!commandAvailable) {
            throw new Error('Essential commands are missing, halting execution.');
        }

        await clearAptLocks();

        // Your main task execution logic here
        // E.g., execute tasks with retries and logging

    } catch (error) {
        // Handle different error cases, e.g. log the error, and return responses.
        return Response.json({ error: error.message, details: error }, { status: 500 });
    }
    return Response.json({ message: 'Tasks executed successfully!' }, { status: 200 });
});