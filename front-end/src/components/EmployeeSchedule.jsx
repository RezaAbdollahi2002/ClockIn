// EmployeeSchedule.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Navbar from "./Navbar";
import Message from "./Message";

const EmployeeSchedule = ({ message, handleMessageState, setMessage }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const employeeId = localStorage.getItem("employee_id");

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
        }/shifts/employee`,
        {
          params: { employee_id: employeeId },
        }
      )
      .then((res) => {
        // Normalize API response
        const normalized = res.data.map((shift) => ({
          ...shift,
          employee: {
            ...shift.employee,
            firstName: shift.employee?.first_name || "",
            lastName: shift.employee?.last_name || "",
            profilePicture: shift.employee?.profile_picture || null,
          },
        }));
        setShifts(normalized);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load shifts");
        setLoading(false);
      });
  }, [employeeId]);

  const events = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.role} - ${shift.title}`,
    start: new Date(shift.start_time),
    end: new Date(shift.end_time),
    backgroundColor: shift.role === "Supervisor" ? "#dc143c" : "#1e90ff",
    extendedProps: {
      role: shift.role,
      shift: shift.title,
      location: shift.location || "No specified",
      firstName: shift.employee?.firstName,
      lastName: shift.employee?.lastName,
      employeeId: shift.employee_id,
      status: shift.status,
      publishStatus: shift.publish_status,
      description: shift.description,
      profilePicture: shift.employee?.profilePicture,
    },
  }));

  if (loading) return <div>Loading shifts...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="relative min-w-[700px] max-w-full overflow-x-auto max-h-screen ">
      {/* Navbar */}
      <Navbar messageState={handleMessageState} />
      <div className="w-full h-auto flex justify-center mt-5 ">
        <h1 className="font-bold md:text-2xl text-medium">Schedule</h1>
      </div>

      {/* Calendar + List */}
      <div className="p-4 w-full flex justify-center " >
        {/* Right panel: calendar */}
        <div className="w-full ">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            height="auto"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            eventContent={(arg) => {
              const {
                role,
                shift,
                location,
                profilePicture,
                firstName,
                lastName,
              } = arg.event.extendedProps;

              const fullName = `${firstName || ""} ${lastName || ""}`.trim();

              return (
                <div className="flex items-center  gap-2 px-1 py-1 rounded-lg text-white text-xs font-bold overflow-hidden bg-[#1e90ff] w-full " >
                  {/* Avatar + name */}
                  <div className={`flex items-center gap-1 min-w-[80px]  ${visible && "flex justify-around "}`} >
                    {profilePicture ? (
                      <img
                        src={`http://localhost:8000${profilePicture}`}
                        alt={fullName}
                        className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-medium md:text-lg font-bold flex-shrink-0">
                        {firstName ? firstName[0] : "?"}
                      </div>
                    )}
                    <span className="truncate font-bold text-medium md:text-lg" >
                      {fullName}
                    </span>
                  </div>

                  {/* Shift details */}
                  {
                  visible && (
                  <>
                    <div className="flex gap-x-2  " >
                      <span className="truncate  font-bold text-xs">{role}</span>
                      <span className="truncate text-xs font-bold hidden lg:block">
                        {shift}
                      </span>
                      <span className="truncate text-xs font-bold hidden lg:block">
                        {location}
                      </span>
                    </div>
                  </>
                  )
                }
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* Chat Drawer */}
      <div
        className={`absolute top-10 min-h-screen h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-500 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <Message onClose={() => setMessage(false)} />
      </div>
    </div>
  );
};

export default EmployeeSchedule;
