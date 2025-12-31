import { Compilation } from "../types";

// Mock Data for Compilations
export const MOCK_COMPILATIONS: Compilation[] = [
  {
    id: "c1",
    name: "Online Deployment V1",
    templateId: "t1",
    templateName: "Standard Web Template",
    templateVersion: "1.0.0",
    customerId: "cus1",
    customerName: "Acme Corp",
    environmentId: "env1",
    environmentName: "Production",
    status: "Success",
    lastBuildTime: "2023-10-27 10:00:00",
    lastBuilder: "Admin",
    createdBy: "Admin",
    createdAt: "2023-10-26 09:00:00",
    globalConfigs: [],
    moduleConfigs: [],
  },
  {
    id: "c2",
    name: "Test Environment V2",
    templateId: "t1",
    templateName: "Standard Web Template",
    templateVersion: "1.0.1",
    customerId: "cus2",
    customerName: "Beta Inc",
    environmentId: "env2",
    environmentName: "Staging",
    status: "Failed",
    lastBuildTime: "2023-10-28 14:30:00",
    lastBuilder: "Developer",
    createdBy: "Admin",
    createdAt: "2023-10-28 14:00:00",
    globalConfigs: [],
    moduleConfigs: [],
  },
];

let compilations = [...MOCK_COMPILATIONS];

export const listCompilations = async (query: any) => {
  return new Promise<{
    items: Compilation[];
    meta: { total: number; page: number; pageSize: number };
  }>((resolve) => {
    setTimeout(() => {
      let filtered = [...compilations];
      if (query.name) {
        filtered = filtered.filter((c) =>
          c.name.toLowerCase().includes(query.name.toLowerCase())
        );
      }
      resolve({
        items: filtered,
        meta: {
          total: filtered.length,
          page: query.page || 1,
          pageSize: query.pageSize || 10,
        },
      });
    }, 500);
  });
};

export const getCompilation = async (id: string) => {
  return new Promise<Compilation>((resolve, reject) => {
    setTimeout(() => {
      const found = compilations.find((c) => c.id === id);
      if (found) resolve(found);
      else reject(new Error("Compilation not found"));
    }, 300);
  });
};

export const createCompilation = async (data: Partial<Compilation>) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const newId = `c${Date.now()}`;
      compilations.unshift({
        ...data,
        id: newId,
        status: "Idle",
        createdAt: new Date().toISOString(),
        createdBy: "Admin", // Mock user
        globalConfigs: data.globalConfigs || [],
        moduleConfigs: data.moduleConfigs || [],
      } as Compilation);
      resolve();
    }, 500);
  });
};

export const updateCompilation = async (
  id: string,
  data: Partial<Compilation>
) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      const idx = compilations.findIndex((c) => c.id === id);
      if (idx !== -1) {
        compilations[idx] = { ...compilations[idx], ...data };
        resolve();
      } else {
        reject(new Error("Not found"));
      }
    }, 500);
  });
};

export const deleteCompilation = async (id: string) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      compilations = compilations.filter((c) => c.id !== id);
      resolve();
    }, 300);
  });
};
