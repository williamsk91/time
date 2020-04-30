import { Connection } from "typeorm";
import { gCall } from "../test-utils/gCall";
import { testConn } from "../test-utils/testConn";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});

afterAll(async () => await conn.close());

it("createTask", async () => {
  const title = "new task title";
  const result = await gCall({
    source: newTaskMutation,
    variableValues: {
      title
    }
  });

  expect(result.data?.createTask).toEqual({
    id: result.data?.createTask.id,
    title,
    done: false,
    end: null,
    includeTime: false,
    start: null
  });
});

it("updateTask", async () => {
  const task = (
    await gCall({
      source: newTaskMutation,
      variableValues: {
        title: "title"
      }
    })
  ).data?.createTask;

  const newTask = {
    id: task.id,
    title: "test new title update",
    done: true,
    start: "2020-04-30T07:00:00.000Z",
    end: "2020-04-30T07:02:00.000Z",
    includeTime: true
  };

  const result = await gCall({
    source: updateTaskMutation,
    variableValues: {
      task: newTask
    }
  });

  expect(result.data?.updateTask).toEqual(newTask);
});

it("tasks", async () => {
  const task1 = (
    await gCall({
      source: newTaskMutation,
      variableValues: {
        title: "tasks test task 1"
      }
    })
  ).data?.createTask;
  const task2 = (
    await gCall({
      source: newTaskMutation,
      variableValues: {
        title: "tasks test task 2"
      }
    })
  ).data?.createTask;

  const result = await gCall({ source: tasksQuery });
  expect(result.data?.tasks).toContainEqual(task1);
  expect(result.data?.tasks).toContainEqual(task2);
});

// ------------------------- GraphQL Sources -------------------------
const newTaskMutation = `
mutation CreateTask($title: String!) {
  createTask(title: $title) {
    id
    title
    done
    start
    end
    includeTime
  }
}
`;

const updateTaskMutation = `
mutation UpdateTask($task: UpdateTaskInput!) {
  updateTask(task: $task) {
    id
    title
    done
    start
    end
    includeTime
  }
}  
`;

const tasksQuery = `
  {
    tasks {
      id
      title
      done
      start
      end
      includeTime
    }
  }
  `;
