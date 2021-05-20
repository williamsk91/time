import {
  Arg,
  Authorized,
  Field,
  ID,
  InputType,
  Mutation,
  Resolver,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Note } from "../entity/note";
import { Task } from "../entity/task";
import {
  TaskNotFoundError,
  NoteNotFoundError,
  NoteAlreadyExistError,
} from "../error";
import { JsonScalar } from "../scalar/json";

@InputType()
export class UpsertNoteInput implements Partial<Note> {
  @Field((_type) => JsonScalar)
  body: Object;
}

@Resolver()
export class RepeatResolver {
  @Authorized()
  @Mutation((_returns) => Note)
  async setNote(
    @Arg("taskId", () => ID) taskId: string,
    @Arg("note", { nullable: true }) note?: UpsertNoteInput
  ): Promise<Note> {
    return await setTaskNote(taskId, note);
  }
}

// ------------------------- Business logic -------------------------

async function createNote(
  taskId: string,
  note: UpsertNoteInput
): Promise<Note> {
  const task = await getRepository(Task)
    .createQueryBuilder("task")
    .where("task.id = :taskId", { taskId })
    .andWhere("task.deleted is NULL")
    .leftJoinAndSelect("task.note", "note")
    .getOne();

  if (!task) throw TaskNotFoundError;
  if (!!task.note) throw NoteAlreadyExistError;

  const newNote = Note.create({ ...note, task });
  await newNote.save();

  return newNote;
}

async function updateNote(id: string, note: UpsertNoteInput): Promise<Note> {
  await Note.update(id, note);
  const updatedNote = await Note.getById(id);
  if (!updatedNote) throw NoteNotFoundError;
  return updatedNote;
}

async function deleteNote(taskId: string, noteId: string): Promise<Note> {
  const note = await Note.getById(noteId);
  if (!note) throw NoteNotFoundError;

  // removing foreign key constraint
  await Task.update({ id: taskId }, { note: undefined });

  await Note.remove(note);

  note.id = noteId;
  return note;
}

/**
 * if `note` is defined upsert it. Else delete it
 */
async function setTaskNote(
  taskId: string,
  note?: UpsertNoteInput
): Promise<Note> {
  const task = await getRepository(Task)
    .createQueryBuilder("task")
    .where("task.id = :taskId", { taskId })
    .andWhere("task.deleted is NULL")
    .leftJoinAndSelect("task.note", "note")
    .getOne();
  if (!task) throw TaskNotFoundError;

  // delete
  if (!note) {
    if (!task.note) throw NoteNotFoundError;
    return deleteNote(taskId, task.note.id);
  }

  // insert
  if (!task.note) return createNote(task.id, note);

  return updateNote(task.note.id, note);
}
