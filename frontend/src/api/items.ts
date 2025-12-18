import { api } from './http';

export interface Item {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateItemData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
}

export interface ItemsResponse {
  items: Item[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ItemsQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority';
  sortDir?: 'asc' | 'desc';
}

export const itemsApi = {
  getItems: async (params: ItemsQueryParams = {}) => {
    const response = await api.get<ItemsResponse>('/items', { params });
    return response.data;
  },

  getItem: async (id: number) => {
    const response = await api.get<{ item: Item }>(`/items/${id}`);
    return response.data;
  },

  createItem: async (data: CreateItemData) => {
    const response = await api.post<{ item: Item }>('/items', data);
    return response.data;
  },

  updateItem: async (id: number, data: UpdateItemData) => {
    const response = await api.patch<{ item: Item }>(`/items/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: number) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },
};
