import api from "./api";

export async function getProperties(filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  );
  const response = await api.get("/properties", { params });
  return response.data;
}

export async function getProperty(id) {
  const response = await api.get(`/properties/${id}`);
  return response.data;
}

export async function getMyProperties() {
  const response = await api.get("/properties/my");
  return response.data;
}

export async function createProperty(data) {
  const response = await api.post("/properties", data);
  return response.data;
}

export async function updateProperty(id, data) {
  const response = await api.put(`/properties/${id}`, data);
  return response.data;
}

export async function updatePropertyStatus(id, status) {
  const response = await api.patch(`/properties/${id}/status`, { status });
  return response.data;
}
