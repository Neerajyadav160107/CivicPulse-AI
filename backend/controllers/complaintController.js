const { GoogleGenAI } = require("@google/genai");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// =========================
// CREATE COMPLAINT
// =========================

const createComplaint = async (req, res) => {
    try {

        const complaint = req.body;

        console.log("Received complaint:", complaint);

        if (req.file) {
            console.log("Image uploaded:", req.file.originalname);
        } else {
            console.log("No image uploaded");
        }


        // =========================
        // GET EXISTING COMPLAINTS
        // =========================

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

        console.log(
            "Existing complaints checked:",
            existingComplaints.length
        );


        // =========================
        // GEMINI ANALYSIS
        // =========================

        const contents = [
            {
                text: `Analyze this civic complaint.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

The JSON must contain exactly these fields:

{
  "summary": "short summary of the complaint",
  "category": "complaint category",
  "urgency": "Low, Medium, or High",
  "department": "appropriate government department",
  "recommendedAction": "specific next action the responsible department should take",
  "isDuplicate": true,
  "duplicateOf": "complaint ID or null",
  "duplicateConfidence": "High, Medium, Low, or null",
  "imageAnalysis": {
    "relevant": true,
    "evidence": "visible evidence from the image or null"
  }
}

Complaint:
${JSON.stringify(complaint)}

Existing complaints:
${JSON.stringify(existingComplaints)}

Duplicate detection rules:

1. Compare the new complaint with the existing complaints.
2. Consider title, description, location and category.
3. Mark isDuplicate as true only when the complaint is reasonably likely to refer to the same civic issue.
4. If it is a duplicate, set duplicateOf to the most similar complaint ID.
5. If it is not a duplicate, set duplicateOf to null.
6. If it is not a duplicate, set duplicateConfidence to null.

Image analysis rules:

1. If an image is provided, determine whether it is relevant to the complaint.
2. Mention only visible evidence.
3. Do not invent or assume anything that cannot be seen.
4. If the image supports the complaint, explain the visible evidence briefly.
5. If the image is unrelated, set relevant to false.
6. If no image is provided, use:

"imageAnalysis": {
  "relevant": false,
  "evidence": null
}`
            }
        ];


        // =========================
        // ADD IMAGE
        // =========================

        if (req.file) {

            contents.push({
                inlineData: {
                    mimeType: req.file.mimetype,
                    data: req.file.buffer.toString("base64")
                }
            });

        }


        let aiAnalysis;


        // =========================
        // CALL GEMINI
        // =========================

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

            console.error(
                "Gemini unavailable:",
                geminiError.message
            );


            // =========================
            // FALLBACK
            // =========================

            aiAnalysis = {
                summary: complaint.description,

                category: "General Civic Issue",

                urgency: "Medium",

                department: "Municipal Corporation",

                recommendedAction:
                    "Review the complaint and take appropriate corrective action.",

                isDuplicate: false,

                duplicateOf: null,

                duplicateConfidence: null,

                imageAnalysis: {
                    relevant: false,
                    evidence: null
                }
            };
        }


        // =========================
        // CREATE COMPLAINT ID
        // =========================

        const complaintId = `CP-${Date.now()}`;


        // =========================
        // SAVE TO FIRESTORE
        // =========================

        await db
            .collection("complaints")
            .doc(complaintId)
            .set({

                complaintId,

                status: "Submitted",

                title: complaint.title,

                description: complaint.description,

                country: complaint.country,

                region: complaint.region,

                location: complaint.location,

                aiAnalysis,

                createdAt: new Date().toISOString()

            });


        console.log(
            "Complaint saved to Firestore:",
            complaintId
        );


        // =========================
        // RESPONSE
        // =========================

        res.json({

            message: "Complaint analyzed successfully",

            complaintId,

            status: "Submitted",

            complaint,

            aiAnalysis

        });

    } catch (error) {

        console.error(
            "Complaint processing error:",
            error
        );

        res.status(500).json({

            message: "Failed to analyze complaint",

            error: error.message

        });
    }
};


// =========================
// GET ALL COMPLAINTS
// =========================

const getComplaints = async (req, res) => {

    try {

        const snapshot = await db
            .collection("complaints")
            .orderBy("createdAt", "desc")
            .get();

        const complaints = snapshot.docs.map(
            (doc) => doc.data()
        );

        res.json(complaints);

    } catch (error) {

        console.error(
            "Firestore error:",
            error
        );

        res.status(500).json({

            message: "Failed to fetch complaints",

            error: error.message

        });
    }
};


// =========================
// UPDATE STATUS
// =========================

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

                status

            });


        res.json({

            message: "Complaint status updated",

            complaintId: id,

            status

        });

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        res.status(500).json({

            message: "Failed to update complaint status",

            error: error.message

        });
    }
};


// =========================
// EXPORT
// =========================

module.exports = {

    createComplaint,

    getComplaints,

    updateComplaintStatus

};