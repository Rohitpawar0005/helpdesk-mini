import Ticket from "../models/ticketModel.js";
import Comment from "../models/commentModel.js";
import { isTicketBreached } from "../utils/slaUtils.js";

// Helper to log timeline events
const addTimeline = async (ticket, action, user, description) => {
  ticket.timeline.push({ action, user, description });
  await ticket.save();
};

// Create new ticket
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, slaDeadline, assignedTo } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      slaDeadline,
      assignedTo,
      createdBy: req.user._id,
      timeline: [{ action: "Ticket created", user: req.user._id, description: `Ticket created with priority ${priority}` }]
    });

    res.status(201).json({ message: "Ticket created", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tickets (with search, pagination, SLA breach)
export const getTickets = async (req, res) => {
  try {
    const { limit = 10, offset = 0, search = "" } = req.query;
    const searchRegex = { $regex: search, $options: "i" };

    // Role-based filter: users see only their own tickets
    const baseQuery = req.user.role === "user" ? { createdBy: req.user._id } : {};

    // Search tickets by title/description + role filter
    let tickets = await Ticket.find({
      $and: [
        baseQuery,
        { $or: [{ title: searchRegex }, { description: searchRegex }] }
      ]
    })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Search in comments and include matching tickets
    if (search) {
      const ticketIdsFromComments = await Comment.find({ content: searchRegex }).distinct("ticket");
      const ticketsFromComments = await Ticket.find({
        _id: { $in: ticketIdsFromComments },
        ...baseQuery // respect role filter
      })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email");

      tickets = tickets.concat(ticketsFromComments);
    }

    // Remove duplicates
    const uniqueTickets = Array.from(new Map(tickets.map(t => [t._id.toString(), t])).values());

    // Add breached field
    const ticketsWithBreach = uniqueTickets.map(ticket => ({
      ...ticket.toObject(),
      breached: isTicketBreached(ticket.slaDeadline)
    }));

    const total = await Ticket.countDocuments(baseQuery);

    res.json({ total, tickets: ticketsWithBreach });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single ticket by id with comments and timeline
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Add breached field
    const ticketObj = ticket.toObject();
    ticketObj.breached = isTicketBreached(ticket.slaDeadline);

    await ticket.populate("timeline.user", "name email"); // populate user in timeline
    res.json(ticketObj);

    // Include comments (threaded)
    const comments = await Comment.find({ ticket: ticket._id })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    // Build nested comments
    const commentMap = {};
    comments.forEach(c => { commentMap[c._id] = { ...c.toObject(), replies: [] }; });
    const nestedComments = [];
    comments.forEach(c => {
      if (c.parent) commentMap[c.parent]?.replies.push(commentMap[c._id]);
      else nestedComments.push(commentMap[c._id]);
    });

    ticketObj.comments = nestedComments;

    res.json(ticketObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update ticket (PATCH) with optimistic locking + timeline
export const updateTicket = async (req, res) => {
  try {
    const { version, ...updates } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (version !== ticket.version) {
      return res.status(409).json({ message: "Ticket has been updated by someone else" });
    }

    Object.assign(ticket, updates);
    ticket.version += 1;

    await addTimeline(ticket, "Ticket updated", req.user._id, `Ticket updated with changes: ${JSON.stringify(updates)}`);

    res.json({ message: "Ticket updated", ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
