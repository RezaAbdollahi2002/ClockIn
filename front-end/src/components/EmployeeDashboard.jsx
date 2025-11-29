// EmployeeDashboard.js
import { useState, useEffect } from "react";
import axios from "axios";
import Message from "./Message";
import EmployeeShiftsDashboard from "./EmployeeShiftsDashboard";
import EmployeeShiftWeeklyReviw from './EmployeeShiftWeeklyReviw';
import Navbar from "./Navbar";
import EmployeeAnnouncement from "./EmployeeAnnouncement";
import ElectricBorder from "./Animations/ElectricBorder";
import Avatar from "../assets/Avatar.webp";


const EmployeeDashboard = ({ message, setMessage }) => {
  const [employeeName, setEmployeeName] = useState("Employee");
  const [profilePic, setProfilePic] = useState(Avatar);
  const employeeId = localStorage.getItem("employee_id");


  useEffect(() => {
    if (!employeeId) return;
    axios
      .get("/api/employees/employee-name", { params: { employee_id: employeeId } })
      .then((res) => setEmployeeName(res.data.first_name))
      .catch((err) => console.error(err));
  }, [employeeId]);

  useEffect(() => {
    const getEmployee = async () => {
      try {
        const res = await axios.get(`/api/employees/settings/${employeeId}/employee-info`);
        setProfilePic(res.data.profile_pic);
      } catch (err) {
        console.error(err);
      }
    }
    getEmployee();
  }, [employeeId])

  return (
    <div className="bg-[#F7F7FC] min-h-screen max-h-screen relative top-0 pt-8">
      <div className="flex flex-col gap-x-3 justify-center">
        {/* image */}
        <div>
          <img src={`/api/${profilePic}`} className="w-[100px] h-[100px] rounded-full text-center mx-auto mt-10" />

        </div>
        <div>
          <h1 className="md:text-3xl text-xl font-bold mt-3 text-center mb-2 text-black">
            Welcome Back, {employeeName}
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 ">
        {/* Left panel */}

        <div className="col-span-1 md:col-span-4 lg:col-span-2  rounded-xl p-4 overflow-auto max-h-[90vh] bg-[#FFFFFF] shadow-2xl shadow-blue-700 border-black border-2 ">
          <h2 className="text-xl font-bold mb-3 mx-4 text-[#4A148C]">Announcements</h2>
          <div className="px-6">
            < EmployeeAnnouncement />
          </div>

          <h2 className="text-xl font-bold mb-3 mx-4 text-[#4A148C] mt-4">My Shifts</h2>
          <div className="px-6">
            <EmployeeShiftsDashboard employee_id={employeeId} />
          </div>
        </div>

        {/* Right panel */}

        <div className="col-span-1 md:col-span-4 lg:col-span-2  rounded-xl p-4 shadow-2xl h-full bg-[#FFFFFF] shadow-amber-200 border-black border-2  ">
          <EmployeeShiftWeeklyReviw employeeId={employeeId} />
        </div>


      </div>

      {/* Overlay*/}
      {

        <>

          <div
            className={`absolute top-0 bottom-0 min-h-screen right-0 h-[calc(100%-4rem)] w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-1000 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
              }`}
          >
            <Message onClose={() => setMessage(false)} />
          </div>
        </>

      }



    </div>
  );
};

export default EmployeeDashboard;
