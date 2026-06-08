import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function clearAptLocks() {
  const output = await Deno.run({
    cmd: ['sudo', 'fuser', '-k', '/var/lib/dpkg/lock'],
    stdout: 'piped',
    stderr: 'piped'
  }).output;
  return new TextDecoder().decode(output).trim();
}

async function checkLongRunningTasks(threshold) {
  const taskList = await Deno.run({
    cmd: ['ps', '-eo', 'etime,pid,cmd'],
    stdout: 'piped',
    stderr: 'piped'
  }).output;
  const tasks = new TextDecoder().decode(taskList);
  return tasks.split('\n').filter(task => task.includes('Running')).some(task => {
    const timeParts = task.split(' ')[0].split(':');
    const elapsedTime = timeParts.reduce((acc, time) => 60 * acc + parseInt(time), 0);
    return elapsedTime > threshold;
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    const aptLockCleared = await clearAptLocks();
    const hasLongRunningTasks = await checkLongRunningTasks(60);

    if (hasLongRunningTasks) {
      return Response.json({ error: 'Detected long running tasks; blocking new execution.' }, { status: 400 });
    }

    // Proceed with other tasks execution
    return Response.json({ status: 'All checks passed, ready for task execution.' });
  } catch(error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});