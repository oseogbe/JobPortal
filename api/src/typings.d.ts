/**
 * @copyright 2025 Osememen Ogbe
 * @license Apache-2.0
 */

export interface UploadResult {
  url: string;
  publicId?: string;
}

export interface IStorageProvider {
  uploadImage(buffer: Buffer, options?: { folder?: string; filename?: string }): Promise<UploadResult>;
  uploadFile(buffer: Buffer, options?: { folder?: string; filename?: string }): Promise<UploadResult>;
  delete(publicId: string, resourceType: 'image' | 'raw' | 'auto' = 'image'): Promise<void>;
}
