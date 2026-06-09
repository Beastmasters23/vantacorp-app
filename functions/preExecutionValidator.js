import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const commandList = ['cat', 'grep', 'echo', 'ls']; // Add critical commands as needed

async function checkAptLocks() {
  const { stdout } = await Deno.run({
      cmd: ['bash', '-c', 'sudo fuser -v /var/lib/dpkg/lock; echo $?'],
      stdout: 'piped',
      stderr: 'piped'
  }).output();
  return new TextDecoder().decode(stdout).includes('fuser') ? true : false;
}

async function checkCommandsAvailability() {
  for (const command of commandList) {
    try {
      await Deno.run({ cmd: [command, '-v'], stdout: 'null' });
    } catch (e) {
      return false;
    }
  }
  return true;
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
      const aptLocked = await checkAptLocks();
      const commandsAvailable = await checkCommandsAvailability();

      if (aptLocked) {
        return Response.json({ error: 'Apt locks detected, clear them before proceeding.' }, { status: 400 });
      }

      if (!commandsAvailable) {
        return Response.json({ error: 'Required commands are missing. Please install them and try again.' }, { status: 400 });
      }

      return Response.json({ status: 'All prerequisites met - ready to execute tasks!' });
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
});