import { useState, useEffect } from 'react';
import React from 'react'
import Message from '../Message'
import { FaHireAHelper } from "react-icons/fa";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';




const EmployeeRequestsMain = ({ message, setMessage }) => {

  const [shifts, setShifts] = useState([]);
  const [shiftIdCover, setShiftIdCover] = useState(NaN);
  const [targetEmployeeIdTrade, setTargetEmployeeIdTrade] = useState(NaN);
  const [tradeMode, setTradeMode] = useState(false);
  const [shiftsCoversAvailable, setShiftCoversAvailable] = useState([]);
  const [shiftsTradeAvailable, setShiftTradeAvailable] = useState([]);
  const [relaod, setReload] = useState(false);
  const [employerId, setEmployerId] = useState(NaN);
  const employeeId = localStorage.getItem("employee_id");
  const navigate = useNavigate();


  const refresh = () => {
    navigate(0);
  };

  useEffect(() => {
    if (!employeeId) return;
    const getEmployer = async () => {
      try{
      const res = await axios.get(`/api/shifts/employee`, null, { params: { "employee_id": employeeId } });
        setEmployerId(res.data.employer_id);
        console.log("EmployrId: ", res.data.employer_id);
      }catch(err){
        console.error(err);
      }

    }
    getEmployer();

  }, [employeeId])

  useEffect(() => {
    if (!employeeId) return;
    const getEmployeeShifts = async () => {
      try {
        const res = await axios.get(`/api/employee/shifts-dashboard`, { params: { "employee_id": employeeId } });
        setShifts(res.data);
        console.log("Employee id in EmployeeRequestsMain: ", employeeId);
        console.log("shifts:", res.data);
      } catch (err) {
        console.error(err);
      }
    }
    getEmployeeShifts();
  }, [employeeId])

  const handleRequestCover = async (id) => {
    if (!id) return;
    try {
      await axios.post(`/api/shifts/${id}/cover-request`, null, { params: { "requester_id": employeeId } })
      alert("Cover has been requested.");
      refresh();
    } catch (err) {
      console.error("Error requesting cover:", err);
      console.log("Server response:", err.response?.data);
    }
  }
  const handleRequestTrade = async (id) => {
    if (!id) return;
    try {
      console.log()
      await axios.post(`/api/shifts/${id}/trade-request`, null, { params: { "requester_id": employeeId, "target_employee_id": targetEmployeeIdTrade } })
      refresh();
    } catch (err) {
      console.error("Error requesting cover:", err);
      console.log("Server response:", err.response?.data);
    }
  }
  useEffect(() => {
    if (!employeeId) return;

    const getCoverShifts = async () => {
      try {
        const res = await axios.get(`/api/shifts/cover-available`, {
          params: { employee_id: employeeId }
        });
        setShiftCoversAvailable(res.data);

      } catch (err) {
        console.error("Error fetching cover shifts:", err);
      }
    };

    getCoverShifts();
  }, [employeeId]);

  const handleAcceptCover = async (shift) => {
    if (!shift) return;
    console.log(`shift.request_id: ${shift.request_id} and responder_id : ${employeeId} and accepted is true `);
    try {
      await axios.put(`/api/shifts/cover-request/${shift.request_id}/respond`, null, {
        params: {
          "responder_id ": employeeId, "accept": true
        }

      })
      alert(`You have sussecfully accepted ${shift.requester.last_name}'s shift.`);
      refresh();

    } catch (err) {
      console.error(err);
    }
  }
  // const handleAcceptCoverFalse = async (shift) => {
  //   if (!shift) return;
  //   try {
  //     await axios.put(`/api/shifts/cover-request/${shift.request_id}/respond`,null, {
  //       params: {
  //         "responder_id ": employeeId, "accept": false
  //       }
  //     })
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }\

  const getTradeSifts = async (shiftProposer, shiftTaker) => {
    if (!employeeId) return;
    await axios.post(`/api/shifts/trade-request`, null, {
      params: {
        "proposer_shift_id ": shiftProposer.id,
        "target_shift_id ": shiftTaker.id,
        "proposer_id ": employeeId,
        "target_employee_id ": shiftTaker.employee_id,
      }
    })
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);

    return date.toLocaleString("en-US", {
      month: "short",      // Nov
      day: "2-digit",      // 28
      year: "numeric",     // 2025
      hour: "numeric",     // 7
      minute: "2-digit",   // 04
      hour12: true,        // AM/PM
    });
  };

  return (
    <div className='mt-10 px-10 py-5 '>
      {/* Top */}
      <div >
        <div className='flex justify-center gap-x-3'>
          <h1 className='text-center font-bold text-lg md:text-xl text-gray-800'>Requests</h1>
          <FaHireAHelper className='text-purple-800 w-[29px] h-[25px] mt-0.5' />
        </div>
      </div>
      <hr className='my-3' />
      {/* Body */}
      <div className='md:grid md:grid-cols-2 md:gap-y-3  gap-2'>
        <div className='bg-white flex flex-col gap-y-3 py-3 rounded-md border-black border-2 shadow-md shadow-blue-400'>
          {/* Header */}
          <h1 className='text-gray-800 text-center font-semibold md:text-xl'>Cover & Trade</h1>
          <hr className='text-blue-800 font-bold ' />
          {/* body */}
          <div className='max-h-[600px] overflow-y-auto space-y-3  border-gray-300 mx-3'>
            {
              shifts.map((shift, key) => (
                <div

                  key={key} className='border-2 px-2 py-1 rounded-md border-gray-300 shadow-sm grid grid-cols-2 text-sm md:text-md '>
                  <div className='flex flex-col gap-y-3'>
                    <h1 className='text-purple-800 font-semibold'>Title <span className='text-gray-800 text-sm font:md'>{shift.title}</span></h1>
                    <h1 className='text-purple-800 font-semibold'>Role <span className='text-gray-800 text-sm font:md'>{shift.role}</span></h1>
                    <h1 className='text-purple-800 font-semibold'>Location <span className='text-gray-800 text-sm font:md'>{shift.location}</span></h1>
                    <h1 className='text-purple-800 font-semibold'>Description <span className='text-gray-800 text-sm font:md'>{shift.description}</span></h1>
                  </div>
                  <div className='flex flex-col gap-y-2'>
                    <h1 className='text-purple-800 font-semibold'>Start Time <span className='text-gray-800 text-sm font:md'>{formatDateTime(shift.start_time)}</span></h1>
                    <h1 className='text-purple-800 font-semibold'>End Time <span className='text-gray-800 text-sm font:md'>{formatDateTime(shift.end_time)}</span></h1>
                  </div>

                  <button
                    onClick={() => handleRequestCover(shift.id)}
                    className='text-gray-700 bg-purple-300 border-grya-800 text-sm rounded-md mt-2 px-1 py-1 hover:text-white hover:bg-gray-800  text-center w-full'>
                    Request Cover
                  </button>
                  <button
                    onClick={() => handleRequestTrade(shift.id)}
                    className='text-gray-700 bg-purple-300 ml-1 border-grya-800 text-sm rounded-md mt-2 px-1 py-1 hover:text-white hover:bg-gray-800  text-center w-full'>
                    Request Trade
                  </button>
                </div>
              ))
            }
          </div>
        </div>

        <div className='bg-white flex flex-col mt-2 md:mt-0 gap-y-3 py-3 rounded-md border-black border-2 shadow-md shadow-blue-400'>
          {/* Top */}
          <h1 className='text-gray-800 text-center font-semibold   md:text-xl'>Claim</h1>
          <hr className='text-blue-800 font-bold ' />
          {/* Body */}
          <div className='px-3 py-2 md:grid md:grid-cols-2 md:gap-x-2 flex flex-col'>
            {/* Left */}
            <div className='border-2 px-2 py-2 rounded-sm border-gray-800 max-h-[600px] overflow-y-auto'>
              <h1 className='text-center font-semibold text-md md:text-lg'>Need Cover</h1>
              <hr className='my-2' />
              {
                shiftsCoversAvailable.map((shift, key) => (
                  <div key={key} className='border-gray-800 border-2 rounded-sm px-2 py-1 shadw-md gap-y-2  flex flex-col my-2'>

                    <div className='flex justify-center gap-x-3 ' >
                      <h1 className='text-purple-800 fond-semibold '>{shift.requester.first_name} {shift.requester.last_name} </h1>
                      <button
                        onClick={() => handleAcceptCover(shift)}
                        className='text-grya-700 border-gray-800 rounded-md px-1  bg-green-300 text-sm hover:text-black hover:bg-amber-300'>Accept</button>
                      {/* <button
                        onClick={()=>handleAcceptCoverFalse(shift)}
                        className='text-grya-700 border-gray-800 rounded-md px-1  bg-red-300 text-sm hover:text-black hover:bg-amber-300'>Cancle</button> */}
                    </div>
                    <hr />
                    <div className='md:gird md:grid-cols-2 md:gap-x-2'>
                      <div className='md:grid md:grid-cols-2'>
                        <div>
                          <h1 className='text-sm lg:text-md font-semibold text-purple-800'>Title <span className='text-xs md:text-sm text-gray-800 ml-1'>{shift.shift.title}</span></h1>
                          <h1 className='text-sm lg:text-md font-semibold text-purple-800'>Role <span className='text-xs md:text-sm text-gray-800 ml-1'>{shift.shift.role}</span></h1>
                          <h1 className='text-sm lg:text-md font-semibold text-purple-800'>Location <span className='text-xs md:text-sm text-gray-800 ml-1'>{shift.shift.location}</span></h1>
                        </div>
                        <div>
                          <h1
                            className={`text-right text-sm ${shift.status === "pending"
                              ? "text-yellow-500"
                              : shift.status === "accepted"
                                ? "text-green-600"
                                : "text-red-500"
                              }`}
                          >
                            {shift.status}
                          </h1>                        </div>
                      </div>
                      <div>
                        <h1 className='text-sm lg:text-md font-semibold text-purple-800'>Start Time <span className='text-gray-800 text-xs md:text-sm ml-1'>{formatDateTime(shift.shift.start_time)}</span></h1>
                        <h1 className='text-sm lg:text-md font-semibold text-purple-800'>End Time <span className='text-gray-800 text-xs md:text-sm ml-1'>{formatDateTime(shift.shift.end_time)}</span></h1>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            {/* Right */}
            <div className='border-2 border-blue-200 px-2 py-2 '>
              <div className='flex justify-center gap-x-2'>
                <h1 className='text-center font-semibold text-md md:text-lg'>Trade</h1>
                <button className='text-xs rounded-md bg-green-500 text-gray-800  border-black  shadow-sm  px-1 py-1'>Trade</button>
              </div>
              <hr className='my-2' />
              <div className='px-2 py-1 border-gray-800'>
                {

                }
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        tradeMode && (
          <div>

          </div>
        )
      }
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
  )
}

export default EmployeeRequestsMain
