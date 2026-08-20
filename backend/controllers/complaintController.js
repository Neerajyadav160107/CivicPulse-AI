const { GoogleGenAI } = require("@google/genai");

const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const createComplaint = async (req, res) => {
    try {
        const complaint = req.body;

console.log("Received complaint:", complaint);

if (req.file) {
    // image logging
} else {
    console.log("No image uploaded");
}

// 👇 ADD THE NEW CODE HERE

const existingSnapshot = await db
    .collection("complaints")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

const existingComplaints = existingSnapshot.docs.map((doc) => ({
    complaintId: doc.id,
    title: doc.data().title,
    description: doc.data().description,
    location: doc.data().location,
    category: doc.data().aiAnalysis?.category
}));

console.log("Existing complaints checked:", existingComplaints.length);

console.log("Sending complaint to Gemini...");

        const contents = [
    {
        text: `Analyze this civic complaint.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

The JSON must have exactly these five fields:
{
  "summary": "short summary of the complaint",
  "category": "complaint category",
  "urgency": "Low, Medium, or High",
  "department": "appropriate government department",
  "recommendedAction": "specific next action the responsible department should take"
}

Complaint:
${JSON.stringify(complaint)}

Existing complaints:
${JSON.stringify(existingComplaints)}

Determine whether this complaint is a likely duplicate of any existing complaint.

If it is a duplicate, identify the most similar complaint.

Return duplicate information using:
"isDuplicate": true or false,
"duplicateOf": "complaint ID or null",
"duplicateConfidence": "High, Medium, or Low"

If an image is provided, use it as additional evidence when analyzing the complaint.`
    }
];

if (req.file) {
    contents.push({
        inlineData: {
            mimeType: req.file.mimetype,
            data: req.file.buffer.toString("base64")
        }
    });
}

let aiAnalysis;

try {
    console.log("Sending complaint to Gemini...");

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents
    });

    console.log("Gemini responded!");

    const aiText = response.text.trim();

    console.log("Gemini raw response:", aiText);

    aiAnalysis = JSON.parse(aiText);

} catch (geminiError) {
    console.error("Gemini unavailable:", geminiError.message);

    // Fallback analysis
    aiAnalysis = {
        summary: complaint.description,
        category: "General Civic Issue",
        urgency: "Medium",
        department: "Municipal Corporation",
        recommendedAction: "Review the complaint and take appropriate corrective action."
    };
}

                            const complaintId = `CP-${Date.now()}`;

                    await db.collection("complaints").doc(complaintId).set({
                    complaintId: complaintId,
                    status: "Submitted",

                    title: complaint.title,
                    description: complaint.description,

                    country: complaint.country,
                    region: complaint.region,
                    location: complaint.location,

                    aiAnalysis: aiAnalysis,

                    createdAt: new Date().toISOString()
                    });
                    console.log("Complaint saved to Firestore:", complaintId);

                    res.json({
                        message: "Complaint analyzed successfully",
                        complaintId: complaintId,
                        status: "Submitted",
                        complaint: complaint,
                        aiAnalysis: aiAnalysis
                    });

    } catch (error) {
        console.error("Complaint processing error:", error);
        console.error("Complaint processing error:", error);

        res.status(500).json({
            message: "Failed to analyze complaint",
            error: error.message
        });
    }
};
const getComplaints = async (req, res) => {
    try {
        const snapshot = await db
            .collection("complaints")
            .orderBy("createdAt", "desc")
            .get();

        const complaints = snapshot.docs.map((doc) => doc.data());

        res.json(complaints);
    } catch (error) {
        console.error("Firestore error:", error);

        res.status(500).json({
            message: "Failed to fetch complaints",
            error: error.message
        });
    }
};

const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Submitted",
            "In Progress",
            "Resolved"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        await db
            .collection("complaints")
            .doc(id)
            .update({
                status: status
            });

        res.json({
            message: "Complaint status updated",
            complaintId: id,
            status: status
        });

    } catch (error) {
        console.error("Status update error:", error);

        res.status(500).json({
            message: "Failed to update complaint status",
            error: error.message
        });
    }
};

module.exports = {
    createComplaint,
    getComplaints,
    updateComplaintStatus
};