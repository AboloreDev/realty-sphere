"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function toPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
function insertLocationData(locations) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const location of locations) {
            const { id, country, city, state, address, postalCode, coordinates } = location;
            try {
                yield prisma.$executeRaw `
        INSERT INTO "Location" ("id", "country", "city", "state", "address", "postalCode", "coordinates")
        VALUES (${id}, ${country}, ${city}, ${state}, ${address}, ${postalCode}, ST_GeomFromText(${coordinates}, 4326));
      `;
                console.log(`Inserted location for ${city}`);
            }
            catch (error) {
                console.error(`Error inserting location for ${city}:`, error.message);
                throw error;
            }
        }
    });
}
function resetSequence(modelName) {
    return __awaiter(this, void 0, void 0, function* () {
        const quotedModelName = `"${toPascalCase(modelName)}"`;
        try {
            const maxIdResult = yield prisma[modelName].findMany({
                select: { id: true },
                orderBy: { id: "desc" },
                take: 1,
            });
            if (maxIdResult.length === 0)
                return;
            const nextId = typeof maxIdResult[0].id === "number" ? maxIdResult[0].id + 1 : 1;
            if (typeof maxIdResult[0].id === "number") {
                yield prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('${quotedModelName}', 'id'), COALESCE((SELECT MAX(id) + 1 FROM ${quotedModelName}), ${nextId}), false);`);
                console.log(`Reset sequence for ${modelName} to ${nextId}`);
            }
        }
        catch (error) {
            console.error(`Error resetting sequence for ${modelName}:`, error.message);
            throw error;
        }
    });
}
function deleteAllData(orderedFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelNames = orderedFileNames.map((fileName) => toPascalCase(path_1.default.basename(fileName, path_1.default.extname(fileName))));
        for (const modelName of modelNames.reverse()) {
            const modelNameCamel = toCamelCase(modelName);
            try {
                yield prisma[modelNameCamel].deleteMany({});
                console.log(`Cleared data for ${modelName}`);
            }
            catch (error) {
                console.error(`Error clearing data for ${modelName}:`, error.message);
                throw error;
            }
        }
    });
}
function validateForeignKeys(fileName, jsonData) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelName = toPascalCase(path_1.default.basename(fileName, path_1.default.extname(fileName)));
        try {
            if (modelName === "Property") {
                const managerIds = new Set(jsonData.map((item) => item.managerId));
                const locationIds = new Set(jsonData.map((item) => item.locationId));
                for (const managerId of managerIds) {
                    const user = yield prisma.user.findUnique({ where: { id: managerId } });
                    if (!user || user.role !== "MANAGER") {
                        console.error(`Invalid managerId ${managerId} in ${fileName}`);
                        return false;
                    }
                }
                for (const locationId of locationIds) {
                    const location = yield prisma.location.findUnique({
                        where: { id: locationId },
                    });
                    if (!location) {
                        console.error(`Invalid locationId ${locationId} in ${fileName}`);
                        return false;
                    }
                }
            }
            else if (modelName === "Lease") {
                const tenantIds = new Set(jsonData.map((item) => item.tenantId));
                const propertyIds = new Set(jsonData.map((item) => item.propertyId));
                for (const tenantId of tenantIds) {
                    const user = yield prisma.user.findUnique({ where: { id: tenantId } });
                    if (!user || user.role !== "TENANT") {
                        console.error(`Invalid tenantId ${tenantId} in ${fileName}`);
                        return false;
                    }
                }
                for (const propertyId of propertyIds) {
                    const property = yield prisma.property.findUnique({
                        where: { id: propertyId },
                    });
                    if (!property) {
                        console.error(`Invalid propertyId ${propertyId} in ${fileName}`);
                        return false;
                    }
                }
            }
            else if (modelName === "Application") {
                const tenantIds = new Set(jsonData.map((item) => item.tenantId));
                const propertyIds = new Set(jsonData.map((item) => item.propertyId));
                const leaseIds = jsonData
                    .map((item) => item.leaseId)
                    .filter((id) => id !== undefined);
                for (const tenantId of tenantIds) {
                    const user = yield prisma.user.findUnique({ where: { id: tenantId } });
                    if (!user || user.role !== "TENANT") {
                        console.error(`Invalid tenantId ${tenantId} in ${fileName}`);
                        return false;
                    }
                }
                for (const propertyId of propertyIds) {
                    const property = yield prisma.property.findUnique({
                        where: { id: propertyId },
                    });
                    if (!property) {
                        console.error(`Invalid propertyId ${propertyId} in ${fileName}`);
                        return false;
                    }
                }
                for (const leaseId of leaseIds) {
                    const lease = yield prisma.lease.findUnique({ where: { id: leaseId } });
                    if (!lease) {
                        console.error(`Invalid leaseId ${leaseId} in ${fileName}`);
                        return false;
                    }
                }
            }
            else if (modelName === "Payment") {
                const leaseIds = new Set(jsonData.map((item) => item.leaseId));
                for (const leaseId of leaseIds) {
                    const lease = yield prisma.lease.findUnique({ where: { id: leaseId } });
                    if (!lease) {
                        console.error(`Invalid leaseId ${leaseId} in ${fileName}`);
                        return false;
                    }
                }
            }
            return true;
        }
        catch (error) {
            console.error(`Error validating foreign keys for ${fileName}:`, error.message);
            return false;
        }
    });
}
function seedRelations() {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = path_1.default.join(__dirname, "seedData", "relations.json");
        let relationsData;
        try {
            relationsData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        }
        catch (error) {
            console.error(`Error reading or parsing relations.json:`, error.message);
            return;
        }
        for (const relation of relationsData) {
            const { userId, tenantProperties, favorites } = relation;
            try {
                const updateData = {};
                if (tenantProperties === null || tenantProperties === void 0 ? void 0 : tenantProperties.connect) {
                    for (const prop of tenantProperties.connect) {
                        const property = yield prisma.property.findUnique({
                            where: { id: prop.id },
                        });
                        if (!property) {
                            console.error(`Invalid propertyId ${prop.id} for user ${userId} in tenantProperties`);
                            continue;
                        }
                    }
                    updateData.tenantProperties = { connect: tenantProperties.connect };
                }
                if (favorites === null || favorites === void 0 ? void 0 : favorites.connect) {
                    for (const prop of favorites.connect) {
                        const property = yield prisma.property.findUnique({
                            where: { id: prop.id },
                        });
                        if (!property) {
                            console.error(`Invalid propertyId ${prop.id} for user ${userId} in favorites`);
                            continue;
                        }
                    }
                    updateData.favorites = { connect: favorites.connect };
                }
                if (Object.keys(updateData).length > 0) {
                    yield prisma.user.update({
                        where: { id: userId },
                        data: updateData,
                    });
                    console.log(`Updated relations for user ${userId}`);
                }
            }
            catch (error) {
                console.error(`Error updating relations for user ${userId}:`, error.message);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
        const orderedFileNames = [
            "user.json",
            "location.json",
            "property.json",
            "lease.json",
            "application.json",
            "payment.json",
        ];
        // Delete all existing data
        yield prisma.otp.deleteMany({});
        console.log("Cleared data for Otp");
        yield deleteAllData(orderedFileNames);
        // Seed data
        for (const fileName of orderedFileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            let jsonData;
            try {
                jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            }
            catch (error) {
                console.error(`Error reading or parsing ${fileName}:`, error.message);
                continue;
            }
            const modelName = toPascalCase(path_1.default.basename(fileName, path_1.default.extname(fileName)));
            const modelNameCamel = toCamelCase(modelName);
            // Validate foreign keys before seeding
            if (["Property", "Lease", "Application", "Payment"].includes(modelName)) {
                const isValid = yield validateForeignKeys(fileName, jsonData);
                if (!isValid) {
                    throw new Error(`Skipping seeding for ${modelName} due to invalid foreign keys`);
                }
            }
            if (modelName === "Location") {
                yield insertLocationData(jsonData);
            }
            else if (modelName === "User") {
                for (const user of jsonData) {
                    yield prisma.user.create({
                        data: Object.assign(Object.assign({}, user), { createdAt: new Date(user.createdAt), password: yield bcryptjs_1.default.hash("password123", 10) }),
                    });
                    console.log(`Created user ${user.email}`);
                }
                console.log(`Seeded ${modelName} with data from ${fileName}`);
            }
            else {
                for (const item of jsonData) {
                    yield prisma[modelNameCamel].create({
                        data: Object.assign(Object.assign({}, item), (modelName === "Application" ||
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
                            : {})),
                    });
                }
                console.log(`Seeded ${modelName} with data from ${fileName}`);
            }
            // Reset sequence for models with numeric IDs
            if (modelName !== "User") {
                yield resetSequence(modelNameCamel);
            }
            yield sleep(500);
        }
        // Seed relations
        yield seedRelations();
    });
}
main()
    .catch((e) => {
    console.error("Error in main:", e.message);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () { return yield prisma.$disconnect(); }));
