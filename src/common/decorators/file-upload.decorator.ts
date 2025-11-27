/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { ApiConsumes, ApiBody } from "@nestjs/swagger";
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from "@nestjs/platform-express";
import { diskStorage, memoryStorage } from "multer";
import { extname, basename } from "path";
import { existsSync, mkdirSync } from "fs";
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export type FileUploadOptions = MulterOptions;

export enum UploadType {
  IMAGE = "image",
  VIDEO = "video",
  PROFILE = "profile",
  DOCUMENT = "document",
}

function getUploadPath(type: UploadType) {
  switch (type) {
    case UploadType.IMAGE:
      return "./uploads/images";
    case UploadType.VIDEO:
      return "./uploads/videos";
    case UploadType.PROFILE:
      return "./uploads/profiles";
    case UploadType.DOCUMENT:
      return "./uploads/documents";
    default:
      return "./uploads/others";
  }
}

function defaultStorage(type: UploadType) {
  if (type === UploadType.VIDEO || type === UploadType.IMAGE) {
    return memoryStorage();
  }
  return diskStorage({
    destination: (req, file, callback) => {
      try {
        const dir = getUploadPath(type);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        callback(null, dir);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        callback(e, "");
      }
    },
    filename: (req, file, callback) => {
      // format timestamp as YYYYMMDD_HHMMSS
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(
        d.getHours(),
      )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

      const originalExt = extname(file.originalname) || "";
      const originalName = basename(file.originalname, originalExt)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/(^-|-$)/g, "");

      const uniqueSuffix = `${Math.round(Math.random() * 1e9)}`;
      const filename = `${originalName}-${ts}-${uniqueSuffix}${originalExt}`;
      callback(null, filename);
    },
  });
}

/**
 * Helper decorator for multiple named file fields.
 * Keeps the same API shape as FileUpload but for FileFieldsInterceptor.
 */
export function FileFieldsUpload(
  fields: { name: string; maxCount?: number }[],
  options?: FileUploadOptions,
  type: UploadType = UploadType.IMAGE,
) {
  const finalOptions: FileUploadOptions = {
    storage: defaultStorage(type),
    ...options,
  };

  // Build swagger schema properties for each field
  const properties: Record<string, any> = {};
  for (const f of fields) {
    const isMultiple = typeof f.maxCount === "number" && f.maxCount > 1;
    properties[f.name] = isMultiple
      ? { type: "array", items: { type: "string", format: "binary" } }
      : { type: "string", format: "binary" };
  }

  return applyDecorators(
    ApiConsumes("multipart/form-data"),
    ApiBody({
      schema: {
        type: "object",
        properties,
      },
    }),
    UseInterceptors(FileFieldsInterceptor(fields as any, finalOptions)),
  );
}

export function FileUpload(
  fieldName = "file",
  maxCount?: number,
  options?: FileUploadOptions,
  type: UploadType = UploadType.IMAGE,
) {
  const isMultiple = typeof maxCount === "number" && maxCount > 1;

  const finalOptions: FileUploadOptions = {
    storage: defaultStorage(type),
    ...options,
  };

  const interceptor = isMultiple
    ? FilesInterceptor(fieldName, maxCount, finalOptions)
    : FileInterceptor(fieldName, finalOptions);

  const propertySchema = isMultiple
    ? { type: "array", items: { type: "string", format: "binary" } }
    : { type: "string", format: "binary" };

  return applyDecorators(
    ApiConsumes("multipart/form-data"),
    ApiBody({
      schema: {
        type: "object",
        properties: {
          [fieldName]: propertySchema,
        },
      },
    }),
    UseInterceptors(interceptor),
  );
}
