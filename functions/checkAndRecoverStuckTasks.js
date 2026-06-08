import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TASK_TIMEOUT_LIMIT = 60 * 1000; // 60 seconds timeout limit

async function checkAndRunScheduledTasks() {
  // Check the task status and ensure timely execution
  const tasks = await getScheduledTasks(); // This function returns tasks that are registered for execution

  for (const task of tasks) {
    const currentTime = Date.now();
    if (task.status === 'Running' && (currentTime - task.startTime > TASK_TIMEOUT_LIMIT)) {
      console.error(`Task ${task.id} is stuck in running state. Initiating recovery...`);
      await recoverStuckTask(task);
    }
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    await checkAndRunScheduledTasks();
    return Response.json({ message: 'Tasks checked and executed as necessary.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function recoverStuckTask(task) {
  // Logic to safely terminate and log the task status
  await terminateTask(task.id);
  console.warn(`Task ${task.id} was successfully terminated due to timeout.`);
  // Optionally, reschedule or alert for manual intervention as required.
}