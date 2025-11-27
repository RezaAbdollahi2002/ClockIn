import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AvatarImage from "../assets/Avatar.webp";
import { useNavigate } from 'react-router-dom';

const EmployerDashboardTeamView = () => {
    const [team, setTeam] = useState([]);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const employerId = localStorage.getItem("employer_id");
    const navigate = useNavigate();
    const itemsPerPage = 12; // 6 columns * 2 rows


    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await axios.get('/api/team', {
                    params: { employer_id: employerId }
                });
                setTeam(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTeam();
    }, [employerId]);

    const handleClick = (t) => {
        navigate("/employees/main", {
            state: { employee: t.id },
        });
    };

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const filteredTeam = team.filter((t) =>
        t.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const visibleTeam = filteredTeam.slice(start, start + itemsPerPage);


    return (
        <div className='max-h-screen'>
            <h1 className='text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-center text-white'>Team</h1>
            {/* 🔍 Search Bar */}
            <div className="flex justify-center mt-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employee by name..."
                    className="px-4 py-2 w-full max-w-md rounded-md border border-gray-300  bg-white
                               focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
            </div>

            {/* Grid */}
            <div className='flex flex-col gap-y-4 md:grid md:gap-6 md:grid-cols-6 mt-4'>
                {visibleTeam.map((t, index) => (
                    <div className='bg-white px-3 py-3 rounded-medium shadow-lg shadow-white hover:scale-105 duration-300'
                         key={index}
                         onClick={() => handleClick(t)}>

                        <div className='flex flex-col justify-center'>
                            <div className='mx-auto my-2'>
                                <img
                                    src={t.profile_picture || AvatarImage}
                                    className='w-[50px] h-[50px] rounded-full'
                                />
                            </div>
                            <h1 className='font-semibold text-center'>{t.full_name}</h1>
                            <h1 className='text-center'>{t.access_level}</h1>
                        </div>
                    </div>
                ))}
            </div>


            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-6 text-white">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 border rounded-md disabled:opacity-40 text-white"
                >
                    &lt;
                </button>

                <div className="flex gap-2 text-white">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 rounded-md text-white
                                ${page === i + 1 ? "bg-purple-500 text-white" : "border"}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border rounded-md disabled:opacity-40 text-white"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default EmployerDashboardTeamView;
