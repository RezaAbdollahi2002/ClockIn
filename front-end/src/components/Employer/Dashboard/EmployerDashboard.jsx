import EmployerNavbar from "../../Navbar/EmployerNavbar";
import { act, useEffect, useState } from "react";
import Message from "../../Message/Message";
import EmployerAnnouncements from "../Announcements/EmployerAnnouncements";
import axios from "axios";
import EmployerDashboardTeamView from "./EmployerDashboardTeamView";
import ChatBot from "../../AI/ChatBot";

const EmployerDashboard = ({ message, setMessage, activeBot, setActiveBot }) => {

  const [employerName, setEmployerName] = useState("Employer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileShow, setProfileShow] = useState(false);

  const employerId = localStorage.getItem("employer_id");



  useEffect(() => {
    if (!employerId) return;

    const controller = new AbortController();
    const fetchName = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/employers/name", {
          params: { employer_id: employerId },
          signal: controller.signal,
        });
        setEmployerName(res.data.first_name ?? "BOSS");
      } catch (err) {
        if (axios.isCancel(err)) return;
        // Optional: handle 404 differently
        if (err?.response?.status === 404) {
          setError("Employer not found");
        } else {
          setError("Could not load employer name");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchName();
    return () => controller.abort();
  }, [employerId]);

  useEffect(() => {
    if (!employerId) return;
    const getEmployerInfo = async () => {
      try {
        const res = await axios.get(`/api/employer/settings/${employerId}/employer-info`);
        setProfileImage(res.data.profile_pic);
        console.log("profile pic", res.data.profile_pic);
        setProfileShow(true);
      } catch (err) {
        console.error(err);
      }
    }
    getEmployerInfo();
  }, [employerId])

  return (
    <div className="bg-[#1A1346]  min-h-screen py-4     ">
      <div className="bg-white max-w-[1200px] mx-auto  -mt-4">
        <div className="flex flex-col gap-y-3 mt-10 justify-center ">
          {
            profileShow && (
              <>
                <img
                  alt={`${employerName}'s profile`}
                  src={profileImage} className="w-[67px] h-[67px] rounded-full mx-auto mt-2" />
              </>
            )
          }
          <h1 className="text-center font-bold  text-xl md:text-2xl lg:text-3xl my-4 mt-3 text-black">Hello back, {employerName}</h1>
        </div>
        {/* Main dashboard content */}
        <div className="flex flex-col gap-y-0  md:grid-cols-4 gap-4 mt-2 h-[100%]">
          <div className={`p-4 col-span-2 bg-white border-t  border-gray-800 shdow-lg shadow-blue-100`}>
            {/* left panel */}
            <EmployerAnnouncements />
          </div>

          {/* right panel */}
          <div className="bg-white border-t p-4 ">
            <EmployerDashboardTeamView />
          </div>


          {/* Message panel */}

        </div>
      </div>
      {message && (
        <div
          className={`fixed top-10 min-h-screen h-full right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-shadow duration-2000 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <Message onClose={() => setMessage(false)} activeBot={activeBot} setActiveBot={setActiveBot} />
        </div>
      )}
      {activeBot && (
        <aside
          className="fixed left-4 top-20 max-h-[600px] w-full max-w-[400px] rounded-lg border border-gray-300 bg-white shadow-xl"
          role="complementary"
          aria-label="Chat Assistant"
        >
          <ChatBot />
        </aside>
      )}

    </div>
  );
};

export default EmployerDashboard;
