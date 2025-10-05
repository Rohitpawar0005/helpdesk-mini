export const getUserRole = () => localStorage.getItem("role");
export const getToken = () => localStorage.getItem("token");

export const isAdmin = () => getUserRole() === "admin";
export const isAgent = () => getUserRole() === "agent";
export const isUser = () => getUserRole() === "user";
