import { z } from "zod";

export const EmployeeSchema = z.object({
  id: z.cuid2(),
  orgId: z.cuid2(),
  name: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EmployeeCreateSchema = EmployeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  orgId: true,
});
