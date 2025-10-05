import Comment from "../models/commentModel.js";

// Add comment
export const addComment = async (req, res) => {
  try {
    const { content, parent } = req.body;
    const ticketId = req.params.id;

    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user._id,
      content,
      parent: parent || null,
    });

     // Fetch the ticket to update timeline
    const ticket = await Ticket.findById(ticketId);
    if (ticket) {
      await addTimeline(
        ticket,
        "Comment added",
        req.user._id,
        `Comment: "${content}"${parent ? ` (Reply to ${parent})` : ""}`
      );
    }


    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all comments for a ticket
export const getComments = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const comments = await Comment.find({ ticket: ticketId })
      .populate("user", "name email")
      .populate("parent", "content user");

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
