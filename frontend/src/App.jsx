import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [country, setCountry] = useState("India");
  const [region, setRegion] = useState("");
  const [location, setLocation] = useState("");

  const [image, setImage] = useState(null);

  const [result, setResult] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  // Search + filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const totalComplaints = complaints.length;

  const submittedComplaints = complaints.filter(
    (complaint) => complaint.status === "Submitted"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  // =========================
  // FILTER COMPLAINTS
  // =========================

  const filteredComplaints = complaints.filter((complaint) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      complaint.title?.toLowerCase().includes(searchText) ||
      complaint.description?.toLowerCase().includes(searchText) ||
      complaint.location?.toLowerCase().includes(searchText) ||
      complaint.complaintId?.toLowerCase().includes(searchText);

    const matchesCategory =
      categoryFilter === "All" ||
      complaint.aiAnalysis?.category === categoryFilter;

    const matchesUrgency =
      urgencyFilter === "All" ||
      complaint.aiAnalysis?.urgency === urgencyFilter;

    const matchesStatus =
      statusFilter === "All" ||
      complaint.status === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesUrgency &&
      matchesStatus
    );
  });

  // =========================
  // FETCH COMPLAINTS
  // =========================

  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);

      const response = await fetch(
        "http://localhost:3000/api/complaints"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load complaints"
        );
      }

      setComplaints(data);
    } catch (error) {
      console.error("Failed to load complaints:", error);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =========================
  // SUBMIT COMPLAINT
  // =========================

  const submitComplaint = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("country", country);
      formData.append("region", region);

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        "http://localhost:3000/api/complaints",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong"
        );
      }

      setResult(data);

      await fetchComplaints();

      setTitle("");
      setDescription("");
      setLocation("");
      setImage(null);

      const fileInput =
        document.getElementById("photo-input");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Complaint submission failed:", error);

      setResult({
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (complaintId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/complaints/${complaintId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      await fetchComplaints();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setUrgencyFilter("All");
    setStatusFilter("All");
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="app">

      {/* HEADER */}

      <header>
        <h1>CivicPulse AI</h1>

        <p>
          Report civic issues. Get them resolved faster.
        </p>
      </header>

      <main>

        {/* =========================
            DASHBOARD STATISTICS
        ========================= */}

        <div className="dashboard-stats">

          <div className="stat-card">
            <span>Total Complaints</span>
            <strong>{totalComplaints}</strong>
          </div>

          <div className="stat-card">
            <span>Submitted</span>
            <strong>{submittedComplaints}</strong>
          </div>

          <div className="stat-card">
            <span>In Progress</span>
            <strong>{inProgressComplaints}</strong>
          </div>

          <div className="stat-card">
            <span>Resolved</span>
            <strong>{resolvedComplaints}</strong>
          </div>

        </div>

        {/* =========================
            COMPLAINT FORM
        ========================= */}

        <div className="card">

          <h2>Report an Issue</h2>

          <form onSubmit={submitComplaint}>

            <label>Issue Title</label>

            <input
              type="text"
              placeholder="e.g. Garbage not collected"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />

            <label>Description</label>

            <textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
            />

            <label>Location</label>

            <input
              type="text"
              placeholder="e.g. Sector 12"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              required
            />

            <label>Country</label>

<input
  type="text"
  value={country}
  onChange={(e) =>
    setCountry(e.target.value)
  }
  required
/>

<label>State / Region</label>

<input
  type="text"
  placeholder="e.g. Uttar Pradesh"
  value={region}
  onChange={(e) =>
    setRegion(e.target.value)
  }
  required
/>

            <label>Photo Evidence</label>

            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files[0])
              }
            />

            {image && (
              <p className="selected-image">
                Selected: {image.name}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Submit Complaint"}
            </button>

          </form>

          {/* =========================
              AI RESULT
          ========================= */}

          {result && (
            <div className="result">

              {result.error ? (

                <p className="error">
                  {result.error}
                </p>

              ) : (

                <>
                  <div className="complaint-header">

                    <div>
                      <span className="label">
                        Complaint ID
                      </span>

                      <p className="complaint-id">
                        {result.complaintId}
                      </p>
                    </div>

                    <div>
                      <span className="label">
                        Status
                      </span>

                      <p className="status">
                        {result.status}
                      </p>
                    </div>

                  </div>

                  <h2>AI Analysis</h2>

                  <div className="analysis">

                    <div className="analysis-item">
                      <span className="label">
                        Short Summary
                      </span>

                      <p>
                        {result.aiAnalysis?.summary}
                      </p>
                    </div>

                    <div className="analysis-item">
                      <span className="label">
                        Complaint Category
                      </span>

                      <p>
                        {result.aiAnalysis?.category}
                      </p>
                    </div>

                    <div className="analysis-item">
                      <span className="label">
                        Urgency Level
                      </span>

                      <p
  className={`urgency ${result.aiAnalysis?.urgency?.toLowerCase()}`}
>
  {result.aiAnalysis?.urgency}
</p>
                    </div>

                    <div className="analysis-item">
                      <span className="label">
                        Appropriate Department
                      </span>

                      <p>
                        {result.aiAnalysis?.department}
                      </p>
                    </div>

                  </div>
                </>

              )}

            </div>
          )}

        </div>

        {/* =========================
            RECENT COMPLAINTS
        ========================= */}

        <div className="card complaints-card">

          <div className="complaints-title">

            <h2>Recent Complaints</h2>

            <button
              className="refresh-button"
              onClick={fetchComplaints}
              disabled={loadingComplaints}
            >
              {loadingComplaints
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

          {/* SEARCH + FILTERS */}

          <div className="complaint-filters">

            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="All">
                All Categories
              </option>

              <option value="Sanitation">
                Sanitation
              </option>

              <option value="Water Supply">
                Water Supply
              </option>

              <option value="Roads">
                Roads
              </option>

              <option value="Electricity">
                Electricity
              </option>

              <option value="Street Lighting">
                Street Lighting
              </option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) =>
                setUrgencyFilter(e.target.value)
              }
            >
              <option value="All">
                All Urgency
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Submitted">
                Submitted
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>
            </select>

          </div>

          {/* CLEAR FILTERS */}

          {(search ||
            categoryFilter !== "All" ||
            urgencyFilter !== "All" ||
            statusFilter !== "All") && (

            <button
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          )}

          {/* RESULTS */}

          {loadingComplaints ? (

            <p>Loading complaints...</p>

          ) : complaints.length === 0 ? (

            <p>No complaints yet.</p>

          ) : filteredComplaints.length === 0 ? (

            <p className="no-results">
              No complaints match your filters.
            </p>

          ) : (

            <div className="complaints-list">

              {filteredComplaints.map((complaint) => (

                <div
                  className="complaint-item"
                  key={complaint.complaintId}
                >

                  <div className="complaint-item-top">

                    <div>

                      <strong>
                        {complaint.title}
                      </strong>

                      <p className="complaint-location">
                      📍 {complaint.location}
                      </p>

                      <p className="complaint-region">
                        {complaint.region}, {complaint.country}
                      </p>

                    </div>

                    <select
                      className={`status-select ${complaint.status
                      ?.toLowerCase()
                      .replace(" ", "-")}`}
                      value={complaint.status}
                      onChange={(e) =>
                        updateStatus(
                          complaint.complaintId,
                          e.target.value
                        )
                      }
                    >

                      <option value="Submitted">
                        Submitted
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Resolved">
                        Resolved
                      </option>

                    </select>

                  </div>

                  <div className="complaint-meta">

                    <span>
                      ID: {complaint.complaintId}
                    </span>

                    <span>
                      Category:{" "}
                      {complaint.aiAnalysis?.category}
                    </span>

                    <span
                    className={`urgency-badge ${complaint.aiAnalysis?.urgency?.toLowerCase()}`}
                  >
                    Urgency: {complaint.aiAnalysis?.urgency}
                  </span>

                                    </div>

                  <div className="recommended-action">
                    <strong>🤖 AI Recommended Action</strong>
                    <p>
                      {complaint.aiAnalysis?.recommendedAction}
                    </p>
                  </div>

                </div>

              ))}

            </div>

          )}

          {/* RESULT COUNT */}

          {!loadingComplaints &&
            complaints.length > 0 && (
              <p className="results-count">
                Showing {filteredComplaints.length} of{" "}
                {complaints.length} complaints
              </p>
            )}

        </div>

      </main>

    </div>
  );
}

export default App;