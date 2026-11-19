const {
  createProperty,
  getPropertyById,
  listAvailableProperties,
  listLandlordProperties,
  updateProperty,
  updatePropertyStatus,
} = require("../services/property.service");

const propertyStatuses = ["AVAILABLE", "UNAVAILABLE", "ARCHIVED"];

function sendValidationError(res, message) {
  return res.status(400).json({ error: { message } });
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseNumber(value, fieldName, { min = 0, integer = false } = {}) {
  if (value === undefined || value === null || value === "") {
    return { error: `${fieldName} is required.` };
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < min ||
    (integer && !Number.isInteger(number))
  ) {
    return { error: `${fieldName} is invalid.` };
  }

  return { value: number };
}

function parseRequiredText(value, fieldName, maxLength) {
  if (typeof value !== "string") {
    return { error: `${fieldName} is required.` };
  }

  const text = value.trim();

  if (text.length < 2 || text.length > maxLength) {
    return {
      error: `${fieldName} must be between 2 and ${maxLength} characters.`,
    };
  }

  return { value: text };
}

function parseImageUrls(value) {
  if (value === undefined) {
    return { value: undefined };
  }

  if (!Array.isArray(value) || value.length > 10) {
    return { error: "Image URLs must be an array with no more than 10 items." };
  }

  const imageUrls = [];

  for (const imageUrl of value) {
    if (
      typeof imageUrl !== "string" ||
      imageUrl.trim().length === 0 ||
      imageUrl.trim().length > 2048
    ) {
      return { error: "Each image URL must be a valid URL." };
    }

    try {
      const url = new URL(imageUrl.trim());

      if (!["http:", "https:"].includes(url.protocol)) {
        return { error: "Each image URL must use http or https." };
      }

      imageUrls.push(url.toString());
    } catch (error) {
      return { error: "Each image URL must be a valid URL." };
    }
  }

  return { value: imageUrls };
}

function getPropertyData(body, { requireImages = false } = {}) {
  const {
    title,
    description,
    address,
    city,
    rent,
    bedrooms,
    bathrooms,
    imageUrls,
  } = body || {};
  const titleResult = parseRequiredText(title, "Title", 150);
  const addressResult = parseRequiredText(address, "Address", 250);
  const cityResult = parseRequiredText(city, "City", 100);
  const rentResult = parseNumber(rent, "Rent", { min: 0.01 });
  const bedroomsResult = parseNumber(bedrooms, "Bedrooms", {
    min: 0,
    integer: true,
  });
  const bathroomsResult = parseNumber(bathrooms, "Bathrooms", {
    min: 1,
    integer: true,
  });
  const imagesResult = parseImageUrls(imageUrls);

  for (const result of [
    titleResult,
    addressResult,
    cityResult,
    rentResult,
    bedroomsResult,
    bathroomsResult,
    imagesResult,
  ]) {
    if (result.error) {
      return result;
    }
  }

  if (requireImages && imagesResult.value === undefined) {
    return { error: "Image URLs must be an array." };
  }

  if (
    description !== undefined &&
    description !== null &&
    (typeof description !== "string" || description.trim().length > 2000)
  ) {
    return { error: "Description must contain no more than 2000 characters." };
  }

  return {
    value: {
      title: titleResult.value,
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      address: addressResult.value,
      city: cityResult.value,
      rent: rentResult.value,
      bedrooms: bedroomsResult.value,
      bathrooms: bathroomsResult.value,
      imageUrls: imagesResult.value,
    },
  };
}

function getPropertyFilters(query) {
  const filters = {};

  if (query.city !== undefined) {
    if (
      typeof query.city !== "string" ||
      query.city.trim().length === 0 ||
      query.city.trim().length > 100
    ) {
      return { error: "City filter is invalid." };
    }

    filters.city = query.city.trim();
  }

  for (const [queryName, fieldName] of [
    ["minRent", "Minimum rent"],
    ["maxRent", "Maximum rent"],
  ]) {
    if (query[queryName] !== undefined) {
      const result = parseNumber(query[queryName], fieldName, { min: 0 });

      if (result.error) {
        return result;
      }

      filters[queryName] = result.value;
    }
  }

  if (
    filters.minRent !== undefined &&
    filters.maxRent !== undefined &&
    filters.minRent > filters.maxRent
  ) {
    return { error: "Minimum rent cannot be greater than maximum rent." };
  }

  if (query.bedrooms !== undefined) {
    const result = parseNumber(query.bedrooms, "Bedrooms", {
      min: 0,
      integer: true,
    });

    if (result.error) {
      return result;
    }

    filters.bedrooms = result.value;
  }

  return { value: filters };
}

async function list(req, res, next) {
  const filters = getPropertyFilters(req.query);

  if (filters.error) {
    return sendValidationError(res, filters.error);
  }

  try {
    const properties = await listAvailableProperties(filters.value);
    return res.status(200).json({ properties });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  const id = parseId(req.params.id);

  if (!id) {
    return sendValidationError(res, "Property ID is invalid.");
  }

  try {
    const property = await getPropertyById(id);
    return res.status(200).json({ property });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  const data = getPropertyData(req.body);

  if (data.error) {
    return sendValidationError(res, data.error);
  }

  try {
    const property = await createProperty(req.auth.userId, {
      ...data.value,
      imageUrls: data.value.imageUrls || [],
    });
    return res
      .status(201)
      .json({ message: "Property created successfully.", property });
  } catch (error) {
    return next(error);
  }
}

async function listMine(req, res, next) {
  try {
    const properties = await listLandlordProperties(req.auth.userId);
    return res.status(200).json({ properties });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  const id = parseId(req.params.id);

  if (!id) {
    return sendValidationError(res, "Property ID is invalid.");
  }

  const data = getPropertyData(req.body);

  if (data.error) {
    return sendValidationError(res, data.error);
  }

  try {
    const property = await updateProperty(id, req.auth.userId, data.value);
    return res
      .status(200)
      .json({ message: "Property updated successfully.", property });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  const id = parseId(req.params.id);

  if (!id) {
    return sendValidationError(res, "Property ID is invalid.");
  }

  const { status } = req.body || {};

  if (!propertyStatuses.includes(status)) {
    return sendValidationError(
      res,
      "Status must be AVAILABLE, UNAVAILABLE, or ARCHIVED.",
    );
  }

  try {
    const property = await updatePropertyStatus(id, req.auth.userId, status);
    return res
      .status(200)
      .json({ message: "Property status updated successfully.", property });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  getById,
  list,
  listMine,
  update,
  updateStatus,
};
