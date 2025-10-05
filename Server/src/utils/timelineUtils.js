export const addTimeline = async (ticket, action, userId, description = "") => {
  ticket.timeline.push({
    action,
    user: userId,
    description,
  });
  await ticket.save();
};
