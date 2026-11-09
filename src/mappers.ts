import { asBoolean, asNumber, asString, isRecord } from "./guards";
import type { Album, Post, Todo, User } from "./types";

export function mapUser(raw: unknown): User | null {
  if (!isRecord(raw)) return null;

  const id = asNumber(raw["id"]);
  const firstName = asString(raw["firstName"]);
  const lastName = asString(raw["lastName"]);
  const email = asString(raw["email"]);

  const address = raw["address"];
  const company = raw["company"];
  const city = isRecord(address) ? asString(address["city"]) : null;
  const companyName = isRecord(company) ? asString(company["name"]) : null;

  if (
    id === null ||
    firstName === null ||
    lastName === null ||
    email === null ||
    city === null ||
    companyName === null
  ) {
    return null;
  }
  return { id, name: `${firstName} ${lastName}`, email, city, company: companyName };
}

export function mapPost(raw: unknown): Post | null {
  if (!isRecord(raw)) return null;

  const id = asNumber(raw["id"]);
  const userId = asNumber(raw["userId"]);
  const title = asString(raw["title"]);
  const body = asString(raw["body"]);

  if (id === null || userId === null || title === null || body === null) return null;
  return { id, userId, title, body };
}

export function mapTodo(raw: unknown): Todo | null {
  if (!isRecord(raw)) return null;

  const id = asNumber(raw["id"]);
  const userId = asNumber(raw["userId"]);
  const title = asString(raw["todo"]);
  const completed = asBoolean(raw["completed"]);

  if (id === null || userId === null || title === null || completed === null) return null;
  return { id, userId, title, completed };
}

export function mapAlbum(raw: unknown): Album | null {
  if (!isRecord(raw)) return null;

  const id = asNumber(raw["id"]);
  const userId = asNumber(raw["userId"]);
  const title = asString(raw["title"]);

  if (id === null || userId === null || title === null) return null;
  return { id, userId, title };
}