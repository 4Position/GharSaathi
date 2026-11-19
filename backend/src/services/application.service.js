const prisma = require("../config/prisma");

const applicationInclude = {
  property: { include: { images: { orderBy: { createdAt: "asc" } } } },
  tenant: { select: { id: true, name: true, email: true } },
};

function createError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

async function submitApplication(tenantId, propertyId, message) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, status: true },
  });
  if (!property) throw createError(404, "Property not found.");
  if (property.status !== "AVAILABLE")
    throw createError(409, "Applications are not available for this property.");

  try {
    return await prisma.application.create({
      data: { propertyId, tenantId, message },
      include: applicationInclude,
    });
  } catch (error) {
    if (error.code === "P2002")
      throw createError(409, "You have already applied for this property.");
    throw error;
  }
}

function listTenantApplications(tenantId) {
  return prisma.application.findMany({
    where: { tenantId },
    include: applicationInclude,
    orderBy: { createdAt: "desc" },
  });
}

function listReceivedApplications(landlordId) {
  return prisma.application.findMany({
    where: { property: { landlordId } },
    include: applicationInclude,
    orderBy: { createdAt: "desc" },
  });
}

async function reviewApplication(id, landlordId, status) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: { property: { select: { id: true, landlordId: true } } },
  });
  if (!application) throw createError(404, "Application not found.");
  if (application.property.landlordId !== landlordId)
    throw createError(
      403,
      "You do not have permission to review this application.",
    );
  if (application.status !== "PENDING")
    throw createError(409, "Only pending applications can be reviewed.");

  if (status === "APPROVED") {
    const activeLease = await prisma.lease.findFirst({
      where: {
        status: "ACTIVE",
        application: { propertyId: application.property.id },
      },
    });
    if (activeLease)
      throw createError(409, "This property already has an active lease.");
  }

  return prisma.application.update({
    where: { id },
    data: { status },
    include: applicationInclude,
  });
}

module.exports = {
  submitApplication,
  listTenantApplications,
  listReceivedApplications,
  reviewApplication,
};
