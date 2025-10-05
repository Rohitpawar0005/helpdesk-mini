export const isTicketBreached = (slaDeadline) => {
  const now = new Date();
  return new Date(slaDeadline) < now;
};
