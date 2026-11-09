import { mapAlbum, mapPost, mapTodo, mapUser } from "./mappers";
import type { Album, Endpoint, Post, Todo, User } from "./types";

const BASE = "https://dummyjson.com";

export const usersEndpoint: Endpoint<User> = {
  name: "users",
  url: `${BASE}/users?limit=100`,
  rowsKey: "users",
  mapItem: mapUser,
};

export const postsEndpoint: Endpoint<Post> = {
  name: "posts",
  url: `${BASE}/posts?limit=100`,
  rowsKey: "posts",
  mapItem: mapPost,
};

export const todosEndpoint: Endpoint<Todo> = {
  name: "todos",
  url: `${BASE}/todos?limit=100`,
  rowsKey: "todos",
  mapItem: mapTodo,
};

// Deliberately points at a resource this API doesn't have (expect a 404),
// to prove that one failing endpoint doesn't stop the others.
export const albumsEndpoint: Endpoint<Album> = {
  name: "albums",
  url: `${BASE}/albums`,
  rowsKey: "albums",
  mapItem: mapAlbum,
};