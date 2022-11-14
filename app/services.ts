export interface Item {
  id: string;
  label: string;
}

export interface ItemsService {
  getAllItems(): Promise<Item[]>;
  getItemById(id: string): Promise<Item | undefined>;
  createItem({ label }: { label: string }): Promise<string>;
  deleteItemById(id: string): Promise<void>;
}

export interface AuthService {
  getUserId(request: Request): Promise<string | undefined>;
  requireUserId(request: Request): Promise<string>;
  setUserId(request: Request, userId: string): Promise<string>;
  clearSession(request: Request): Promise<string>;
}
