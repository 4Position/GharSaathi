const prisma = require("../config/prisma");

const maintenanceInclude = {
  lease: {
    include: {
      application: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              landlordId: true,
            },
          },
          tenant: { select: { id: true, name: true, email: true } },
        },
      },
    },
  },
};

function createError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

async function createMaintenanceRequest(
  tenantId,
  { leaseId, title, description },
) {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: { application: true },
  });
  if (!lease) throw createError(404, "Lease not found.");
  if (lease.application.tenantId !== tenantId)
    throw createError(
      403,
      "You do not have permission to create a request for this lease.",
    );
  if (lease.status !== "ACTIVE")
    throw createError(
      409,
      "Maintenance requests can only be created for active leases.",
    );
  return prisma.maintenanceRequest.create({
    data: { leaseId, title, description, status: "OPEN" },
    include: maintenanceInclude,
  });
}

function listMyMaintenanceRequests(userId, role) {
  const where =
    role === "LANDLORD"
      ? { lease: { application: { property: { landlordId: userId } } } }
      : { lease: { application: { tenantId: userId } } };
  return prisma.maintenanceRequest.findMany({
    where,
    include: maintenanceInclude,
    orderBy: { createdAt: "desc" },
  });
}

async function updateMaintenanceStatus(id, landlordId, status) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      lease: { include: { application: { include: { property: true } } } },
    },
  });
  if (!request) throw createError(404, "Maintenance request not found.");
  if (request.lease.application.property.landlordId !== landlordId)
    throw createError(
      403,
      "You do not have permission to update this maintenance request.",
    );
  return prisma.maintenanceRequest.update({
    where: { id },
    data: { status },
    include: maintenanceInclude,
  });
}

module.exports = {
  createMaintenanceRequest,
  listMyMaintenanceRequests,
  updateMaintenanceStatus,
};
