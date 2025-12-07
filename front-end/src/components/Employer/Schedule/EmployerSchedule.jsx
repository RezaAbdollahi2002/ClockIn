import { useState, useEffect } from "react";
import EmployerNavbar from "../../Navbar/EmployerNavbar";
import axios from "axios";
import Message from "../../Message/Message";
import PublishedSchedule from "./PublishedSchedule";
import UnpublishedSchedule from "./UnpublishedSchedule"
import { useNavigate } from "react-router-dom";
import Autogenerate from "../../EmployerShifts/Autogenerate"

const API_BASE_URL = "http://localhost:8000";

const EmployerSchedule = ({ message, handleMessageState, setMessage }) => {
  // State Management
  const [shifts, setShifts] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(true);
  const [autogenerateShow, setAutogenerateShow] = useState(false);

  // UI State
  const [showAddShift, setShowAddShift] = useState(false);
  const [showEditShift, setShowEditShift] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Add Shift Form State
  const [search, setSearch] = useState("");

  const [selectedMember, setSelectedMember] = useState(null);

  const navigate = useNavigate();
  const [shiftForm, setShiftForm] = useState({
    role: "",
    location: "",
    publishStatus: "unpublished",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
  });

  // Edit Shift Form State
  const [editForm, setEditForm] = useState({
    shiftId: null,
    employeeId: null,
    title: "",
    startTime: "",
    endTime: "",
    publishStatus: "unpublished",
  });

  const employerId = localStorage.getItem("employer_id");

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [shiftsResponse, teamResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/shifts/employer`, {
            params: { employer_id: employerId, published },
          }),
          axios.get(`${API_BASE_URL}/shifts/employees/team/${employerId}`),
        ]);

        setShifts(shiftsResponse.data);
        setTeamMembers(teamResponse.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (employerId) {
      fetchData();
    }
  }, [employerId, published]);

  // Utility Functions
  const formatDateTime = (dateTime) => {
    if (!dateTime) return null;
    return dateTime.length === 16 ? `${dateTime}:00` : dateTime;
  };

  const resetShiftForm = () => {
    setShiftForm({
      role: "",
      location: "",
      publishStatus: "unpublished",
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      status: "scheduled",
    });
    setSelectedMember(null);
  };

  const resetEditForm = () => {
    setEditForm({
      shiftId: null,
      employeeId: null,
      title: "",
      startTime: "",
      endTime: "",
      publishStatus: "unpublished",
    });
  };

  // Filter team members based on search
  const filteredMembers = teamMembers.filter((member) =>
    `${member.first_name} ${member.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Handlers
  const handleCreateShift = async () => {
    if (!selectedMember || !shiftForm.role || !shiftForm.location || !shiftForm.title || !shiftForm.startTime || !shiftForm.endTime) {
      alert("Please fill in all required fields and select a team member.");
      return;
    }

    const payload = {
      employee_id: selectedMember.id,
      employer_id: Number(employerId),
      role: shiftForm.role,
      location: shiftForm.location,
      publish_status: shiftForm.publishStatus,
      status: shiftForm.status,
      title: shiftForm.title,
      description: shiftForm.description,
      start_time: formatDateTime(shiftForm.startTime),
      end_time: formatDateTime(shiftForm.endTime),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/shifts`, payload);
      alert("Shift created successfully!");
      setShifts((prev) => [...prev, response.data]);
      resetShiftForm();
      setShowAddShift(false);
      navigate(0);
    } catch (err) {
      console.error("Error creating shift:", err.response?.data || err.message);
      alert("Failed to create shift. Please try again.");
    }
  };

  const handleEditShift = async () => {
    if (!editForm.shiftId || !editForm.employeeId) {
      alert("Please select a shift to edit.");
      return;
    }

    const payload = {
      shift_id: Number(editForm.shiftId),
      employee_id: Number(editForm.employeeId),
      title: editForm.title,
      start_time: formatDateTime(editForm.startTime),
      end_time: formatDateTime(editForm.endTime),
      publish_status: editForm.publishStatus,  // Note: matches backend typo
    };

    try {
      console.log(payload)
      const response = await axios.put(
        `${API_BASE_URL}/shifts/${editForm.shiftId}/edit`,
        null,
        { params: payload }
      );
      alert("Shift updated successfully!");
      setShifts((prev) =>
        prev.map((shift) => (shift.id === editForm.shiftId ? response.data : shift))
      );
      resetEditForm();
      setShowEditForm(false);
      navigate(0);
    } catch (err) {
      console.error("Error updating shift:", err.response?.data || err.message);
      alert(`Failed to update shift: ${err.response?.data?.detail || "Please try again."}`);
    }
  };
  const handleRemoveShift = async (shiftId) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/shifts/${shiftId}`);
      alert("Shift removed successfully!");
      setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));
      navigate(0);
    } catch (err) {
      console.error("Error deleting shift:", err.response?.data || err.message);
      alert("Failed to remove shift. Please try again.");
    }
  };

  const initiateEdit = (shift) => {
    setEditForm({
      shiftId: shift.id,
      employeeId: shift.employee_id,
      title: shift.title,
      startTime: shift.start_time?.slice(0, 16) || "",
      endTime: shift.end_time?.slice(0, 16) || "",
      publishStatus: shift.publish_status || "unpublished",
    });
    setShowEditForm(true);
  };

  // Render Functions
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">Loading shifts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  const handleEditInitiate = (shift) => {
      console.log("Edit initiated for shift:", shift); // DEBUG

    setEditForm({
      shiftId: shift.id,
      employeeId: shift.employee_id,
      title: shift.title,
      startTime: shift.start_time?.slice(0, 16) || "",
      endTime: shift.end_time?.slice(0, 16) || "",
      publishStatus: shift.publish_status || "unpublished",
    });
    setShowEditForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar messageState={handleMessageState} />

      {/* Action Menu */}
      <nav className="bg-gray-800 text-white font-semibold shadow-md">
        <ul className="flex gap-x-6 px-6 py-3">
          <li
            className="cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => setShowAddShift(!showAddShift)}
          >
            Add Shift
          </li>
          <li
            className="cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => setShowEditShift(!showEditShift)}
          >
            Edit Shift
          </li>
          <li
            className="cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => setPublished(true)}
          >
            Published Shifts
          </li>
          <li
            className="cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => setPublished(false)}
          >
            Unpublished Shifts
          </li>
          <li
            className="cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => setAutogenerateShow(!autogenerateShow)}
          >
            AutoShift Pro
          </li>
        </ul>
      </nav>

      {/* Add Shift Form */}
      {showAddShift && (
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Shift</h2>

          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredMembers.length > 0 ? (
            <div className="max-h-48 overflow-y-auto mb-4 border border-gray-200 rounded-md">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMember?.id === member.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  onClick={() => setSelectedMember(member)}
                >
                  {member.profile_picture ? (
                    <img
                      src={member.profile_picture}
                      alt={`${member.first_name} ${member.last_name}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                      {member.first_name[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {member.first_name} {member.last_name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-4">No team members found.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              placeholder="Role *"
              value={shiftForm.role}
              onChange={(e) => setShiftForm({ ...shiftForm, role: e.target.value })}
            />
            <input
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              placeholder="Location *"
              value={shiftForm.location}
              onChange={(e) => setShiftForm({ ...shiftForm, location: e.target.value })}
            />
            <input
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              placeholder="Title *"
              value={shiftForm.title}
              onChange={(e) => setShiftForm({ ...shiftForm, title: e.target.value })}
            />
            <input
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              placeholder="Description"
              value={shiftForm.description}
              onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
            />
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={shiftForm.publishStatus}
              onChange={(e) => setShiftForm({ ...shiftForm, publishStatus: e.target.value })}
            >
              <option value="unpublished">Unpublished</option>
              <option value="published">Published</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={shiftForm.status}
              onChange={(e) => setShiftForm({ ...shiftForm, status: e.target.value })}
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="datetime-local"
                value={shiftForm.startTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="datetime-local"
                value={shiftForm.endTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              onClick={handleCreateShift}
            >
              Create Shift
            </button>
            <button
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              onClick={() => {
                setShowAddShift(false);
                resetShiftForm();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Shift Selection */}
      {showEditShift && (
        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Shifts</h2>
          {shifts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {shift.employee?.first_name} {shift.employee?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {shift.role} — {shift.title} @ {shift.location}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(shift.start_time).toLocaleString()} →{" "}
                      {new Date(shift.end_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
                      onClick={() => initiateEdit(shift)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                      onClick={() => handleRemoveShift(shift.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No shifts available to edit.</p>
          )}
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Edit Shift Details</h2>
            <button
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowEditForm(false)}
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              placeholder="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={editForm.publishStatus}
              onChange={(e) => setEditForm({ ...editForm, publishStatus: e.target.value })}
            >
              <option value="unpublished">Unpublished</option>
              <option value="published">Published</option>
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="datetime-local"
                value={editForm.startTime}
                onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="datetime-local"
                value={editForm.endTime}
                onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              onClick={handleEditShift}
            >
              Save Changes
            </button>
            <button
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              onClick={() => {
                setShowEditForm(false);
                resetEditForm();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {
        autogenerateShow && (
          <Autogenerate setAutogenerateShow={setAutogenerateShow} />
        )
      }

      {/* Calendar Views */}
      <div className="container mx-auto px-4 py-8">
        {published ? <PublishedSchedule /> : <UnpublishedSchedule
          onEditClick={handleEditInitiate} setShowEditForm={setShowEditForm} />}
      </div>

      {/* Message Sidebar */}
      {message && (
        <div
          className={`fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl z-50 p-6 overflow-auto transform transition-transform duration-300 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <Message onClose={() => setMessage(false)} />
        </div>
      )}
    </div>
  );
};

export default EmployerSchedule;