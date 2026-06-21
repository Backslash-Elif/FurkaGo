const BASE_URL = "http://localhost:8000";

type NullablePartial<T> = { [K in keyof T]?: T[K] | null };

export type Item = {
  id: string;
  name: string;
  info: string;
  tech: object;
  quiz: object;
  photo: string;
};

export type GetAllItem = Pick<Item, "id" | "name">[];

export type CreateItem = Omit<Partial<Omit<Item, 'id'>>, 'name' | 'info' | 'photo'> & {
  name: Item['name'];
  info: Item['info'];
  photo: Item['photo'];
};

export type UpdateItem = NullablePartial<Omit<Item, "id">>;

export type User = {
  id: string;
  name: string;
  password: string;
};

export type SafeUser = Omit<User, "password">;

export type CreateUser = Omit<User, "id">;

export function encodeFileToBase64(file: Blob | null): Promise<string | null> {
  return new Promise<string | null>((resolve, reject) => {
    if (!file) return resolve(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(typeof result === 'string' ? result : null);
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

enum HttpMethods {
  GET,
  POST,
  PATCH,
  DELETE,
}

async function apiFetch(method: HttpMethods, path: string, body: any = {}): Promise<any> {
  const httpMethod = HttpMethods[method].toUpperCase();
  if (!path || typeof path !== "string") throw new TypeError("path (string) required");

  console.log(`Requesting ${httpMethod} at ${BASE_URL + path}`);

  const init: RequestInit = {
    method: httpMethod,
    headers: {
      Accept: "application/json",
    },
  };

  if (body != null && httpMethod !== "GET") {
    (init.headers as Record<string, string>)["Content-Type"] = "application/json; charset=utf-8";
    init.body = JSON.stringify(body);
  }

  const res = await fetch(BASE_URL + path, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}


export async function ApiCreateItem(createItem: CreateItem) {
  const requestBody = {
    name: createItem.name,
    info: createItem.info,
    tech: createItem.tech,
    quiz: createItem.quiz,
    photo: createItem.photo
  }
  const result: Partial<Item> = await apiFetch(HttpMethods.POST, "/items", requestBody)
  return result.id
}

export async function ApiGetAllItems() {
  const result: GetAllItem = await apiFetch(HttpMethods.GET, "/items")
  return result
}

export async function ApiGetItem(id: string) {
  const result: Item = await apiFetch(HttpMethods.GET, `/items/${id}`)
  return result
}

export async function ApiUpdateItem(id: string, updateItem: UpdateItem) {
  const requestBody = {
    name: updateItem.name,
    info: updateItem.info,
    tech: updateItem.tech,
    quiz: updateItem.quiz,
    photo: updateItem.photo
  }
  await apiFetch(HttpMethods.PATCH, `/items/${id}`, requestBody)
}

export async function ApiDeleteItem(id: string) {
  await apiFetch(HttpMethods.DELETE, `/items/${id}`)
}

export async function ApiCreateUser(createUser: CreateUser) {
  const requestBody = {
    name: createUser.name,
    password: createUser.password
  }
  const result: Partial<User> = await apiFetch(HttpMethods.POST, "/users", requestBody)
  return result.id
}

export async function ApiGetAllUsers() {
  const result: SafeUser = await apiFetch(HttpMethods.GET, "/users")
  return result
}

export async function ApiGetUser(id: string) {
  const result: SafeUser = await apiFetch(HttpMethods.GET, `/users/${id}`)
  return result
}

export async function ApiDeleteUser(id: string) {
  await apiFetch(HttpMethods.DELETE, `/users/${id}`)
}