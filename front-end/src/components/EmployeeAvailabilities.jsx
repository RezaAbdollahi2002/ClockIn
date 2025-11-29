import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { FaPlus } from "react-icons/fa";
import Message from "./Message";
import Navbar from "./Navbar";
import axios from "axios";

const EmployeeAvailabilities = ({ message, handleMessageState, setMessage }) => {
    const [newAvailability, setNewAvailability] = useState(false);
    const [clearAvailability, setClearAvailability] = useState(false);
    const [modifyAvailability, setModifyAvailability] = useState(false);
    const [listOfAvailabilities, setListOfAvailabilities] = useState(null);
    const [showMyAvailabilities, setShowMyAvailabilities] = useState(false);
    const [availabilityId, setAvailabilityId] = useState(NaN);
    const [updateAvailabilit, setUpdateAvailability] = useState(false);
    const [addHours, setAddHours] = useState(false);
    const [availabilityById, setAvailabilityById] = useState([]);
    const [editAvailabilities, setEditAvailabilities] = useState(false);
    const [availabilityView, setAvailabilityView] = useState([]);

    const employeeId = localStorage.getItem("employee_id");


    const [newAvailabilityFormData, setNewAvailabilityFormData] = useState({
        id: "",
        type: "",
        name: "",
        start_date: "",
        end_date: "",
        description: "",
        status: "pending",
    });
    const [EditAvailabilityFormData, setEditAvailabilityFormData] = useState({
        id: "",
        type: "",
        name: "",
        start_date: "",
        end_date: "",
        description: "",
        status: "pending",
    });
    const [hoursForm, setHoursForm] = useState({
        id: "",
        monday_start: "",
        monday_end: "",
        tuesday_start: "",
        tuesday_end: "",
        wednesday_start: "",
        wednesday_end: "",
        thursday_start: "",
        thursday_end: "",
        friday_start: "",
        friday_end: "",
        saturday_start: "",
        saturday_end: "",
        sunday_start: "",
        sunday_end: ""
    })


    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    const handleOpenNew = () => {
        setNewAvailability(true);
    };

    const handleCloseNewAvailability = () => {
        setNewAvailability(false);
    };
    const handleCloseEditAvailabilities = () => {
        setEditAvailabilities(false);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedData = {
            ...newAvailabilityFormData,
            [name]: value
        };

        // Validate end date >= start date
        if (
            updatedData.start_date &&
            updatedData.end_date &&
            new Date(updatedData.end_date) < new Date(updatedData.start_date)
        ) {
            alert("End date cannot be before start date!");
            return; // don't update state
        }

        setNewAvailabilityFormData(updatedData);
    };
    const handleChangeEdit = (e) => {
        const { name, value } = e.target;

        let updatedData = {
            ...EditAvailabilityFormData,
            [name]: value
        };

        // Validate end date >= start date
        if (
            updatedData.start_date &&
            updatedData.end_date &&
            new Date(updatedData.end_date) < new Date(updatedData.start_date)
        ) {
            alert("End date cannot be before start date!");
            return; // don't update state
        }

        setEditAvailabilityFormData(updatedData);
    };
    // Adding Hours
    const handleHoursChange = (e) => {
        const { name, value } = e.target;
        setHoursForm((prev) => (
            {
                ...prev,
                [name]: value,
            }
        ))
    }
    const handleSubmitEditAvailabilities = async (e) => {
        e.preventDefault();

        try {
            const {
                id,
                type,
                name,
                description,
                start_date,
                end_date,
                status,
            } = EditAvailabilityFormData;

            const payload = {
                employee_id: employeeId,
                type,
                name,
                description,
                start_date,
                end_date,
                status,
            };

            console.log("Submitting availability:", payload);
            await axios.put(`/api/availabilities/${availabilityId}`, payload);

            setEditAvailabilityFormData({
                id: "",
                type: "",
                name: "",
                start_date: "",
                end_date: "",
                description: "",
                status: "pending",
            });

            setEditAvailabilities(false); // close edit modal
            alert("Availability has been updated.");
        } catch (err) {
            console.error(err);
        }
    };

    const handleCloseEditAvailability = () => {
        setEditAvailabilities(false);
    }

    // 🔹 Convert input value -> format backend accepts, e.g. "23:50:17.614Z"
   const toBackendTime = (val) => {
    if (!val) return null;

    const date = new Date(val); // the local datetime you selected

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = "00";

    // return pure LOCAL TIME (no Z)
    return `${hours}:${minutes}:${seconds}`;
};

    const handleHoursSubmit = async (e) => {
        e.preventDefault();

        if (!availabilityId) {
            alert("No availability selected.");
            return;
        }

        // 1) Get the existing availability from backend
        const res = await axios.get(`/api/availabilities/${availabilityId}`);
        const availability = res.data;

        const availabilityStartDate = new Date(availability.start_date);
        const availabilityEndDate = new Date(availability.end_date);

        // 2) Validate per-day ranges & within start/end dates
        for (const day of days) {
            const startKey = `${day}_start`;
            const endKey = `${day}_end`;

            const startVal = hoursForm[startKey];
            const endVal = hoursForm[endKey];

            if (!startVal || !endVal) continue; // or keep required if you want all days filled

            // Assume inputs are type="datetime-local"
            const startDateTime = new Date(startVal);
            const endDateTime = new Date(endVal);

            if (endDateTime <= startDateTime) {
                alert(
                    `${day[0].toUpperCase() + day.slice(1)}: end time must be after start time.`
                );
                return;
            }

            if (
                startDateTime < availabilityStartDate ||
                endDateTime < availabilityStartDate
            ) {
                alert(
                    `${day[0].toUpperCase() + day.slice(
                        1
                    )}: times cannot be before the availability start date.`
                );
                return;
            }

            if (
                startDateTime > availabilityEndDate ||
                endDateTime > availabilityEndDate
            ) {
                alert(
                    `${day[0].toUpperCase() + day.slice(
                        1
                    )}: times cannot be after the availability end date.`
                );
                return;
            }
        }

        // 3) Build payload in format backend expects
        const payload = {
            availability_id: availability.id,
            name: availability.name,
            type: availability.type,
            start_date: availability.start_date,
            end_date: availability.end_date,

            monday_start: toBackendTime(hoursForm.monday_start),
            monday_end: toBackendTime(hoursForm.monday_end),

            tuesday_start: toBackendTime(hoursForm.tuesday_start),
            tuesday_end: toBackendTime(hoursForm.tuesday_end),

            wednesday_start: toBackendTime(hoursForm.wednesday_start),
            wednesday_end: toBackendTime(hoursForm.wednesday_end),

            thursday_start: toBackendTime(hoursForm.thursday_start),
            thursday_end: toBackendTime(hoursForm.thursday_end),

            friday_start: toBackendTime(hoursForm.friday_start),
            friday_end: toBackendTime(hoursForm.friday_end),

            saturday_start: toBackendTime(hoursForm.saturday_start),
            saturday_end: toBackendTime(hoursForm.saturday_end),

            sunday_start: toBackendTime(hoursForm.sunday_start),
            sunday_end: toBackendTime(hoursForm.sunday_end),
        };

        console.log("Payload being sent:", payload);

        try {
            const updateRes = await axios.put(
                `/api/availabilities/${availability.id}`,
                payload
            );
            console.log("Updated availability:", updateRes.data);
            alert("Your availability has been updated.");
            // here you can close modal or reset form if you want
        } catch (err) {
            console.error("Update failed:", err.response?.data || err);
            alert("Backend returned 422. Check required fields and formats in payload.");
        }
    };



    const handleSubmitNewAvailability = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                employee_id: employeeId,
                type: newAvailabilityFormData.type,
                name: newAvailabilityFormData.name,
                description: newAvailabilityFormData.description,
                // map to API snake_case here
                start_date: newAvailabilityFormData.start_date,
                end_date: newAvailabilityFormData.end_date,
                status: newAvailabilityFormData.status,
            };

            console.log("Submitting availability:", payload);
            await axios.post(`/api/availabilities/create`, payload);

            // Optionally reset the form
            setNewAvailabilityFormData({
                id: "",
                type: "",
                name: "",
                startDate: "",
                endDate: "",
                description: "",
                status: "pending",
            });

            setNewAvailability(false);
            alert("New Availability has been created. Please insert the hours.")
        } catch (err) {
            console.error("Error creating availability:", err);
        }
    };

    const handleAddHoursStatus = (id) => {
        console.log("handleAddHoursStatus: ", id);
        setAddHours(true);
        setAvailabilityId(id);
    }

    const handleShowAvailabilities = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.get(`http://localhost:8000/availabilities/employee/${employeeId}`);
            setListOfAvailabilities(res.data);
            setShowMyAvailabilities(!showMyAvailabilities);
        } catch (err) {
            console.error(err);
        }

        console.log(listOfAvailabilities);
    };

    const handleAvailabilityId = (id) => {
        try {
            console.log("Availability Id: ", id);
            setAvailabilityId(id || "");
        } catch (err) {
            console.err(err);
        }
    }
    const handleRemove = async (av) => {
        try {
            const confirmed = window.confirm(`Remove "${av.name}"?`);
            if (!confirmed) return;

            await axios.delete(`/api/availabilities/${av.id}`);

            // 🧹 Remove from state right away
            setListOfAvailabilities(prev =>
                prev.filter(item => item.id !== av.id)
            );
            setShowMyAvailabilities(false);

            alert("Removed!");
        } catch (err) {
            console.error(err);
        }
    };
    const handleUpdateAvailability = (av) => {
        try {
            setUpdateAvailability(true);
            setEditAvailabilities(true);
            setAvailabilityId(av.id);

        } catch (err) {
            console.err(err);
        }
    }

    const handleCalenderView = async (id) => {
        try {
            const res = await axios.get(`/api/availabilities/${id}`);
            // ensure it's always an array
            setAvailabilityView([res.data]);
        } catch (err) {
            console.error(err);
        }
    };
    // ⬅️ put this ABOVE buildEventsFromAvailabilities
    const toTimeNoZ = (timeString) => {
        if (!timeString) return null;
        const [h, m, rest] = timeString.split(":");
        if (!rest) return timeString;
        const seconds = rest.split(".")[0];
        return `${h}:${m}:${seconds}`;
    };

    const buildEventsFromAvailabilities = (availabilityView) => {
        if (!availabilityView) return [];

        const arr = Array.isArray(availabilityView) ? availabilityView : [availabilityView];

        return arr.flatMap((av) => {
            const events = [];
            const { start_date, end_date, name } = av;

            if (av.monday_start && av.monday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [1],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.monday_start),
                    endTime: toTimeNoZ(av.monday_end),
                });
            }

            if (av.tuesday_start && av.tuesday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [2],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.tuesday_start),
                    endTime: toTimeNoZ(av.tuesday_end),
                });
            }

            if (av.wednesday_start && av.wednesday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [3],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.wednesday_start),
                    endTime: toTimeNoZ(av.wednesday_end),
                });
            }

            if (av.thursday_start && av.thursday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [4],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.thursday_start),
                    endTime: toTimeNoZ(av.thursday_end),
                });
            }

            if (av.friday_start && av.friday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [5],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.friday_start),
                    endTime: toTimeNoZ(av.friday_end),
                });
            }

            if (av.saturday_start && av.saturday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [6],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.saturday_start),
                    endTime: toTimeNoZ(av.saturday_end),
                });
            }

            if (av.sunday_start && av.sunday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [0],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.sunday_start),
                    endTime: toTimeNoZ(av.sunday_end),
                });
            }

            return events;
        });
    };


    const events = buildEventsFromAvailabilities(availabilityView);

    return (
        <div className="relative ">
            <Navbar messageState={handleMessageState} />
            <h1 className="md:text-3xl text-lg text-center mt-15 font-bold ">Availability</h1>
            <div className="w-full min-h-screen">
                <div className="flex gap-x-3 px-8 py-10">
                    <div className="-mt-6">
                        <ul className="flex gap-6 ">
                            <li>
                                <button
                                    className="px-2 py-1 text-sm md:text-medium font-semibold border border-gray-400 rounded-sm shadow-sm bg-white hover:scale-105 duration:300 cursor-pointer"
                                    onClick={handleOpenNew}
                                >
                                    New
                                </button>
                            </li>
                            <li>
                                <button onClick={handleShowAvailabilities}
                                    className="px-2 py-1 text-sm md:text-medium font-semibold border border-gray-400 rounded-sm shadow-sm hover:text-gray-700 hover:bg-amber-200 duration:200">
                                    Show My Availabilities
                                </button>
                            </li>
                            <li>
                                <button className="px-2 py-1 text-sm md:text-medium font-semibold border border-gray-400 rounded-sm shadow-sm bg-purple-700 text-white hover:scale-105 duration:300 cursor-pointer">
                                    Notify Manager
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Show the availabilities */}
                <div className="flex border-t py-2  mx-8 bg-white -mt-4 max-h-0 ">
                    <div className="min-h-screen max-h-[1000px]">
                        <FullCalendar
                            plugins={[timeGridPlugin]}
                            initialView="timeGridWeek"
                            height={"auto"}
                            weekends={true}
                            events={events}
                            titleFormat={{
                                month: "long",
                                year: "numeric",
                                day: "numeric",
                            }}
                        />
                    </div>
                </div>

                {newAvailability && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        onClick={handleCloseNewAvailability}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">New Availability</h2>
                                <button
                                    onClick={handleCloseNewAvailability}
                                    className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmitNewAvailability} className="space-y-4">
                                <div className="md:grid md:grid-col-2 flex justify-between gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 mb-1">
                                            Type
                                        </label>
                                        <select
                                            name="type"
                                            value={newAvailabilityFormData.type}
                                            onChange={handleChange}
                                            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                            required
                                        >
                                            <option value="">Select type</option>
                                            <option value="available">Available</option>
                                            <option value="unavailable">Unavailable</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newAvailabilityFormData.name}
                                            onChange={handleChange}
                                            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                            placeholder="e.g. Fall Availability"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="my-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={newAvailabilityFormData.description}
                                        onChange={handleChange}
                                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300 w-full"
                                        rows={2}
                                        placeholder="Optional notes for your manager..."
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={newAvailabilityFormData.startDate}
                                        onChange={handleChange}
                                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={newAvailabilityFormData.endDate}
                                        onChange={handleChange}
                                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseNewAvailability}
                                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium rounded-md bg-purple-700 text-white hover:bg-purple-800"
                                    >
                                        Save Availability
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {editAvailabilities && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        onClick={handleCloseEditAvailabilities}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Edit Availability</h2>
                                <button
                                    onClick={handleCloseEditAvailabilities}
                                    className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmitEditAvailabilities} className="space-y-4">
                                <div className="md:grid md:grid-col-2 flex justify-between gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 mb-1">
                                            Type
                                        </label>
                                        <select
                                            name="type"
                                            value={EditAvailabilityFormData.type}
                                            onChange={handleChangeEdit}
                                            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                            required
                                        >
                                            <option value="">Select type</option>
                                            <option value="available">Available</option>
                                            <option value="unavailable">Unavailable</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={EditAvailabilityFormData.name}
                                            onChange={handleChangeEdit}
                                            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                            placeholder="e.g. Fall Availability"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="my-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={EditAvailabilityFormData.description}
                                        onChange={handleChangeEdit}
                                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300 w-full"
                                        rows={2}
                                        placeholder="Optional notes for your manager..."
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={EditAvailabilityFormData.start_date}
                                        onChange={handleChangeEdit}
                                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={EditAvailabilityFormData.end_date}
                                        onChange={handleChangeEdit}
                                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-purple-300"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditAvailability}
                                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium rounded-md bg-purple-700 text-white hover:bg-purple-800"
                                    >
                                        Save Availability
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Show the Availability */}
                {
                    showMyAvailabilities && (
                        <div className="fixed inset-0 z-[60] flex flex-col gap-y-2 items-center justify-center bg-black/40 backdrop-blur-sm">
                            {
                                listOfAvailabilities.map((av, key) => (
                                    <div className="flex gap-y-2 flex-col bg-white px-3 py-2 rounded-sm border-gray-400 shadow-3xl shadow-blue-300" key={key}>
                                        <div className="text-gray-700 text-sm mb-1 hover:text-red-600 hover:font-semibold hover:text-medium" onClick={() => setShowMyAvailabilities(false)}>
                                            x
                                        </div>
                                        <div  className="border-black border-2 px-2 py-1 rounded-sm shadow-2xl  hover:cursor-cell mb-1"
                                            onClick={() => handleAvailabilityId(av.id)}>
                                            <div className="flex gap-x-3 justify-start text-sm my-2">
                                                <button
                                                    onClick={() => handleRemove(av)}
                                                    className="text-red-400 border-none bg-gray-50 px-1 py-1 font-bold shadow-sm rounded-medium">
                                                    Remove
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateAvailability(av)}
                                                    className="text-green-400 border-none bg-gray-50 px-1 py-1 font-bold shadow-sm rounded-medium">
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => handleAddHoursStatus(av.id)}
                                                    className="text-blue-400 border-none bg-gray-50 px-1 py-1 font-bold shadow-sm rounded-medium">
                                                    Add Hours
                                                </button>
                                                <button
                                                    onClick={() => handleCalenderView(av.id)}
                                                    className="text-blue-400 border-none bg-gray-50 px-1 py-1 font-bold shadow-sm rounded-medium">
                                                    Calendar
                                                </button>
                                            </div>
                                            <hr className="" />
                                            <div className="">
                                                <div className="flex gap-x-3">
                                                    <h3 className="text-medium md:text:lg font-bold text-purple-800">Name</h3>
                                                    <p className="text-medium md:text-lgfont-sans">{av.name}</p>
                                                </div>
                                                <div className="flex gap-x-3">
                                                    <h3 className="text-medium md:text:lg font-bold text-purple-800">Description</h3>
                                                    <p className="text-medium md:text-lgfont-sans text-wrap">{av.description}</p>
                                                </div>
                                                <div className="flex gap-x-3">
                                                    <h3 className="text-medium md:text:lg font-bold text-purple-800">Start Date</h3>
                                                    <p className="text-medium md:text-lgfont-sans text-wrap">{av.start_date}</p>
                                                </div>
                                                <div className="flex gap-x-3">
                                                    <h3 className="text-medium md:text:lg font-bold text-purple-800">End Date</h3>
                                                    <p className="text-medium md:text-lgfont-sans text-wrap">{av.end_date}</p>
                                                </div>
                                                <div className="flex gap-x-3">
                                                    <h3 className="text-lg md:text:xl font-bold text-purple-800">Status</h3>
                                                    <p className={`text-medium md:text-lg font-sans font-bold text-wrap ${av.status == "pending" ? "text-yellow-600" : av.status == "approved" ? "text-green-500" : "text-red-600"}`}>{av.status}</p>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ) 
                }
                {
                    addHours ? (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <form
                                onSubmit={handleHoursSubmit}
                                className="bg-white flex flex-col gapy-3 px-10 py-6 rounded-medium border-gray-200"
                            >
                                <p
                                    className="text-red-600 font-semibold hover:text-red-800 text-xl cursor-pointer"
                                    type="button"
                                    onClick={() => setAddHours(false)}
                                >
                                    x
                                </p>

                                <div className="flex gap-x-2 justify-around">
                                    <h1 className="text-gray-800 font-bold text-center text-lg md:text-xl my-1">
                                        Update
                                    </h1>
                                    <button
                                        type="submit"
                                        className="px-2 py-1 rounded-sm bg-gray-300 text-sm font-semibold border-green-200 border-2 shadow-sm shadow-yellow-100 hover:text-white hover:bg-purple-400"
                                    >
                                        Save
                                    </button>
                                </div>

                                <hr className="my-2" />

                                {/* MONDAY */}
                                <div className="flex flex-col">
                                    <label className="text-medium md:text-lg font-bold text-center text-blue-700">
                                        Monday
                                    </label>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">Start time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            name="monday_start"
                                            value={hoursForm.monday_start}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">End time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="ml-2"
                                            name="monday_end"
                                            value={hoursForm.monday_end}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                </div>

                                <hr className="my-2" />

                                {/* TUESDAY */}
                                <div className="flex flex-col">
                                    <label className="text-medium md:text-lg font-bold text-center text-blue-700">
                                        Tuesday
                                    </label>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">Start time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            name="tuesday_start"
                                            value={hoursForm.tuesday_start}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">End time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="ml-2"
                                            name="tuesday_end"
                                            value={hoursForm.tuesday_end}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                </div>

                                <hr className="my-2" />

                                {/* WEDNESDAY */}
                                <div className="flex flex-col">
                                    <label className="text-medium md:text-lg font-bold text-center text-blue-700">
                                        Wednesday
                                    </label>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">Start time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            name="wednesday_start"
                                            value={hoursForm.wednesday_start}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">End time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="ml-2"
                                            name="wednesday_end"
                                            value={hoursForm.wednesday_end}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                </div>

                                <hr className="my-2" />

                                {/* THURSDAY */}
                                <div className="flex flex-col">
                                    <label className="text-medium md:text-lg font-bold text-center text-blue-700">
                                        Thursday
                                    </label>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">Start time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            name="thursday_start"
                                            value={hoursForm.thursday_start}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">End time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="ml-2"
                                            name="thursday_end"
                                            value={hoursForm.thursday_end}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                </div>

                                <hr className="my-2" />

                                {/* FRIDAY */}
                                <div className="flex flex-col">
                                    <label className="text-medium md:text-lg font-bold text-center text-blue-700">
                                        Friday
                                    </label>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">Start time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            name="friday_start"
                                            value={hoursForm.friday_start}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">End time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="ml-2"
                                            name="friday_end"
                                            value={hoursForm.friday_end}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                </div>

                                <hr className="my-2" />

                                {/* SATURDAY */}
                                <div className="flex flex-col">
                                    <label className="text-medium md:text-lg font-bold text-center text-blue-700">
                                        Saturday
                                    </label>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">Start time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            name="saturday_start"
                                            value={hoursForm.saturday_start}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">End time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="ml-2"
                                            name="saturday_end"
                                            value={hoursForm.saturday_end}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                </div>

                                <hr className="my-2" />

                                {/* SUNDAY */}
                                <div className="flex flex-col">
                                    <label className="text-medium md:text-lg font-bold text-center text-blue-700">
                                        Sunday
                                    </label>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">Start time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            name="sunday_start"
                                            value={hoursForm.sunday_start}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                    <div className="flex gap-x-3">
                                        <label className="text-purple-800 font-bold">End time</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="ml-2"
                                            name="sunday_end"
                                            value={hoursForm.sunday_end}
                                            onChange={handleHoursChange}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <h1></h1>
                    )
                }



                <div
                    className={`absolute min-h-screen -top-5 bottom-0  h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-1000 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <Message onClose={() => setMessage(false)} />
                </div>
            </div>
        </div>
    );
};

export default EmployeeAvailabilities;
