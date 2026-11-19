const prisma = require("../config/prisma");

const propertyInclude = {
  images: {
    orderBy: { createdAt: "asc" },
  },
  landlord: {
    select: {
      id: true,
      name: true,
    },
  },
};

function createError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

async function getPropertyById(id) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: propertyInclude,
  });

  if (!property) {
    throw createError(404, "Property not found.");
  }

  return property;
}

async function getOwnedProperty(id, landlordId) {
  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, landlordId: true },
  });

  if (!property) {
    throw createError(404, "Property not found.");
  }

  if (property.landlordId !== landlordId) {
    throw createError(
      403,
      "You do not have permission to manage this property.",
    );
  }
}

async function listAvailableProperties(filters) {
  const where = { status: "AVAILABLE" };

  if (filters.city) {
    where.city = { equals: filters.city, mode: "insensitive" };
  }

  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    where.rent = {};

    if (filters.minRent !== undefined) {
      where.rent.gte = filters.minRent;
    }

    if (filters.maxRent !== undefined) {
      where.rent.lte = filters.maxRent;
    }
  }

  if (filters.bedrooms !== undefined) {
    where.bedrooms = filters.bedrooms;
  }

  return prisma.property.findMany({
    where,
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
}

async function createProperty(landlordId, data) {
  const { imageUrls, ...propertyData } = data;

  return prisma.property.create({
    data: {
      ...propertyData,
      landlordId,
      status: "AVAILABLE",
      images: {
        create: imageUrls.map((imageUrl) => ({ imageUrl })),
      },
    },
    include: propertyInclude,
  });
}

async function listLandlordProperties(landlordId) {
  return prisma.property.findMany({
    where: { landlordId },
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
}

async function updateProperty(id, landlordId, data) {
  await getOwnedProperty(id, landlordId);

  const updateData = {
    title: data.title,
    description: data.description,
    address: data.address,
    city: data.city,
    rent: data.rent,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
  };

  if (data.imageUrls !== undefined) {
    updateData.images = {
      deleteMany: {},
      create: data.imageUrls.map((imageUrl) => ({ imageUrl })),
    };
  }

  return prisma.property.update({
    where: { id },
    data: updateData,
    include: propertyInclude,
  });
}

async function updatePropertyStatus(id, landlordId, status) {
  await getOwnedProperty(id, landlordId);

  return prisma.property.update({
    where: { id },
    data: { status },
    include: propertyInclude,
  });
}

module.exports = {
  createProperty,
  getPropertyById,
  listAvailableProperties,
  listLandlordProperties,
  updateProperty,
  updatePropertyStatus,
};
