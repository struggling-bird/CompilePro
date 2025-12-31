import request from '../utils/request';
import type { Customer } from '../types';

type BackendStatus = 'active' | 'inactive';

type BackendCustomer = {
  id: string;
  name: string;
  status: BackendStatus;
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactDate?: string | null;
  contactAddress?: string | null;
  createdAt: string | Date;
};

const mapToFrontend = (c: BackendCustomer): Customer => ({
  id: c.id,
  name: c.name,
  contactPerson: c.contactPerson ?? '',
  phone: c.contactPhone ?? '',
  email: c.contactEmail ?? '',
  status: c.status === 'active' ? 'Active' : 'Inactive',
  address: c.contactAddress ?? '',
  contractDate: (c.contactDate ?? '') || '',
  deployments: [],
});

export const listCustomers = async (): Promise<Customer[]> => {
  const res = await request<{ list: BackendCustomer[] }>('/apis/customers', {
    method: 'GET',
  });
  return (res.list ?? []).map(mapToFrontend);
};

export const getCustomer = async (id: string): Promise<Customer> => {
  const res = await request<BackendCustomer>(`/apis/customers/${id}`, {
    method: 'GET',
  });
  return mapToFrontend(res);
};

export type SaveCustomerPayload = {
  name: string;
  status: 'Active' | 'Inactive';
  contactPerson?: string;
  phone?: string;
  email?: string;
  contractDate?: string;
  address?: string;
};

const toBackendPayload = (p: SaveCustomerPayload) => ({
  name: p.name,
  status: p.status === 'Active' ? 'active' : 'inactive',
  contactPerson: p.contactPerson,
  contactPhone: p.phone,
  contactEmail: p.email,
  contactDate: p.contractDate,
  contactAddress: p.address,
});

export const createCustomer = async (payload: SaveCustomerPayload): Promise<{ id: string }> => {
  return request<{ id: string }>('/apis/customers', {
    method: 'POST',
    data: toBackendPayload(payload),
  });
};

export const updateCustomer = async (id: string, payload: Partial<SaveCustomerPayload>): Promise<{ id: string }> => {
  return request<{ id: string }>(`/apis/customers/${id}`, {
    method: 'PUT',
    data: toBackendPayload(payload as SaveCustomerPayload),
  });
};

export const deleteCustomer = async (id: string): Promise<{ id: string }> => {
  return request<{ id: string }>(`/apis/customers/${id}`, {
    method: 'DELETE',
  });
};

export const getCustomerEnvironments = async (customerId: string): Promise<any[]> => {
  return request<any[]>(`/apis/customers/${customerId}/environments`, {
    method: 'GET',
  });
};

