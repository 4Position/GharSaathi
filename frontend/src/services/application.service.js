import api from "./api";
export async function submitApplication(data) {
  return (await api.post("/applications", data)).data;
}
export async function getMyApplications() {
  return (await api.get("/applications/my")).data;
}
export async function getReceivedApplications() {
  return (await api.get("/applications/received")).data;
}
export async function updateApplicationStatus(id, status) {
  return (await api.patch(`/applications/${id}/status`, { status })).data;
}
