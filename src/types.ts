export interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  company: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface Album {
  id: number;
  userId: number;
  title: string;
}


/** Describes one API source and how to turn one raw item into a domain object. */
export interface Endpoint<T> {
  name: string;
  url: string;
  /** Key in the JSON response that holds the array of records. */
  rowsKey: string;
  mapItem(raw: unknown): T | null;
}

export interface EndpointFailure {
  endpoint: string;
  reason: string;
}

export interface EngineResult {
  users: User[];
  posts: Post[];
  todos: Todo[];
  albums: Album[];
  failures: EndpointFailure[];
  durationMs: number;
}