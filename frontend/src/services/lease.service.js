import api from "./api";
export async function createLease(data) {
  return (await api.post("/leases", data)).data;
}
export async function getMyLeases() {
  return (await api.get("/leases/my")).data;
}
export async function updateLeaseStatus(id, status) {
  return (await api.patch(`/leases/${id}/status`, { status })).data;
}
