import { useState, useEffect } from "react";
import axios from "axios";

const EmployeeShiftsDashboard = ({ employee_id }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [Announcements,setAnnouncements] = useState([]); 

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
    <div className="px-4 py-2 flex flex-col space-y-4 text-black bg-transparent">
        
        <h1 className="md:text-xl text-lg mt-10 font-bold text-[#0f0c45]">My Shifts</h1>
      {loading && <p>Loading...</p>}

      {!loading && error && <p className="text-red-500">{error}</p>}

      {!loading && !error && shifts.length === 0 && (
        <p className="text-black-500 font-semibold ">No shifts available</p>
      )}
    <div className="p-4 rounded-lg shadow-xl border  w-full max-w-full flex flex-col gap-y-4 border-gray-400 ">
        {!loading &&
        !error &&
        shifts.map((shift,index) => (
            <>
                
                <div
                key={index}
                className="bg-transparent border border-gray-400  px-8 py-5 rounded-sm shadow-4xl hover:border hover:shadow-6xl hover:show-white  hover:border-[#1a1365] duration-200 "
            >
                <h3 className="font-bold text-black">{shift.role}</h3>
                <p className="text-black">
                {new Date(shift.start_time).toLocaleString()} –{" "}
                {new Date(shift.end_time).toLocaleString()}
                </p>
                <p className="text-black">{shift.location}</p>
            </div>
            </>
          
        ))}
    </div>
      
    </div>
  );
};

export default EmployeeShiftsDashboard;
