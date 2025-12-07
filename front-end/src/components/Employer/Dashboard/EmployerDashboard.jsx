import EmployerNavbar from "../../Navbar/EmployerNavbar";
import { useEffect, useState } from "react";
import Message from "../../Message/Message";
import EmployerAnnouncements from "../Announcements/EmployerAnnouncements";
import axios from "axios";
import EmployerDashboardTeamView from "./EmployerDashboardTeamView";

const EmployerDashboard = ({ message, setMessage }) => {

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
      <div className="bg-white max-w-[1200px] mx-auto max-h-[100%] -mt-4">
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
          {message && (
            <div
              className={`absolute top-10 h-screen right-0 min-w-[350px] bg-white shadow-xl z-50 p-4 overflow-auto transform transition-transform duration-2000 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
                }`}
            >
              <Message onClose={() => setMessage(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
