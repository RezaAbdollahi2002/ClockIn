// EmployeeSchedule.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Navbar from "../../Navbar/Navbar";
import Message from "../../Message/Message";
import ChatBot from "../../AI/ChatBot";
const EmployeeSchedule = ({ message, handleMessageState, setMessage, activeBot, setActiveBot }) => {
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
    <div className="bg-gray-800 h-screen">
 <div className=" min-w-[700px] max-w-full overflow-y-auto max-h-screen md:max-w-[1200px] mx-auto bg-white h-full shadow-2xl rounded-lg shadow-white border-r border-l border-blue-600 border-2 ">
      {/* Navbar */}
      <div className="w-full  flex justify-center mt-12 ">
        <h1 className="font-bold md:text-2xl text-medium text-purple-800 ">Schedule</h1>
      </div>

      <div className="p-4 w-full flex justify-center  h-full " >
        {/* Right panel: calendar */}
        <div className="w-full max-h-[800px] md:max-w-[1200px]">
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
            slotEventOverlap={false}
              eventMaxStack={4}
              dayMaxEvents={4}
              eventClassNames="shadow-md"
              dayCellClassNames="hover:bg-blue-50"
              viewClassNames="border-gray-800"
            eventContent={(arg) => {
              const {
                role,
                // shift,
                location,
                profilePicture,
                firstName,
                lastName,
              } = arg.event.extendedProps;

              const fullName = `${firstName || ""} ${lastName?.[0] || ""}`.trim();

              return (
                <div className="flex flex-col items-center  gap-2 px-1 py-1 rounded-lg text-white text-xs font-bold overflow-hidden bg-[#1e90ff] w-full " onClick={()=> setVisible(!visible)} >
                  {/* Avatar + name */}
                  <div className={`flex items-center gap-1 min-w-[80px]  ${visible && "flex justify-around "}`} >
                    {profilePicture ? (
                      <img
                        src={`http://localhost:8000${profilePicture}`}
                        alt={fullName}
                        className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-sm md:text-md  font-semibold flex-shrink-0">
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
                        <div className="flex flex-col gap-y-2  " >
                          <p className="text-md font-bold">Role <span className="truncate  font-bold text-xs">{role}</span></p>
                          <p className="flex gap-x-1">
                            Location <span className="truncate text-xs font-bold hidden lg:block">
                            {location}
                          </span>
                          </p>
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
    </div>


      {/* Chat Drawer */}
      {message && (
        <div
        className={`absolute top-10 min-h-screen h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-500 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <Message onClose={() => setMessage(false)} activeBot={activeBot} setActiveBot={setActiveBot} />
      </div> 
      )
      }

      {/* Bot */}
      {activeBot && (
        <div className="fixed z-50 top-9 left-0 bg-gray-50 border border-gray-800 rounded-sm shadow-md max-w-[400px] max-h-[600px]">
          <ChatBot />
        </div>
      )}

    </div>
  );
};

export default EmployeeSchedule;
