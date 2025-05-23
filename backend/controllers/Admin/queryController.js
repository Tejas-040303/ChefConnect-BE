const Query = require("../../models/Comman/QueriesSchema");
const { sendQueryStatusEmail } = require("../../services/emailService");
const { generateQueryStatusEmail } = require("../../utils/emailTemplatesQuery");

exports.createQuery = async (req, res) => {
  try {
    const { name, email, role, subject, phone, query } = req.body;

    if (!name || !email || !role || !subject || !phone || !query) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    const newQuery = new Query({ name, email, role, subject, phone, query });
    await newQuery.save();

    res.status(201).json({
      message: "Query submitted successfully",
      query: newQuery,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Validation failed", details: error.message });
    }
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.getQueries = async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    const updatedQuery = await Query.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedQuery) {
      return res.status(404).json({ error: "Query not found" });
    }
    
    res.status(200).json(updatedQuery);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.sendQueryStatusEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body; // Get the admin's custom response content

    // Validate that admin response is provided
    if (!adminResponse || adminResponse.trim() === '') {
      return res.status(400).json({ error: "Admin response content is required" });
    }

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({ error: "Query not found" });
    }

    const emailSubject = `ChefConnect Support: Your Query Status - ${query.status}`;
    const emailContent = generateQueryStatusEmail({
      name: query.name,
      email: query.email,
      subject: query.subject,
      query: query.query,
      status: query.status,
      adminResponse: adminResponse // Pass the admin's custom response to the email template
    });

    await sendQueryStatusEmail(query.email, emailSubject, emailContent);
    
    // Save the admin response and update lastEmailSent timestamp
    query.lastEmailSent = new Date();
    query.adminResponse = adminResponse; // Store the admin response in the query document
    await query.save();

    res.status(200).json({
      message: "Email notification sent successfully",
      query: query
    });
  } catch (error) {
    console.error("Error sending email notification:", error);
    res.status(500).json({
      error: "Failed to send email notification",
      details: error.message
    });
  }
};