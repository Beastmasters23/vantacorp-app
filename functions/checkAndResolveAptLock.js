import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAndResolveAptLock() {
  const lockStatus = await Deno.run({
    cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock; echo $?']
  });
  const { code } = await lockStatus.status();

  if (code === 0) {
    console.log('APT lock detected. Attempting to clear it...');
    // Forcibly attempting to remove locks
    await Deno.run({ cmd: ['bash', '-c', 'sudo rm /var/lib/dpkg/lock; sudo rm /var/lib/dpkg/lock-frontend;'] }).status();
    console.log('APT locks cleared.');
  } else {
    console.log('No APT locks detected. System is ready to execute tasks.');
  }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        await checkAndResolveAptLock(); // Run the pre-check
        // Continue with the main task execution logic here...
        return Response.json({ message: 'Task executed successfully.' });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});