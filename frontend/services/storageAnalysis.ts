export interface StorageTrend {
  date: string;
  size: number; // MB
}

export interface FileTypeStat {
  type: string;
  size: number; // MB
  count: number;
}

export interface HotFile {
  id: string;
  name: string;
  path: string;
  size: number;
  accessCount: number;
  lastAccessed: string;
  owner: string;
}

export interface QuotaInfo {
  total: number; // GB
  used: number; // GB
  warningThreshold: number; // %
}

export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: number;
  updatedAt: string;
  extension?: string;
}

// Mock Data
const MOCK_TRENDS: StorageTrend[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split("T")[0],
    size: 100 + i * 2 + Math.random() * 10,
  };
});

const MOCK_TYPES: FileTypeStat[] = [
  { type: "Images", size: 450, count: 1200 },
  { type: "Documents", size: 320, count: 500 },
  { type: "Videos", size: 850, count: 50 },
  { type: "Archives", size: 200, count: 30 },
  { type: "Code", size: 50, count: 5000 },
  { type: "Others", size: 100, count: 200 },
];

const MOCK_HOT_FILES: HotFile[] = [
  {
    id: "1",
    name: "design_spec_v2.pdf",
    path: "/projects/design/design_spec_v2.pdf",
    size: 15 * 1024 * 1024,
    accessCount: 150,
    lastAccessed: "2023-10-25 10:30",
    owner: "Alice",
  },
  {
    id: "2",
    name: "demo_video.mp4",
    path: "/marketing/demo_video.mp4",
    size: 250 * 1024 * 1024,
    accessCount: 120,
    lastAccessed: "2023-10-24 14:20",
    owner: "Bob",
  },
  {
    id: "3",
    name: "main_bundle.js",
    path: "/builds/v1.0/main_bundle.js",
    size: 5 * 1024 * 1024,
    accessCount: 98,
    lastAccessed: "2023-10-25 09:15",
    owner: "System",
  },
  {
    id: "4",
    name: "logo_high_res.png",
    path: "/assets/logo_high_res.png",
    size: 2 * 1024 * 1024,
    accessCount: 85,
    lastAccessed: "2023-10-23 11:00",
    owner: "Carol",
  },
  {
    id: "5",
    name: "quarterly_report.xlsx",
    path: "/finance/quarterly_report.xlsx",
    size: 1 * 1024 * 1024,
    accessCount: 72,
    lastAccessed: "2023-10-20 16:45",
    owner: "Dave",
  },
];

const MOCK_FILES: FileItem[] = [
  { id: "f1", name: "Documents", type: "folder", updatedAt: "2023-10-20" },
  { id: "f2", name: "Images", type: "folder", updatedAt: "2023-10-21" },
  {
    id: "f3",
    name: "Project Specs.pdf",
    type: "file",
    size: 2500000,
    updatedAt: "2023-10-22",
    extension: "pdf",
  },
  {
    id: "f4",
    name: "Logo.png",
    type: "file",
    size: 1500000,
    updatedAt: "2023-10-22",
    extension: "png",
  },
  {
    id: "f5",
    name: "Notes.txt",
    type: "file",
    size: 1024,
    updatedAt: "2023-10-23",
    extension: "txt",
  },
  {
    id: "f6",
    name: "Report.docx",
    type: "file",
    size: 5000000,
    updatedAt: "2023-10-24",
    extension: "docx",
  },
  {
    id: "f7",
    name: "Script.js",
    type: "file",
    size: 2048,
    updatedAt: "2023-10-25",
    extension: "js",
  },
  {
    id: "f8",
    name: "Data.json",
    type: "file",
    size: 4096,
    updatedAt: "2023-10-25",
    extension: "json",
  },
];

export const getStorageTrends = async (): Promise<StorageTrend[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_TRENDS), 500));
};

export const getFileTypeDistribution = async (): Promise<FileTypeStat[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_TYPES), 500));
};

export const getHotFiles = async (): Promise<HotFile[]> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_HOT_FILES), 500)
  );
};

export const getQuotaInfo = async (): Promise<QuotaInfo> => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          total: 100,
          used: 45.5,
          warningThreshold: 80,
        }),
      500
    )
  );
};

export const listFiles = async (path: string = "/"): Promise<FileItem[]> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (path === "/") return resolve(MOCK_FILES);
      if (path.includes("Documents")) {
        return resolve([
          {
            id: "d1",
            name: "Project_Plan.docx",
            type: "file",
            size: 1200000,
            updatedAt: "2023-10-25",
            extension: "docx",
          },
          {
            id: "d2",
            name: "Budget.xlsx",
            type: "file",
            size: 500000,
            updatedAt: "2023-10-24",
            extension: "xlsx",
          },
        ]);
      }
      if (path.includes("Images")) {
        return resolve([
          {
            id: "i1",
            name: "Banner.png",
            type: "file",
            size: 3000000,
            updatedAt: "2023-10-25",
            extension: "png",
          },
          {
            id: "i2",
            name: "Icon.svg",
            type: "file",
            size: 20000,
            updatedAt: "2023-10-24",
            extension: "svg",
          },
        ]);
      }
      resolve([]);
    }, 300)
  );
};

export const updateQuota = async (
  _total: number,
  _warningThreshold: number
): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};
