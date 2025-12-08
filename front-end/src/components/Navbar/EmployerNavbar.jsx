import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const EmployerNavbar = ({ messageState }) => {
  const navigate = useNavigate();
  const [message, setMessages] = useState(false);

  const handleSignOut = () => {
    const confirm = window.confirm("Are you sure you want to sign out?");
    if (!confirm) return;

    console.log("Signing out...");
    navigate("/accounts/sign-in");
  };

  const messageStateFunction = () => {
    const newValue = !message;
    setMessages(newValue);

    if (typeof messageState === "function") {
      messageState(newValue);
    } else {
      console.warn("messageState prop is missing or not a function");
    }
  };

  return (
    <div className="fixed z-50 top-0 flex px-2 bg-[#4930EE] w-full py-2 items-center justify-between float-start">
      <ul className="flex gap-3 items-center text-md: md:text-lg">
        <Link
          to={"/onboarding/sign-up/employer-dashboard"}
          className="text-white mx-2 font-bold  hover:text-white hover:font-bold"
        >
          Homebase
        </Link>
        <Link
          to={"/onboarding/sign-up/employer-schedule"}
          className="text-purple-200  hover:text-white hover:font-bold"
        >
          Schedule
        </Link>
        <button
          onClick={messageStateFunction}
          className="text-purple-200  bg-transparent border-none cursor-pointer  hover:text-white hover:font-bold"
        >
          Message
        </button>
        <Link
          to={`/onboarding/sign-up/team`}
          className="text-purple-200  hover:text-white hover:font-bold "
        >
          Team
        </Link>
        <Link
          to={`/onboarding/sign-up/employer-settings`}
          className="text-purple-200   hover:text-white hover:font-bold"
        >
          Settings
        </Link>
      </ul>

      <button
        onClick={handleSignOut}
        className="text-purple-200 text-xs bg-transparent border-none cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
};

export default EmployerNavbar;
