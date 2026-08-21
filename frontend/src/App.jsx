import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // =========================
  // FORM STATE
  // =========================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("India");
  const [region, setRegion] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);

  // =========================
  // APP STATE
  // =========================

  const [result, setResult] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  // =========================
  // FILTER STATE
  // =========================

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [duplicateFilter, setDuplicateFilter] = useState(false);

  // =========================
  // SCROLL HELPERS
  // =========================

  const scrollToComplaints = () => {
    setTimeout(() => {
      const element = document.getElementById("recent-complaints");

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handlePriorityClick = (complaintId) => {
    clearFilters();

    setTimeout(() => {
      const element = document.getElementById(complaintId);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        element.classList.add("highlighted");

        setTimeout(() => {
          element.classList.remove("highlighted");
        }, 1500);
      }
    }, 100);
  };

  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const totalComplaints = complaints.length;

  const highUrgency = complaints.filter(
    (complaint) => complaint.aiAnalysis?.urgency === "High"
  ).length;

  const duplicateComplaints = complaints.filter(
    (complaint) => complaint.aiAnalysis?.isDuplicate === true
  ).length;

  const submittedComplaints = complaints.filter(
    (complaint) => complaint.status === "Submitted"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const resolvedRate =
    totalComplaints === 0
      ? 0
      : Math.round((resolvedComplaints / totalComplaints) * 100);

  // =========================
  // PRIORITY COMPLAINTS
  // =========================

  const priorityComplaints = complaints.filter(
    (complaint) =>
      complaint.aiAnalysis?.urgency === "High" ||
      complaint.aiAnalysis?.isDuplicate === true
  );

  // =========================
  // CATEGORY COUNTS
  // =========================

  const categoryCounts = complaints.reduce((acc, complaint) => {
    const category =
      complaint.aiAnalysis?.category || "Uncategorized";

    acc[category] = (acc[category] || 0) + 1;

    return acc;
  }, {});

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

    const matchesDuplicate =
      !duplicateFilter ||
      complaint.aiAnalysis?.isDuplicate === true;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesUrgency &&
      matchesStatus &&
      matchesDuplicate
    );
  });

  // =========================
  // FETCH COMPLAINTS
  // =========================

  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);

      const response = await fetch(
        "https://civicpulse-ai-udkw.onrender.com/api/complaints"
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
        "https://civicpulse-ai-udkw.onrender.com/api/complaints",
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

      const fileInput = document.getElementById("photo-input");

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
        `https://civicpulse-ai-udkw.onrender.com/api/complaints/${complaintId}/status`,
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
    setDuplicateFilter(false);
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

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

          <div
            className="stat-card stat-clickable"
            onClick={() => {
              clearFilters();
              scrollToComplaints();
            }}
          >
            <span>Total Complaints</span>
            <strong>{totalComplaints}</strong>
          </div>

          <div
            className="stat-card stat-clickable"
            onClick={() => {
              clearFilters();
              setStatusFilter("Submitted");
              scrollToComplaints();
            }}
          >
            <span>Submitted</span>
            <strong>{submittedComplaints}</strong>
          </div>

          <div
            className="stat-card stat-clickable"
            onClick={() => {
              clearFilters();
              setStatusFilter("In Progress");
              scrollToComplaints();
            }}
          >
            <span>In Progress</span>
            <strong>{inProgressComplaints}</strong>
          </div>

          <div
            className="stat-card stat-clickable"
            onClick={() => {
              clearFilters();
              setStatusFilter("Resolved");
              scrollToComplaints();
            }}
          >
            <span>Resolved</span>
            <strong>{resolvedComplaints}</strong>
          </div>

          <div className="stat-card">
            <span>📈 Resolved Rate</span>
            <strong>{resolvedRate}%</strong>
          </div>

        </div>

        {/* =========================
            COMPLAINT BREAKDOWN
        ========================= */}

        <div className="category-breakdown">

          <h2>📊 Complaint Breakdown</h2>

          {/* PRIORITY COMPLAINTS */}

          <div className="priority-section">

            <h2>🚨 Priority Complaints</h2>

            {priorityComplaints.length === 0 ? (
              <p className="no-priority">
                No high-priority complaints right now.
              </p>
            ) : (
              <div className="priority-list">

                {priorityComplaints.map((complaint) => (
                  <div
                    className="priority-item"
                    key={complaint.complaintId}
                    onClick={() =>
                      handlePriorityClick(
                        complaint.complaintId
                      )
                    }
                  >

                    <div>

                      <strong>{complaint.title}</strong>

                      <p>
                        📍 {complaint.location}
                      </p>

                      <span>
                        {complaint.aiAnalysis?.category} •{" "}
                        {complaint.aiAnalysis?.department}
                      </span>

                    </div>

                    <div className="priority-tags">

                      {complaint.aiAnalysis?.urgency ===
                        "High" && (
                        <span className="priority-high">
                          🔴 High
                        </span>
                      )}

                      {complaint.aiAnalysis?.isDuplicate && (
                        <span className="priority-duplicate">
                          ⚠️ Duplicate
                        </span>
                      )}

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* CATEGORY LIST */}

          <div className="category-list">

            {Object.entries(categoryCounts).map(
              ([category, count]) => (
                <div
                  className="category-row category-clickable"
                  key={category}
                  onClick={() => {
                    clearFilters();
                    setCategoryFilter(category);
                    scrollToComplaints();
                  }}
                >

                  <div className="category-info">
                    <span>{category}</span>
                    <strong>{count}</strong>
                  </div>

                  <div className="category-bar">

                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${
                          totalComplaints === 0
                            ? 0
                            : (count / totalComplaints) * 100
                        }%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

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
              onChange={(e) => setTitle(e.target.value)}
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
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <label>Country</label>

            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />

            <label>State / Region</label>

            <input
              type="text"
              placeholder="e.g. Uttar Pradesh"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
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

            <button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Submit Complaint"}
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

                    {/* SUMMARY */}

                    <div className="analysis-item">
                      <span className="label">
                        Short Summary
                      </span>

                      <p>
                        {result.aiAnalysis?.summary}
                      </p>
                    </div>

                    {/* CATEGORY */}

                    <div className="analysis-item">
                      <span className="label">
                        Complaint Category
                      </span>

                      <p>
                        {result.aiAnalysis?.category}
                      </p>
                    </div>

                    {/* URGENCY */}

                    <div className="analysis-item">
                      <span className="label">
                        Urgency Level
                      </span>

                      <p
                        className={`urgency ${
                          result.aiAnalysis?.urgency?.toLowerCase()
                        }`}
                      >
                        {result.aiAnalysis?.urgency}
                      </p>
                    </div>

                    {/* DEPARTMENT */}

                    <div className="analysis-item">
                      <span className="label">
                        Appropriate Department
                      </span>

                      <p>
                        {result.aiAnalysis?.department}
                      </p>
                    </div>

                    {/* IMAGE EVIDENCE */}

                    {result.aiAnalysis?.imageAnalysis
                      ?.relevant && (
                      <div className="analysis-item">

                        <span className="label">
                          📷 Image Evidence
                        </span>

                        <p>
                          {
                            result.aiAnalysis.imageAnalysis
                              .evidence
                          }
                        </p>

                      </div>
                    )}

                  </div>

                  {/* DUPLICATE WARNING */}

                  {result.aiAnalysis?.isDuplicate && (
                    <div className="duplicate-warning">

                      <strong>
                        ⚠️ Possible Duplicate Complaint
                      </strong>

                      <p>
                        Similar to complaint{" "}
                        <strong>
                          {result.aiAnalysis.duplicateOf}
                        </strong>
                      </p>

                      <span>
                        Confidence:{" "}
                        {result.aiAnalysis.duplicateConfidence}
                      </span>

                    </div>
                  )}

                </>
              )}

            </div>
          )}

        </div>

        {/* =========================
            RECENT COMPLAINTS
        ========================= */}

        <div
          id="recent-complaints"
          className="card complaints-card"
        >

          <div className="complaints-title">

            <h2>Recent Complaints</h2>

            <button
              className="refresh-button"
              onClick={fetchComplaints}
              disabled={loadingComplaints}
            >
              {loadingComplaints ? "Loading..." : "Refresh"}
            </button>

          </div>

          {/* =========================
              ANALYTICS
          ========================= */}

          <div className="analytics-grid">

            <div
              className="analytics-card analytics-clickable"
              onClick={() => {
                clearFilters();
                scrollToComplaints();
              }}
            >
              <span>Total Complaints</span>
              <strong>{totalComplaints}</strong>
            </div>

            <div
              className="analytics-card analytics-clickable"
              onClick={() => {
                clearFilters();
                setUrgencyFilter("High");
                scrollToComplaints();
              }}
            >
              <span>🔴 High Urgency</span>
              <strong>{highUrgency}</strong>
            </div>

            <div
              className="analytics-card analytics-clickable"
              onClick={() => {
                clearFilters();
                setDuplicateFilter(true);
                scrollToComplaints();
              }}
            >
              <span>⚠️ Duplicates</span>
              <strong>{duplicateComplaints}</strong>
            </div>

            <div
              className="analytics-card analytics-clickable"
              onClick={() => {
                clearFilters();
                setStatusFilter("Resolved");
                scrollToComplaints();
              }}
            >
              <span>✅ Resolved</span>
              <strong>{resolvedComplaints}</strong>
            </div>

          </div>

          {/* =========================
              FILTERS
          ========================= */}

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
              <option value="All">All Categories</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Roads">Roads</option>
              <option value="Electricity">Electricity</option>
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
              <option value="All">All Urgency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Resolved">Resolved</option>
            </select>

            <label className="duplicate-filter">

              <input
                type="checkbox"
                checked={duplicateFilter}
                onChange={(e) =>
                  setDuplicateFilter(e.target.checked)
                }
              />

              Show duplicates only

            </label>

          </div>

          {/* =========================
              CLEAR FILTERS
          ========================= */}

          {(search ||
            categoryFilter !== "All" ||
            urgencyFilter !== "All" ||
            statusFilter !== "All" ||
            duplicateFilter) && (
            <button
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}

          {/* =========================
              COMPLAINT RESULTS
          ========================= */}

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
                  id={complaint.complaintId}
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
                        {complaint.region},{" "}
                        {complaint.country}
                      </p>

                    </div>

                    <select
                      className={`status-select ${
                        complaint.status
                          ?.toLowerCase()
                          .replace(" ", "-")
                      }`}
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
                      className={`urgency-badge ${
                        complaint.aiAnalysis?.urgency?.toLowerCase()
                      }`}
                    >
                      Urgency:{" "}
                      {complaint.aiAnalysis?.urgency}
                    </span>

                  </div>

                  <div className="recommended-action">

                    <strong>
                      🤖 AI Recommended Action
                    </strong>

                    <p>
                      {
                        complaint.aiAnalysis
                          ?.recommendedAction
                      }
                    </p>

                  </div>

                  {/* DUPLICATE WARNING */}

                  {complaint.aiAnalysis?.isDuplicate && (
                    <div className="duplicate-warning">

                      <strong>
                        ⚠️ Possible Duplicate Complaint
                      </strong>

                      <p>
                        Similar to complaint{" "}
                        <strong>
                          {
                            complaint.aiAnalysis
                              ?.duplicateOf
                          }
                        </strong>
                      </p>

                      <span>
                        Confidence:{" "}
                        {
                          complaint.aiAnalysis
                            ?.duplicateConfidence
                        }
                      </span>

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

          {/* =========================
              RESULT COUNT
          ========================= */}

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