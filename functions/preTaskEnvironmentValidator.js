import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function checkAptLock() {
  try {
    const { stdout } = await Deno.run({
      cmd: ['bash', '-c', 'if lsof /var/lib/dpkg/lock-frontend; then echo "LOCK"; else echo "UNLOCKED"; fi'],
      stdout: 'piped'
    }).output();
    return new TextDecoder().decode(stdout).trim() === 'UNLOCKED';
  } catch (error) {
    return false;
  }
}

async function checkCommandAvailability(commands) {
  const results = {};
  for (const command of commands) {
    const { stdout } = await Deno.run({
      cmd: ['bash', '-c', `command -v ${command}`],
      stdout: 'piped'
    }).output();
    results[command] = new TextDecoder().decode(stdout).trim() !== '';
  }
  return results;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const commandsToCheck = ['cat', 'ls', 'echo']; // List of critical commands
    const aptUnlocked = await checkAptLock();
    const commandAvailability = await checkCommandAvailability(commandsToCheck);

    const issues = [];
    if (!aptUnlocked) issues.push('APT is locked.');
    for (const command in commandAvailability) {
      if (!commandAvailability[command]) {
          issues.push(`${command} is missing.`);
      }
    }

    return Response.json({ aptLocked: !aptUnlocked, commandIssues: issues }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});