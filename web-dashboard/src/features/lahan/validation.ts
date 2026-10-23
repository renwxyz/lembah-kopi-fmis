import { z } from "zod";

export const createLahanSchema = z.object({
  id_petani: z.string().min(1, "Petani pemilik lahan wajib dipilih"),
  nama_petak: z
    .string()
    .min(1, "Nama petak wajib diisi")
    .max(50, "Nama petak maksimal 50 karakter"),
  dusun: z
    .string()
    .min(1, "Dusun wajib diisi")
    .max(50, "Dusun maksimal 50 karakter"),
  elevasi_mdpl: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type CreateLahanSchema = z.infer<typeof createLahanSchema>;
