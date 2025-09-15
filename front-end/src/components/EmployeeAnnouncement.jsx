import axios from 'axios';
import React, { useEffect, useState } from 'react';

const EmployeeAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const employeeId = localStorage.getItem("employee_id");
  const [moreAnnouncements, setMoreAnnoucements] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    console.log("Employee id:" + employeeId);

    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get("/api/announcements/employee/get-announcements/", {
          params: { "employee_id": employeeId },
        });
        setAnnouncements(res.data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };

    fetchAnnouncements();
  }, [employeeId]);

  return (
    <div className="bg-transparent border border-gray-400 p-4 h-full text-lack">
      {announcements.length === 0 ? (
        <p className="text-black">No announcements found</p>
      ) : (
        <>
          <ul className="list-none space-y-3 shadow-5xl">
            {(moreAnnouncements ? announcements : announcements.slice(0, 2)).map((a, index) => {
              const isExpanded = expandedId === (a.id ?? index);

              return (
                <li key={a.id ?? index} className='px-4 shadow-5xl'>

                  <div className=" shadow-5xl shadow-black px-10 pt-10 pb-4 hover:border hover:border-[#1a1365] duration-200 bg-gray-100  rounded-sm text-white">
                    <div className='flex justify-between'>
                      <h1 className="text-black font-bold text-xl md:text-xl text-center"><span className='text-black font-bold text-medium md:text-lg'>Subject: {" "}</span>{a.title}</h1>

                      <button className='text-xs text-gray-400 justify-between' onClick={() => setShowAttachment(!showAttachment)}>Attachment</button>

                    </div>

                    <hr className='text-black my-2'/>
                    {isExpanded ? (
                      <p className="w-full break-words px-2 py-1 text-black text-sm md:text-medium">
                        {a.message}
                        <button
                          type="button"
                          className="text-blue-500 text-medium ml-1 underline"
                          onClick={() => setExpandedId(null)}
                        >
                          less
                        </button>
                        {
                          showAttachment && (
                            <img src={`http://localhost:8000${a.attachment_url}`} className='w-[20%]' />
                          )
                        }

                      </p>
                    ) : (
                      <p className="w-full text-black break-words px-2 py-1 text-sm md:text-medium">
                        {String(a.message ?? "").slice(0, 30)}
                        <button
                          type="button"
                          className="text-gray-400 text-xs ml-1 underline"
                          onClick={() => setExpandedId(a.id ?? index)}
                        >
                          ...more
                        </button>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Centered Show all / Show less */}
          {announcements.length > 2 && (
            <div className="flex justify-center">
              <button
                className="text-black bg-gray-100 mt-5 px-3 py-1 rounded-sm hover:font-semibold hover:scale-105 duration-300"
                onClick={() => setMoreAnnoucements(!moreAnnouncements)}
              >
                {moreAnnouncements ? "Show less" : `Show all (${announcements.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeAnnouncement;
