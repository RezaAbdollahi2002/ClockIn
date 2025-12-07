import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Autogenerate = ({ setAutogenerateShow }) => {

    const [detail, setDetail] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [loading, setLoading] = useState(false);
    const employerId = localStorage.getItem("employer_id");
    const navigate = useNavigate();

    const [payroll, setPayroll] = useState({
        employer_id: employerId,
        start_date: "",
        end_date: "",
        roles: [],
        location: "",
        shifts_per_day: "",
        hours_per_shift: "",
        employees_per_shift: "",
        additional_instructions: ""
    });

    const handleInputChange = (field, value) => {
        setPayroll(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRolesChange = (value) => {
        // Convert comma-separated string to array
        setPayroll(prev => ({
            ...prev,
            roles: value.split(',').map(role => role.trim()).filter(role => role)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!employerId) return;

        try {
            // Generate additional instructions based on employees_per_shift
            const instructions = `Schedule ${payroll.employees_per_shift} lifeguards per shift for safety.`;

            const dataToSend = {
                ...payroll,
                additional_instructions: instructions
            };

            setLoading(true);
            const res = await axios.post(`/api/gemini/auto-generate-shifts`, dataToSend);
            setDetail(res.data.detail);
            console.log(res.data.detail);
            setShowDetail(true);
            console.log("payroll: ", payroll);
            toast.success("Shifts generated successfully!");
            // Navigate after a short delay to show success message
            setLoading(false);
            toast.success("Shifts were created successfully!");
            navigate(0);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Failed to generate shifts.");
            setShowDetail(true);
        }
    };

    const handleCancel = () => {
        setAutogenerateShow(false);
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/80'>
            <div>
                {showDetail && (
                    <div className='absolute top-4 right-4 bg-red-500 text-white p-3 rounded'>
                        <button onClick={()=>setDetail(false)} className='text-black border-red-600 hover:text-red'>Close</button>
                        <p>{detail}</p>
                    </div>
                )}
            </div>
            <form className='flex flex-col gap-y-2 p-4 bg-gray-600 text-white rounded-lg w-full max-w-2xl' onSubmit={handleSubmit}>
                <h2 className='text-xl font-bold mb-4'>Auto Generate Shifts</h2>
                {loading && (
                    <div className='flex  gap-x-2'>
                        <AiOutlineLoading3Quarters className=' text-purple-900 w-[30px] h-[30px]' />
                        <p className='text-sm md:text-md text-white'>Generating...</p>
                    </div>
                )
                }
                <div className='md:grid md:grid-cols-2 md:gap-3'>
                    <div className='flex flex-col'>
                        <div className='flex gap-x-2 my-1'>
                            <label className='font-semibold text-sm md:text-md'>Roles</label>
                            <input
                                className='text-xs md:text-sm bg-white text-gray-800 border-gray-800 shadow-2xl focus-visible:ring-2 ring-purple-500 px-2 py-1 rounded'
                                type="text"
                                value={payroll.roles.join(', ')}
                                onChange={(e) => handleRolesChange(e.target.value)}
                                placeholder="Lifeguard, Manager"
                                required
                            />
                        </div>
                        <div className='flex gap-x-2 my-1'>
                            <label className='font-semibold text-sm md:text-md'>Location</label>
                            <input
                                className='text-xs md:text-sm bg-white text-gray-800 border-gray-800 shadow-2xl focus-visible:ring-2 ring-purple-500 px-2 py-1 rounded'
                                type="text"
                                value={payroll.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                required
                            />
                        </div>
                        <div className='flex gap-x-2 my-1'>
                            <label className='font-semibold text-sm md:text-md'>Shifts per day</label>
                            <input
                                className='text-xs md:text-sm bg-white text-gray-800 border-gray-800 shadow-2xl focus-visible:ring-2 ring-purple-500 px-2 py-1 rounded'
                                type="number"
                                min={1}
                                value={payroll.shifts_per_day}
                                onChange={(e) => handleInputChange('shifts_per_day', e.target.value)}
                                required
                            />
                        </div>
                        <div className='flex gap-x-2 my-1'>
                            <label className='font-semibold text-sm md:text-md'>Hours per shift</label>
                            <input
                                className='text-xs md:text-sm bg-white text-gray-800 border-gray-800 shadow-2xl focus-visible:ring-2 ring-purple-500 px-2 py-1 rounded'
                                type="number"
                                min={1}
                                max={12}
                                value={payroll.hours_per_shift}
                                onChange={(e) => handleInputChange('hours_per_shift', e.target.value)}
                                required
                            />
                        </div>
                        <div className='flex gap-x-2 my-1'>
                            <label className='font-semibold text-sm md:text-md'>Employees per shift</label>
                            <input
                                className='text-xs md:text-sm bg-white text-gray-800 border-gray-800 shadow-2xl focus-visible:ring-2 ring-purple-500 px-2 py-1 rounded'
                                type="number"
                                min={1}
                                max={3}
                                value={payroll.employees_per_shift}
                                onChange={(e) => handleInputChange('employees_per_shift', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-y-2'>
                        <div className='my-1'>
                            <label className='font-semibold text-sm md:text-md'>Start date</label>
                            <input
                                className='text-xs md:text-sm bg-white text-gray-800 border-gray-800 shadow-2xl focus-visible:ring-2 ring-purple-500 w-full px-2 py-1 rounded'
                                type="date"
                                value={payroll.start_date}
                                onChange={(e) => handleInputChange('start_date', e.target.value)}
                                required
                            />
                        </div>
                        <div className='my-1'>
                            <label className='font-semibold text-sm md:text-md'>End date</label>
                            <input
                                className='text-xs md:text-sm bg-white text-gray-800 border-gray-800 shadow-2xl focus-visible:ring-2 ring-purple-500 w-full px-2 py-1 rounded'
                                type="date"
                                value={payroll.end_date}
                                onChange={(e) => handleInputChange('end_date', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className='flex gap-2 mt-4'>
                    <button
                        className='w-full bg-white text-purple-800 rounded-lg px-1 py-2 font-semibold hover:bg-gray-100 transition'
                        type="submit"
                    >
                        Generate
                    </button>
                    <button
                        className='w-full bg-gray-700 text-white rounded-lg px-1 py-2 font-semibold hover:bg-white hover:text-black transition'
                        type="button"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Autogenerate