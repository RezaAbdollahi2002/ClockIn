import { useState, useEffect } from "react";
import axios from "axios";
import Message from "../../Message/Message";
import EmployeeShiftsDashboard from "./EmployeeShiftsDashboard";
import EmployeeShiftWeeklyReviw from "./EmployeeShiftWeeklyReviw";
import Navbar from "../../Navbar/Navbar";
import EmployeeAnnouncement from "./EmployeeAnnouncement";
// import ElectricBorder from "./Animations/ElectricBorder";
import ChatBot from "../../AI/ChatBot";
import Avatar from "../../../assets/Avatar.webp";

const EmployeeDashboard = ({ message, setMessage, activeBot, setActiveBot }) => {
  const [employeeName, setEmployeeName] = useState("Employee");
  const [profilePic, setProfilePic] = useState(Avatar);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const employeeId = localStorage.getItem("employee_id");

    if (!employeeId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchEmployeeData = async () => {
      try {
        const [nameResponse, profileResponse] = await Promise.all([
          axios.get("/api/employees/employee-name", {
            params: { employee_id: employeeId },
            signal: controller.signal,
          }),
          axios.get(`/api/employees/settings/${employeeId}/employee-info`, {
            signal: controller.signal,
          }),
        ]);

        setEmployeeName(nameResponse.data.first_name || "Employee");
        setProfilePic(profileResponse.data.profile_pic || Avatar);
        console.log(profileResponse.data.profile_pic );
      } catch (err) {
        if (axios.isCancel(err)) return;

        console.error("Error fetching employee data:", err);
        setError("Unable to load employee information");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();

    return () => controller.abort();
  }, []);

  const handleCloseMessage = () => setMessage(false);

  const employeeId = localStorage.getItem("employee_id");

  return (
    <div className="bg-gray-200 min-h-screen">
      <div  className=" min-h-screen h-full  bg-gray-50 pt-8 md:max-w-[1200px] md:mx-auto">
        <header className="flex flex-col justify-center gap-3">
          <div className="mx-auto mt-10">
            <img
              src={`/api/${profilePic}`}
              alt={`${employeeName}'s profile`}
              className="mx-auto h-[100px] w-[100px] rounded-full border-2 border-gray-300 object-cover shadow-md"
              onError={(e) => {
                e.target.src = Avatar;
              }}
            />
          </div>

          <div>
            <h1 className="mb-2 mt-3 text-center text-xl font-bold text-gray-900 md:text-3xl">
              {loading ? "Loading..." : `Welcome Back, ${employeeName}`}
            </h1>
            {error && (
              <p className="text-center text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 gap-6 p-6 md:grid-cols-4">
          {/* Left Panel */}
          <section
            className="col-span-1 max-h-[90vh] overflow-auto rounded-lg border border-gray-300 bg-white p-6 shadow-lg md:col-span-4 lg:col-span-2"
            aria-label="Shifts and Announcements"
          >
            <div className="mb-8 border-b border-gray-200 pb-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                My Shifts
              </h2>
              <div>
                <EmployeeShiftsDashboard employee_id={employeeId} />
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Announcements
              </h2>
              <div>
                <EmployeeAnnouncement />
              </div>
            </div>
          </section>

            {/* Right Panel */}
            <section
              className="col-span-1 h-full rounded-lg border border-gray-300 bg-white p-6 shadow-lg md:col-span-4 lg:col-span-2"
              aria-label="Weekly Review"
            >
              <EmployeeShiftWeeklyReviw employeeId={employeeId} />
            </section>
       </main>
</div>
          {/* Message Panel */}
          {message && (
            <aside
              className={`fixed right-0 top-0 z-50 h-screen w-[350px] transform overflow-auto border-l border-gray-300 bg-white p-4 shadow-2xl transition-transform duration-300 ease-in-out ${
                message ? "translate-x-0" : "translate-x-full"
              }`}
              role="complementary"
              aria-label="Message Panel"
            >
              <Message
                onClose={handleCloseMessage}
                activeBot={activeBot}
                setActiveBot={setActiveBot}
              />
            </aside>
          )}

          {/* ChatBot */}
          {activeBot && (
            <aside
              className="fixed left-4 top-20 max-h-[600px] w-full max-w-[400px] rounded-lg border border-gray-300 bg-white shadow-xl"
              role="complementary"
              aria-label="Chat Assistant"
            >
              <ChatBot />
            </aside>
          )}
      
    </div>
  );
};

export default EmployeeDashboard;