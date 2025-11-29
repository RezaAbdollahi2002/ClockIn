import { useState, useEffect } from "react";
import axios from "axios";

const EmployeeShiftsDashboard = ({ employee_id }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [Announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!employee_id) return;

    setLoading(true);
    setError(""); // reset error
    console.log(employee_id)

    axios
      .get("/api/employee/shifts-dashboard", { params: { employee_id } })
      .then((res) => {
        console.log("res.data:", res.data);
        console.log("Array.isArray(res.data)?", Array.isArray(res.data));
        setShifts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setShifts([]);
          setError("No shifts available");
        } else {
          setError(err.message || "Error fetching shifts");
        }
      })
      .finally(() => setLoading(false));
  }, [employee_id]);

  return (
    <div className="px-4 py-2 flex flex-col space-y-4 text-black ">

      {loading && <p>Loading...</p>}

      {!loading && error && <p className="text-red-500">{error}</p>}

      {!loading && !error && shifts.length === 0 && (
        <p className="text-black-500 font-semibold ">No shifts available</p>
      )}
      <div className="p-4 rounded-lg shadow-xl  w-full max-w-full flex flex-col gap-y-4 border-black border-2 bg-transparent max-h-[250px] overflow-y-auto">
        {!loading &&
          !error &&
          shifts.map((shift, index) => (
            <>
              <div className="bg-[#EBF0F0] px-2 py-2 rounded-md hover:bg-[#CFD2D2] duration-75 ">
                <div className="flex-col  md:flex  gap-x-1  ">
                  <div className="flex gap-1">
                    <h3 className="font-bold text-medium md:text-lg text-purple-800 ">Role:</h3>
                    <h3 className="font-semibold text-gray-800 text-sm md:text-md mt-1">{shift.role}</h3>
                    
                  </div>
                  <div className="flex gap-1 ">
                      <h3 className="font-bold text-medium md:text-lg text-purple-800 ">Location</h3>
                      <h3 className="font-semibold text-gray-800 text-sm md:text-md mt-1">{shift.location}</h3>
                    </div>
                </div>
                <hr className="font-bold my-1" />
                <p className="text-gray-800">
                  {new Date(shift.start_time).toLocaleString()} <span className="text-purple-800 font-bold text-md">-</span>{" "}
                  {new Date(shift.end_time).toLocaleString()}
                </p>
              </div>
            </>

          ))}
      </div>

    </div>
  );
};

export default EmployeeShiftsDashboard;
