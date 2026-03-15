// URL base do backend — troque se mudar de servidor
const BASE = import.meta.env.VITE_API_URL || 'https://francagestao.onrender.com';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (password: string) => req<{ success: boolean }>('POST', '/login', { password }),

  // Tasks
  getTasks: () => req<any[]>('GET', '/tasks'),
  addTask: (data: object) => req<any>('POST', '/tasks', data),
  updateTask: (id: string, data: object) => req<any>('PATCH', `/tasks/${id}`, data),
  deleteTask: (id: string) => req<any>('DELETE', `/tasks/${id}`),

  // Missions
  getMissions: () => req<any[]>('GET', '/missions'),
  addMission: (data: object) => req<any>('POST', '/missions', data),
  updateMission: (id: string, data: object) => req<any>('PATCH', `/missions/${id}`, data),
  deleteMission: (id: string) => req<any>('DELETE', `/missions/${id}`),

  // Notes
  getNotes: () => req<any[]>('GET', '/notes'),
  addNote: (data: object) => req<any>('POST', '/notes', data),
  updateNote: (id: string, data: object) => req<any>('PATCH', `/notes/${id}`, data),
  deleteNote: (id: string) => req<any>('DELETE', `/notes/${id}`),

  // Purchases
  getPurchases: () => req<any[]>('GET', '/purchases'),
  addPurchase: (data: object) => req<any>('POST', '/purchases', data),
  updatePurchase: (id: string, data: object) => req<any>('PATCH', `/purchases/${id}`, data),
  deletePurchase: (id: string) => req<any>('DELETE', `/purchases/${id}`),

  // Sales
  getSales: () => req<any[]>('GET', '/sales'),
  addSale: (data: object) => req<any>('POST', '/sales', data),
  deleteSale: (id: string) => req<any>('DELETE', `/sales/${id}`),

  // Deliveries
  getDeliveries: () => req<any[]>('GET', '/deliveries'),
  addDelivery: (data: object) => req<any>('POST', '/deliveries', data),
  updateDelivery: (id: string, data: object) => req<any>('PATCH', `/deliveries/${id}`, data),
  deleteDelivery: (id: string) => req<any>('DELETE', `/deliveries/${id}`),
};
