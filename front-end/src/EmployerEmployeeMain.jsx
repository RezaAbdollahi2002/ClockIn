import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Message } from "./components";
import axios from "axios";
import AvatarImage from "../src/assets/Avatar.webp"; // adjust relative path as needed
import ShowAvailability from "./components/EmployerEmployeeMain/ShowAvailability";

const EmployerEmployeeMain = ({ message, handleMessageState, setMessage }) => {
  const { state } = useLocation();
  const employeeId = state?.employee;
  const [employee, setEmployee] = useState(null);
  const [showAvailabilityToggle, setShowAvailabilityToggle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!employeeId) return;

    const getEmployee = async () => {
      try {
        console.log("Employee_id: ", employeeId);
        const res = await axios.get(
          `/api/employees/settings/${employeeId}/employee-info`
        );
        setEmployee(res.data);
        console.log("Employee (API response):", res.data);
      } catch (err) {
        console.error(err);
      }
    };

    getEmployee();
  }, [employeeId]);

  useEffect(() => {
    if (employee) {
      console.log("Employee state updated:", employee);
    }
  }, [employee]);

  if (!employee) {
    return <div className="text-white">Loading employee...</div>;
  }

  const handleRemove = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this employee?");
      if (confirmed) {
        await axios.delete(`/api/employees/${employeeId}`);
        navigate('/onboarding/sign-up/employer-dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div>
      {/* Top buttons */}
      <div className="flex gap-x-3 justify-center mt-5">
        <ul className="flex gap-x-3">
          <li>
            <button
              onClick={handleRemove}
              className="text-base lg:text-lg rounded-medium border-gray-500 font-semibold bg-amber-200 px-2 py-1 shadow-lg hover:text-white hover:bg-amber-700 duration-300 hover:cursor-grab">
              Remove
            </button>
          </li>
          <li>
            <button
              onClick={() =>
                setShowAvailabilityToggle((prev) => !prev)
              }
              className="text-base lg:text-lg rounded-sm border-gray-500 font-semibold bg-amber-200 px-2 py-1 shadow-lg hover:text-white hover:bg-amber-700 duration-300 hover:cursor-grab"
            >
              Availability
            </button>
          </li>
        </ul>
      </div>

      {/* Employee info */}
      <div className="mx-auto px-3 py-2 mt-5 text-center max-w-[600px]">
        <div className="mx-auto">
          <img
            src={
              employee.profile_pic
                ? `/api/${employee.profile_pic}`
                : AvatarImage
            }
            className="w-[90px] h-[80px] mx-auto my-5 rounded-full object-cover"
            alt="Employee profile"
          />
        </div>

        <div className="grid grid-cols-2 gap-0">
          <div>
            <h1 className="font-bold text-lg lg:text-xl text-purple-800">
              First name
            </h1>
            <h1 className="font-bold text-lg lg:text-xl text-purple-800">
              Last name
            </h1>
            <h1 className="font-bold text-lg lg:text-xl text-purple-800">
              Date of birth
            </h1>
            <h1 className="font-bold text-lg lg:text-xl text-purple-800">
              Email
            </h1>
            <h1 className="font-bold text-lg lg:text-xl text-purple-800">
              Phone number
            </h1>
          </div>

          <div className="flex flex-col">
            <span className="text-base lg:text-lg font-semibold text-gray-800">
              {employee.first_name}
            </span>
            <span className="text-base lg:text-lg font-semibold text-gray-800">
              {employee.last_name}
            </span>
            <span className="text-base lg:text-lg font-semibold text-gray-800">
              {employee.dob}
            </span>
            <span className="text-base lg:text-lg font-semibold text-gray-800">
              {employee.email}
            </span>
            <span className="text-base lg:text-lg font-semibold text-gray-800">
              {employee.phone_number}
            </span>
          </div>
        </div>
      </div>

      <hr />

      {/* Availability section */}
      {showAvailabilityToggle && <ShowAvailability id={employeeId} />}

      {message && (
        <div
          className={`absolute top-10 h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-1000 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <Message onClose={() => setMessage(false)} />
        </div>
      )}
    </div>
  );
};

export default EmployerEmployeeMain;
