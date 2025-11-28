import React, { useDebugValue } from 'react'
import { useState, useEffect } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from 'axios';
import { set } from 'date-fns';
import { useEffectEvent } from 'react';




const ShowAvailability = ({ id }) => {
    const [listOfAvailabilities, setListOfAvailabilities] = useState(null);
    const [updateStatus, setUpdateStatus] = useState(false);
    const [newStatus, setNewStatus] = useState("pending");
    const [error, setError] = useState("");
    const [availabilityId, setAvailabilityId] = useState(NaN);
    const [calenderView, setCalenderView] = useState(false);
    const [availabilityView, setAvailabilityView] = useState([]);
    useEffect(() => {
        if (!id) return;

        const getAvailabilities = async () => {
            try {
                console.log("Employee Id in ShowAvailability:", id);
                const res = await axios.get(`/api/availabilities/employee/${id}`);
                setListOfAvailabilities(res.data);
                console.log("Availabilities:", res.data);
            } catch (err) {
                console.error(err);
                setError("No Availabilities.");
            }
        };

        getAvailabilities();
    }, [id]);


    // Handle Remove
    const handleRemove = async (av) => {
        try {
            const confirmed = window.confirm("Are you sure you want to remove this availability? ");
            if (confirmed) {
                await axios.delete(`/api/availabilities/${av.id}`);

            }
        } catch (err) {
            console.error(err);
        }
    }
    const openUpdateStatus = (av) => {
        setAvailabilityId(av.id);          // 👈 save which availability to update
        setNewStatus(av.status || "pending"); // optional: prefill with current status
        setUpdateStatus(true);             // open the modal
    };
    const handleUpdateAvailability = async () => {
        try {
            console.log("Saving status:", newStatus);

            await axios.put(`/api/availabilities/${availabilityId}/status`, null, {
                params: {
                    status_value: newStatus,
                }
            });
            setListOfAvailabilities((prev) =>
                prev.map((av) =>
                    av.id === availabilityId ? { ...av, status: newStatus } : av
                )
            );
            alert("Status updated!");
            setUpdateStatus(false);
        } catch (err) {
            console.error(err);
        }
    };



    const handleCalenderView = async (av) => {
        setAvailabilityId(av.id);
        setCalenderView(!calenderView);
    }
    useEffect(() => {
        const showMyAvailabilities = async () => {
            try {
                const res = await axios.get(`/api/availabilities/${availabilityId}`);
                setAvailabilityView(res.data);
                console.log("Show Availability view: ",res.data);
            }catch (err){
                console.error(err);
            }
            
        }
        showMyAvailabilities();
    }, [calenderView])

    // ⬅️ put this ABOVE buildEventsFromAvailabilities
    const toTimeNoZ = (timeString) => {
        if (!timeString) return null;
        const [h, m, rest] = timeString.split(":");
        if (!rest) return timeString;
        const seconds = rest.split(".")[0];
        return `${h}:${m}:${seconds}`;
    };

    const buildEventsFromAvailabilities = (availabilityView) => {
        if (!availabilityView) return [];

        const arr = Array.isArray(availabilityView) ? availabilityView : [availabilityView];

        return arr.flatMap((av) => {
            const events = [];
            const { start_date, end_date, name } = av;

            if (av.monday_start && av.monday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [1],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.monday_start),
                    endTime: toTimeNoZ(av.monday_end),
                });
            }

            if (av.tuesday_start && av.tuesday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [2],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.tuesday_start),
                    endTime: toTimeNoZ(av.tuesday_end),
                });
            }

            if (av.wednesday_start && av.wednesday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [3],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.wednesday_start),
                    endTime: toTimeNoZ(av.wednesday_end),
                });
            }

            if (av.thursday_start && av.thursday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [4],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.thursday_start),
                    endTime: toTimeNoZ(av.thursday_end),
                });
            }

            if (av.friday_start && av.friday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [5],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.friday_start),
                    endTime: toTimeNoZ(av.friday_end),
                });
            }

            if (av.saturday_start && av.saturday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [6],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.saturday_start),
                    endTime: toTimeNoZ(av.saturday_end),
                });
            }

            if (av.sunday_start && av.sunday_end) {
                events.push({
                    title: name || "Available",
                    daysOfWeek: [0],
                    startRecur: start_date,
                    endRecur: end_date,
                    startTime: toTimeNoZ(av.sunday_start),
                    endTime: toTimeNoZ(av.sunday_end),
                });
            }

            return events;
        });
    };


    const events = buildEventsFromAvailabilities(availabilityView);

    if (error) {
        return <div className="text-red-500 text-center mt-4">
            <h1>No availabilities</h1>
        </div>;
    }

    if (!listOfAvailabilities) {
        return <div className="text-white text-center mt-4">Loading availability...</div>;
    }

    return (
        <div className="mt-6 px-4 max-w-[800px] mx-auto max-h-[400px] overflow-y-auto space-y-3" >
            {
                listOfAvailabilities.map((av, key) => (
                    <div className="flex flex-col bg-white px-3 py-2 rounded-sm border-gray-400 shadow-3xl shadow-blue-300" key={key}>
                        <div className="border-black border-2 px-2 py-1 rounded-sm shadow-2xl  hover:cursor-cell mb-1">
                            <div className="flex gap-x-3 justify-center text-sm my-2">
                                <button
                                    onClick={() => handleRemove(av)}
                                    className="text-red-400 border-none bg-gray-50 px-1 py-1 font-bold shadow-sm rounded-medium">
                                    Remove
                                </button>
                                <button
                                    onClick={() => openUpdateStatus(av)}
                                    className="text-green-400 border-none bg-gray-50 px-1 py-1 font-bold shadow-sm rounded-medium">
                                    Update Status
                                </button>
                                <button
                                    onClick={() => handleCalenderView(av)}
                                    className="text-blue-400 border-none bg-gray-50 px-1 py-1 font-bold shadow-sm rounded-medium">
                                    Calendar View
                                </button>
                            </div>
                            <hr className="" />
                            <div className="">
                                <div className="flex gap-x-3">
                                    <h3 className="text-medium md:text:lg font-bold text-purple-800">Name</h3>
                                    <p className="text-medium md:text-lgfont-sans">{av.name}</p>
                                </div>
                                <div className="flex gap-x-3">
                                    <h3 className="text-medium md:text:lg font-bold text-purple-800">Description</h3>
                                    <p className="text-medium md:text-lgfont-sans text-wrap">{av.description}</p>
                                </div>
                                <div className="flex gap-x-3">
                                    <h3 className="text-medium md:text:lg font-bold text-purple-800">Start Date</h3>
                                    <p className="text-medium md:text-lgfont-sans text-wrap">{av.start_date}</p>
                                </div>
                                <div className="flex gap-x-3">
                                    <h3 className="text-medium md:text:lg font-bold text-purple-800">End Date</h3>
                                    <p className="text-medium md:text-lgfont-sans text-wrap">{av.end_date}</p>
                                </div>
                                <div className="flex gap-x-3">
                                    <h3 className="text-lg md:text:xl font-bold text-purple-800">Status</h3>
                                    <p className={`text-medium md:text-lg font-sans font-bold text-wrap ${av.status == "pending" ? "text-yellow-600" : av.status == "approved" ? "text-green-500" : "text-red-600"}`}>{av.status}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                ))
            }
            {
                updateStatus && (
                    <div className="fixed  inset-0 z-[50] bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-md border border-gray-300">
                        <div className='bg-white px-10 py-10'>
                            <label className='text-lg font-semibold mb-10'  >New Status</label>
                            <select value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="block mt-2 border border-gray-300 px-3 py-2 rounded-md"
                            >
                                <option value="approved" className='text-green-500'>Approved</option>
                                <option value="rejected" className='text-red-500'>Rejected</option>
                                <option value="pending" className='text-yellow-500'>Pending</option>
                            </select>
                            <div className='flex gap-x-3 mt-4'>
                                <button
                                    onClick={handleUpdateAvailability}
                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Save
                                </button>
                                <button className='text-red-500 px-4 py-2 mt-4 border-black border-2 bg-gray-100 rounded-md hover:gray-200 font-semibold hover:text-red-600 '
                                    onClick={() => { setUpdateStatus(false) }}
                                >Close</button>
                            </div>

                        </div>
                    </div>
                )
            }
            {
                calenderView && (
                    <>
                        <div className="min-h-screen max-h-[1000px]">
                            <FullCalendar
                                plugins={[timeGridPlugin]}
                                initialView="timeGridWeek"
                                height={"auto"}
                                weekends={true}
                                events={events}
                                titleFormat={{
                                    month: "long",
                                    year: "numeric",
                                    day: "numeric",
                                }}
                            />
                        </div>
                    </>
                )
            }
        </div>
    );

};

export default ShowAvailability;