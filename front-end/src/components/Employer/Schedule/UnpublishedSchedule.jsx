import React, { useState, useEffect } from 'react';
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Typewriter } from 'react-simple-typewriter';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000";

const UnpublishedSchedule = ({setShowEditForm,onEditClick}) => {
    // State Management
    const [unpublishedShifts, setUnpublishedShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedShift, setSelectedShift] = useState(null);
    const [remove, setRemove] = useState(false);
    const navigate = useNavigate();

    const employerId = localStorage.getItem("employer_id");

    // Fetch unpublished shifts
    useEffect(() => {
        if (!employerId) {
            setError("Employer ID not found");
            setLoading(false);
            return;
        }

        const fetchUnpublishedShifts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/shifts/employer`, {
                    params: {
                        employer_id: employerId,
                        published: false
                    }
                });
                setUnpublishedShifts(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching unpublished shifts:", err);
                setError("Failed to load unpublished shifts. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUnpublishedShifts();
    }, [employerId, remove]);

    // Event Handlers
    const handleShiftClick = (shift) => {
        setSelectedShift(selectedShift?.id === shift.id ? null : shift);
    };

    const handlePublishShift = async (shiftId) => {
        if (!window.confirm("Are you sure you want to publish this shift?")) {
            return;
        }

        try {
            // Fetch shift details from API
            const res = await axios.get(`${API_BASE_URL}/shifts/employee-id/${shiftId}`);
            console.log("employee id :::::", res.data.employee_id);

            // Update shift with published status
            await axios.put(`${API_BASE_URL}/shifts/${shiftId}/edit`, null, {
                params: {
                    shift_if: shiftId,
                    employee_id: res.data.employee_id,  // Fixed typo: enployee_id -> employee_id

                    publish_status: "published"
                }
            });
            console.log()

            // Remove from unpublished list
            setUnpublishedShifts(prev => prev.filter(shift => shift.id !== shiftId));
            setSelectedShift(null); // Clear selection
            alert("Shift published successfully!");
            navigate(0);
        } catch (err) {
            console.error("Error publishing shift:", err);
            console.error("Error details:", err.response?.data);
            alert(`Failed to publish shift: ${err.response?.data?.detail || "Please try again."}`);
        }
    };

    const handleRemoveShift = async (id) => {
        if (!id) return;
        console.log(id);
        const confimed = window.confirm("Are you sure you want to remove this shifts?");
        if (confimed) {
            try {
                await axios.delete(`/api/shifts/${id}`);
                console.log(id);
                navigate(0);
            } catch (err) {
                console.error(err);
                setRemove(true);
            }
        }
    }
    const handleEdit = (shiftId) => {
        console.log("event",shiftId);
    if (shiftId) {
        console.log("shif: ",shiftId);
      onEditClick(shiftId);
    }
  };
    // Transform shifts data for FullCalendar
    const events = unpublishedShifts.map(shift => ({
        id: shift.id,
        title: shift.title || "Untitled Shift",
        start: shift.start_time,
        end: shift.end_time,
        backgroundColor: "#64748b", // Slate gray for unpublished
        borderColor: "#475569",
        extendedProps: {
            role: shift.role,
            location: shift.location,
            profilePicture: shift.employee?.profile_picture || null,
            employeeName: shift.employee?.first_name || "Unassigned",
            description: shift.description,
            status: shift.publish_status
        }
    }));

    // Custom event content renderer
    const renderEventContent = (eventInfo) => {
        const { role, location, profilePicture, employeeName, description } = eventInfo.event.extendedProps;
        const isSelected = selectedShift?.id === eventInfo.event.id;

        return (
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    handleShiftClick(eventInfo.event);
                }}
                className="relative flex items-center gap-2 px-2 py-2 rounded-md text-white text-xs font-medium cursor-pointer
                   hover:opacity-90 transition-opacity h-full w-full bg-purple-950"
            >
                {/* Profile Picture */}
                {profilePicture ? (
                    <img
                        src={`/api/${profilePicture}`}
                        alt={employeeName || "Employee"}
                        className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm hidden sm:block"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-xs font-bold hidden sm:block">
                        {employeeName ? employeeName[0].toUpperCase() : ""}
                    </div>
                )}

                {/* Shift Info */}
                <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-sm">
                        {employeeName || "Unassigned"}
                    </div>
                    <div className="text-xs opacity-90 truncate">
                        {eventInfo.event.title}
                    </div>
                    {isSelected && (
                        <div className="mt-1 text-xs  z-100">
                            <div>{role}</div>
                            {location && <div>📍 {location}</div>}
                            {description && <div className="mt-1 italic">{description}</div>}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishShift(eventInfo.event.id);
                                }}
                                className="mt-2 px-2 py-1 z-100 bg-green-500 hover:bg-green-600 rounded text-white text-xs font-semibold"
                            >
                                ✓ Publish
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveShift(eventInfo.event.id);
                                }}
                                className="mt-2 z-100 px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs font-semibold"
                            >
                                X Remove
                            </button>
                            {/* <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(eventInfo.event.id);
                                }}
                                className="mt-2 z-100 px-2 py-1 bg-purple-500 hover:bg-purple-600 rounded text-white text-xs font-semibold"
                            >
                                 Edit
                            </button> */}
                        </div>
                    )}
                </div>

                {/* Unpublished Badge */}
                {!isSelected && (
                    <div className="absolute top-1  right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        DRAFT
                    </div>
                )}
            </div>
        );
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading unpublished schedule...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6">
            {/* Header */}
            <h1 className="text-center mb-8 text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                <Typewriter
                    words={['Unpublished Schedule']}
                    loop={true}
                    cursor
                    cursorStyle="|"
                    typeSpeed={70}
                    deleteSpeed={50}
                    delaySpeed={1000}
                />
            </h1>

            {/* Info Banner */}
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 text-sm font-medium">
                    📝 These shifts are in draft mode and not visible to employees yet
                </p>
            </div>

            {/* Empty State */}
            {unpublishedShifts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <p className="text-xl font-medium text-gray-600 mb-2">No Unpublished Shifts</p>
                    <p className="text-gray-500">Draft shifts will appear here before publishing.</p>
                </div>
            ) : (
                <>
                    {/* Calendar */}
                    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            events={events}
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek,timeGridDay"
                            }}
                            height="auto"
                            eventContent={renderEventContent}
                            slotEventOverlap={false}
                            eventMaxStack={3}
                            dayMaxEvents={3}
                            eventClassNames="shadow-sm"
                            dayCellClassNames="hover:bg-gray-50"
                            viewClassNames="border-gray-200"
                            allDaySlot={false}
                            slotMinTime="06:00:00"
                            slotMaxTime="23:00:00"
                        />
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-4 text-center">
                            <div className="text-3xl font-bold text-gray-800">{unpublishedShifts.length}</div>
                            <div className="text-sm text-gray-600 mt-1">Draft Shifts</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600">
                                {new Set(unpublishedShifts.map(s => s.employee_id)).size}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Employees</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4 text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {new Set(unpublishedShifts.map(s => s.role)).size}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Roles</div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-4 text-center text-sm text-gray-500">
                        <p>Click on a shift to view details and publish • Unpublished shifts are marked with a DRAFT badge</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default UnpublishedSchedule;