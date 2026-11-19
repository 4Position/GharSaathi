const prisma = require("../config/prisma");

const leaseInclude = {
  application: {
    include: {
      property: {
        include: {
          images: { orderBy: { createdAt: "asc" } },
          landlord: { select: { id: true, name: true } },
        },
      },
      tenant: { select: { id: true, name: true, email: true } },
    },
  },
};

function createError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

async function createLease(landlordId, data) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const application = await tx.application.findUnique({
            where: { id: data.applicationId },
            include: { property: true, lease: true },
          });
          if (!application) throw createError(404, "Application not found.");
          if (application.property.landlordId !== landlordId)
            throw createError(
              403,
              "You do not have permission to create this lease.",
            );
          if (application.status !== "APPROVED")
            throw createError(
              409,
              "A lease can only be created for an approved application.",
            );
          if (application.lease)
            throw createError(
              409,
              "A lease already exists for this application.",
            );
          const activeLease = await tx.lease.findFirst({
            where: {
              status: "ACTIVE",
              application: { propertyId: application.propertyId },
            },
          });
          if (activeLease)
            throw createError(
              409,
              "This property already has an active lease.",
            );
          return tx.lease.create({
            data: {
              applicationId: application.id,
              monthlyRent: application.property.rent,
              startDate: data.startDate,
              endDate: data.endDate,
              status: "ACTIVE",
            },
            include: leaseInclude,
          });
        },
        { isolationLevel: "Serializable" },
      );
    } catch (error) {
      if (error.code === "P2034" && attempt < 2) continue;
      if (error.code === "P2002")
        throw createError(409, "A lease already exists for this application.");
      throw error;
    }
  }
}

function listMyLeases(userId, role) {
  const where =
    role === "LANDLORD"
      ? { application: { property: { landlordId: userId } } }
      : { application: { tenantId: userId } };
  return prisma.lease.findMany({
    where,
    include: leaseInclude,
    orderBy: { createdAt: "desc" },
  });
}

async function getLeaseForUser(id, userId, role) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: leaseInclude,
  });
  if (!lease) throw createError(404, "Lease not found.");
  const allowed =
    role === "LANDLORD"
      ? lease.application.property.landlordId === userId
      : lease.application.tenantId === userId;
  if (!allowed)
    throw createError(403, "You do not have permission to view this lease.");
  return lease;
}

async function updateLeaseStatus(id, landlordId, status) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: { application: { include: { property: true } } },
  });
  if (!lease) throw createError(404, "Lease not found.");
  if (lease.application.property.landlordId !== landlordId)
    throw createError(403, "You do not have permission to update this lease.");
  if (status === "ACTIVE") {
    const activeLease = await prisma.lease.findFirst({
      where: {
        id: { not: id },
        status: "ACTIVE",
        application: { propertyId: lease.application.propertyId },
      },
    });
    if (activeLease)
      throw createError(409, "This property already has another active lease.");
  }
  return prisma.lease.update({
    where: { id },
    data: { status },
    include: leaseInclude,
  });
}

module.exports = {
  createLease,
  listMyLeases,
  getLeaseForUser,
  updateLeaseStatus,
};
