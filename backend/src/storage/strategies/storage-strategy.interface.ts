import { Readable } from 'stream';

export interface FileInfo {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

export interface StorageStrategy {
  /**
   * 上传文件
   * @param file Multer文件对象
   * @param folder 目标文件夹
   */
  upload(file: Express.Multer.File, folder?: string): Promise<FileInfo>;

  /**
   * 上传原始数据
   * @param payload 包含Buffer和元数据的对象
   * @param folder 目标文件夹
   */
  uploadRaw(
    payload: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    folder?: string,
  ): Promise<FileInfo>;

  /**
   * 下载文件
   * @param path 文件路径
   * @param range 字节范围(可选)
   */
  download(
    path: string,
    range?: { start: number; end?: number },
  ): Promise<{ stream: Readable; size: number }>;

  /**
   * 删除文件
   * @param path 文件路径
   */
  delete(path: string): Promise<void>;

  /**
   * 检查文件是否存在
   * @param path 文件路径
   */
  exists(path: string): Promise<boolean>;

  /**
   * 移动文件
   * @param sourcePath 源文件路径
   * @param destinationPath 目标文件路径
   */
  move(sourcePath: string, destinationPath: string): Promise<void>;
}
