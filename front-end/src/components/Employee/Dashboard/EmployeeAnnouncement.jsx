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
    <div className="bg-transparent p-4 h-full text-lack">
      {announcements.length === 0 ? (
        <p className="text-red">No announcements found</p>
      ) : (
        <>
          <ul className="list-none space-y-3">
            {(moreAnnouncements ? announcements : announcements.slice(0, 2)).map((a, index) => {
              const isExpanded = expandedId === (a.id ?? index);

              return (
                <li key={a.id ?? index}>

                  <div className=" shadow-xl px-2 py-1 border-2   rounded-lg text-black bg-white">
                    <div className='flex flex-col'>
                      <div>
                        <h1 className="text-black font-bold text-medium md:text-xl text-center px-1 ">{a.title}</h1>
                      </div>
                      <div className='flex gap-x-2 justify-between'>
                        <div className='flex gap-x-4'>
                          <p className='text-gray-800 font-semibold md:text-md text-sm'>Created <span className='text-red-800 ml-1'>{a.created_at}</span></p>
                          <p className='text-gray-800 font-semibold md:text-md text-sm'>Exprires <span className='text-red-800 ml-1'>{a.expires_at}</span></p>
                        </div>
                        {
                          a.attachment_url && (
                            <>
                              <a href={`/api/${a.attachment_url}`} className='text-blue-800 '>Attachment</a>

                            </>
                          )
                        }
                      </div>
                    </div>

                    <hr className='my-2' />
                    {isExpanded ? (
                      <p className="w-full break-words px-2 py-1 text-black">
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
                      <p className="w-full break-words px-2 py-1">
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
