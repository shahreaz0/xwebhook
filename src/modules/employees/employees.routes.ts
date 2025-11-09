import { Elysia, status } from "elysia";
import { prisma } from "../../../prisma";
import { EmployeeCreateSchema, EmployeeSchema } from "./employees.schemas";
import { z } from "zod";
import { callWebhooks } from "../webhooks/webhooks.services";

export const employees = new Elysia({ tags: ["Employees"], prefix: "/employees" });

employees
  .get(
    "/",
    async (ctx) => {
      const webhooks = await prisma.webhook.findMany({
        where: {
          orgId: (ctx.store as any).orgId,
        },
      });

      const parsedWebhook = z.array(EmployeeSchema).parse(webhooks);

      return {
        status: "success",
        data: parsedWebhook,
      };
    },
    {
      response: {
        200: z.object({
          status: z.string(),
          data: z.array(EmployeeSchema),
        }),
      },
    }
  )
  .post(
    "/",
    async (ctx) => {
      const orgId = (ctx.store as any).orgId;
      const createdEmployee = await prisma.employee.create({
        data: {
          ...ctx.body,
          orgId: (ctx.store as any).orgId,
        },
      });

      callWebhooks("employee.created", orgId, createdEmployee);

      ctx.set.status = 201;
      return { message: "Employee created", data: createdEmployee };
    },
    {
      body: EmployeeCreateSchema,
      response: {
        201: z.object({ message: z.string(), data: EmployeeSchema }),
      },
    }
  )
  .delete(
    "/:id",
    async (ctx) => {
      const existedWebhook = await prisma.webhook.findUnique({
        where: {
          orgId: (ctx.store as any).orgId,
          id: ctx.params.id,
        },
      });

      if (!existedWebhook) {
        return status(404, {
          message: "Webhook not found with the given ID",
          status: "Not found",
        });
      }

      const deletedWebhook = await prisma.webhook.delete({
        where: {
          orgId: (ctx.store as any).orgId,
          id: ctx.params.id,
        },
      });

      return { message: "Webhooks deleted", data: EmployeeSchema.parse(deletedWebhook) };
    },
    {
      params: z.object({ id: z.cuid2() }),
      response: {
        200: z.object({ message: z.string(), data: EmployeeSchema }),
        404: z.object({ status: z.string(), message: z.string() }),
      },
    }
  );
