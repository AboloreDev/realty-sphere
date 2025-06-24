import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Define valid model names for type safety
type ModelName =
  | "user"
  | "location"
  | "property"
  | "lease"
  | "application"
  | "payment";

type PrismaModel = {
  [K in ModelName]: {
    create: (args: { data: any }) => Promise<any>;
    deleteMany: (args?: any) => Promise<any>;
    findMany: (args: any) => Promise<any>;
    findUnique: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
  };
};

const prisma = new PrismaClient() as PrismaClient & PrismaModel;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

async function insertLocationData(locations: any[]): Promise<void> {
  for (const location of locations) {
    const { id, country, city, state, address, postalCode, coordinates } =
      location;
    try {
      await prisma.$executeRaw`
        INSERT INTO "Location" ("id", "country", "city", "state", "address", "postalCode", "coordinates")
        VALUES (${id}, ${country}, ${city}, ${state}, ${address}, ${postalCode}, ST_GeomFromText(${coordinates}, 4326));
      `;
      console.log(`Inserted location for ${city}`);
    } catch (error: unknown) {
      console.error(
        `Error inserting location for ${city}:`,
        (error as Error).message
      );
      throw error;
    }
  }
}

async function resetSequence(modelName: string): Promise<void> {
  const quotedModelName = `"${toPascalCase(modelName)}"`;
  try {
    const maxIdResult = await prisma[modelName as ModelName].findMany({
      select: { id: true },
      orderBy: { id: "desc" },
      take: 1,
    });

    if (maxIdResult.length === 0) return;

    const nextId =
      typeof maxIdResult[0].id === "number" ? maxIdResult[0].id + 1 : 1;
    if (typeof maxIdResult[0].id === "number") {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('${quotedModelName}', 'id'), COALESCE((SELECT MAX(id) + 1 FROM ${quotedModelName}), ${nextId}), false);`
      );
      console.log(`Reset sequence for ${modelName} to ${nextId}`);
    }
  } catch (error: unknown) {
    console.error(
      `Error resetting sequence for ${modelName}:`,
      (error as Error).message
    );
    throw error;
  }
}

async function deleteAllData(orderedFileNames: string[]): Promise<void> {
  const modelNames = orderedFileNames.map((fileName) =>
    toPascalCase(path.basename(fileName, path.extname(fileName)))
  );

  for (const modelName of modelNames.reverse()) {
    const modelNameCamel = toCamelCase(modelName) as ModelName;
    try {
      await prisma[modelNameCamel].deleteMany({});
      console.log(`Cleared data for ${modelName}`);
    } catch (error: unknown) {
      console.error(
        `Error clearing data for ${modelName}:`,
        (error as Error).message
      );
      throw error;
    }
  }
}

async function validateForeignKeys(
  fileName: string,
  jsonData: any[]
): Promise<boolean> {
  const modelName = toPascalCase(
    path.basename(fileName, path.extname(fileName))
  );

  try {
    if (modelName === "Property") {
      const managerIds = new Set(jsonData.map((item: any) => item.managerId));
      const locationIds = new Set(jsonData.map((item: any) => item.locationId));
      for (const managerId of managerIds) {
        const user = await prisma.user.findUnique({ where: { id: managerId } });
        if (!user || user.role !== "MANAGER") {
          console.error(`Invalid managerId ${managerId} in ${fileName}`);
          return false;
        }
      }
      for (const locationId of locationIds) {
        const location = await prisma.location.findUnique({
          where: { id: locationId },
        });
        if (!location) {
          console.error(`Invalid locationId ${locationId} in ${fileName}`);
          return false;
        }
      }
    } else if (modelName === "Lease") {
      const tenantIds = new Set(jsonData.map((item: any) => item.tenantId));
      const propertyIds = new Set(jsonData.map((item: any) => item.propertyId));
      for (const tenantId of tenantIds) {
        const user = await prisma.user.findUnique({ where: { id: tenantId } });
        if (!user || user.role !== "TENANT") {
          console.error(`Invalid tenantId ${tenantId} in ${fileName}`);
          return false;
        }
      }
      for (const propertyId of propertyIds) {
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
        });
        if (!property) {
          console.error(`Invalid propertyId ${propertyId} in ${fileName}`);
          return false;
        }
      }
    } else if (modelName === "Application") {
      const tenantIds = new Set(jsonData.map((item: any) => item.tenantId));
      const propertyIds = new Set(jsonData.map((item: any) => item.propertyId));
      const leaseIds = jsonData
        .map((item: any) => item.leaseId)
        .filter((id: any) => id !== undefined);
      for (const tenantId of tenantIds) {
        const user = await prisma.user.findUnique({ where: { id: tenantId } });
        if (!user || user.role !== "TENANT") {
          console.error(`Invalid tenantId ${tenantId} in ${fileName}`);
          return false;
        }
      }
      for (const propertyId of propertyIds) {
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
        });
        if (!property) {
          console.error(`Invalid propertyId ${propertyId} in ${fileName}`);
          return false;
        }
      }
      for (const leaseId of leaseIds) {
        const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
        if (!lease) {
          console.error(`Invalid leaseId ${leaseId} in ${fileName}`);
          return false;
        }
      }
    } else if (modelName === "Payment") {
      const leaseIds = new Set(jsonData.map((item: any) => item.leaseId));
      for (const leaseId of leaseIds) {
        const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
        if (!lease) {
          console.error(`Invalid leaseId ${leaseId} in ${fileName}`);
          return false;
        }
      }
    }
    return true;
  } catch (error: unknown) {
    console.error(
      `Error validating foreign keys for ${fileName}:`,
      (error as Error).message
    );
    return false;
  }
}

async function seedRelations(): Promise<void> {
  const filePath = path.join(__dirname, "seedData", "relations.json");
  let relationsData: any[];
  try {
    relationsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error: unknown) {
    console.error(
      `Error reading or parsing relations.json:`,
      (error as Error).message
    );
    return;
  }

  for (const relation of relationsData) {
    const { userId, tenantProperties, favorites } = relation;
    try {
      const updateData: { tenantProperties?: any; favorites?: any } = {};
      if (tenantProperties?.connect) {
        for (const prop of tenantProperties.connect) {
          const property = await prisma.property.findUnique({
            where: { id: prop.id },
          });
          if (!property) {
            console.error(
              `Invalid propertyId ${prop.id} for user ${userId} in tenantProperties`
            );
            continue;
          }
        }
        updateData.tenantProperties = { connect: tenantProperties.connect };
      }
      if (favorites?.connect) {
        for (const prop of favorites.connect) {
          const property = await prisma.property.findUnique({
            where: { id: prop.id },
          });
          if (!property) {
            console.error(
              `Invalid propertyId ${prop.id} for user ${userId} in favorites`
            );
            continue;
          }
        }
        updateData.favorites = { connect: favorites.connect };
      }
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
        console.log(`Updated relations for user ${userId}`);
      }
    } catch (error: unknown) {
      console.error(
        `Error updating relations for user ${userId}:`,
        (error as Error).message
      );
    }
  }
}

async function main(): Promise<void> {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "user.json",
    "location.json",
    "property.json",
    "lease.json",
    "application.json",
    "payment.json",
  ];

  // Delete all existing data
  await prisma.otp.deleteMany({});
  console.log("Cleared data for Otp");
  await deleteAllData(orderedFileNames);

  // Seed data
  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    let jsonData: any[];
    try {
      jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (error: unknown) {
      console.error(
        `Error reading or parsing ${fileName}:`,
        (error as Error).message
      );
      continue;
    }

    const modelName = toPascalCase(
      path.basename(fileName, path.extname(fileName))
    );
    const modelNameCamel = toCamelCase(modelName) as ModelName;

    // Validate foreign keys before seeding
    if (["Property", "Lease", "Application", "Payment"].includes(modelName)) {
      const isValid = await validateForeignKeys(fileName, jsonData);
      if (!isValid) {
        throw new Error(
          `Skipping seeding for ${modelName} due to invalid foreign keys`
        );
      }
    }

    if (modelName === "Location") {
      await insertLocationData(jsonData);
    } else if (modelName === "User") {
      for (const user of jsonData) {
        await prisma.user.create({
          data: {
            ...user,
            createdAt: new Date(user.createdAt),
            password: await bcrypt.hash("password123", 10), // Replace with actual hash if needed
          },
        });
        console.log(`Created user ${user.email}`);
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } else {
      for (const item of jsonData) {
        await prisma[modelNameCamel].create({
          data: {
            ...item,
            ...(modelName === "Application" ||
            modelName === "Lease" ||
            modelName === "Payment"
              ? {
                  applicationDate: item.applicationDate
                    ? new Date(item.applicationDate)
                    : undefined,
                  startDate: item.startDate
                    ? new Date(item.startDate)
                    : undefined,
                  endDate: item.endDate ? new Date(item.endDate) : undefined,
                  dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
                  paymentDate: item.paymentDate
                    ? new Date(item.paymentDate)
                    : undefined,
                }
              : {}),
          },
        });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    }

    // Reset sequence for models with numeric IDs
    if (modelName !== "User") {
      await resetSequence(modelNameCamel);
    }

    await sleep(500);
  }

  // Seed relations
  await seedRelations();
}

main()
  .catch((e: Error) => {
    console.error("Error in main:", e.message);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
