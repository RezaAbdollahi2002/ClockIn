import React, { useState, useEffect } from 'react';
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Typewriter } from 'react-simple-typewriter';
import { FcCalendar } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000";

const PublishedSchedule = () => {
  // State Management
  const [publishedShifts, setPublishedShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    shiftId: null
  });

  const employerId = localStorage.getItem("employer_id");

  // Fetch published shifts
  useEffect(() => {
    if (!employerId) {
      setError("Employer ID not found");
      setLoading(false);
      return;
    }

    const fetchPublishedShifts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/shifts/employer`, {
          params: {
            employer_id: employerId,
            published: true
          }
        });
        setPublishedShifts(response.data);
        console.log("response shifts in published: ", response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching published shifts:", err);
        setError("Failed to load published shifts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedShifts();
  }, [employerId]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  // Event Handlers
  const handleContextMenu = (e, shiftId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      shiftId
    });
  };

  const handleShiftClick = (shift) => {
    setSelectedShift(selectedShift?.id === shift.id ? null : shift);
  };

  const handleRemoveShift = async (shiftId) => {
    if (!window.confirm("Are you sure you want to remove this shift?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/shifts/${shiftId}`);
      setPublishedShifts(prev => prev.filter(shift => shift.id !== shiftId));
      setContextMenu({ visible: false, x: 0, y: 0, shiftId: null });
      alert("Shift removed successfully!");
    } catch (err) {
      console.error("Error removing shift:", err);
      alert("Failed to remove shift. Please try again.");
    }
  };
const handleRemoveShiftCard = async (id) => {
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
            }
        }
    }
  
  // Transform shifts data for FullCalendar
  const events = publishedShifts.map(shift => ({
    id: shift.id,
    title: shift.title || "Untitled Shift",
    start: shift.start_time,
    end: shift.end_time,
    backgroundColor: shift.role === "Supervisor" ? "#eab308" : "#6e2a3c",
    borderColor: shift.role === "Supervisor" ? "#ca8a04" : "#5a1f2f",
    extendedProps: {
      role: shift.role,
      location: shift.location,
      profilePicture: shift.employee.profile_picture,
      employeeName: shift.employee.first_name,
      description: shift.description,
      status: shift.status
    }
  }));


  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    const { role, location, profilePicture, employeeName, description } = eventInfo.event.extendedProps;
    const isSelected = selectedShift?.id === eventInfo.event.id;

    return (
      <div
        onContextMenu={(e) => handleContextMenu(e, eventInfo.event.id)}
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
            src={`${API_BASE_URL}${profilePicture}`}
            alt={employeeName || "Employee"}
            className="w-6 h-6 rounded-full object-cover border-2 border-gray-800 shadow-lg hidden sm:block"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-xs font-bold hidden sm:block">
            {employeeName ? employeeName[0].toUpperCase() : "?"}
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
            <div className="mt-1 text-xs opacity-90">
              <div>{role}</div>
              {location && <div>📍 {location}</div>}
              {description && <div className="mt-1 italic">{description}</div>}
              <button
              onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveShiftCard(eventInfo.event.id);
                                }}
              className='text-red-500 bg-white my-1 text-sm border-gray-800 rounded-lg px-1 hover:text-black hover:bg-red-500'>Remove</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Context Menu Component
  const ContextMenu = () => {
    if (!contextMenu.visible) return null;

    return (
      <div
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 min-w-[150px]"
        style={{
          top: `${contextMenu.y}px`,
          left: `${contextMenu.x}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleRemoveShift(contextMenu.shiftId)}
          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
        >
          🗑️ Remove Shift
        </button>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading published schedule...</p>
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
          words={['Published Schedule']}
          loop={true}
          cursor
          cursorStyle="|"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={1000}
        />
      </h1>

      {/* Empty State */}
      {publishedShifts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4 mx-auto"><FcCalendar  className='mx-auto max-w-[50px] max-h-[50px]'/></div>
          <p className="text-xl font-medium text-gray-600 mb-2">No Published Shifts</p>
          <p className="text-gray-500">Published shifts will appear here once created.</p>
        </div>
      ) : (
        <>
          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              height="auto"
              eventContent={renderEventContent}
              slotEventOverlap={false}
              eventMaxStack={4}
              dayMaxEvents={4}
              eventClassNames="shadow-md"
              dayCellClassNames="hover:bg-blue-50"
              viewClassNames="border-gray-800"
            />
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#6e2a3c] rounded"></div>
              <span className="text-gray-700">Regular Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#eab308] rounded"></div>
              <span className="text-gray-700">Supervisor Shift</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Click on a shift to view details • Right-click to open options menu</p>
          </div>
        </>
      )}

      {/* Context Menu */}
      <ContextMenu />
    </div>
  );
};

export default PublishedSchedule;