import { createContext, useContext, useState } from "react";

const SignupContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSignup = () => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error("useSignup must be used within a SignupProvider");
  }
  return context;
};

export const SignupProvider = ({ children }) => {
  const [signupData, setSignupData] = useState({});

  const updateSignupData = (newData) => {
    setSignupData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  return (
    <SignupContext.Provider value={{ signupData, updateSignupData }}>
      {children}
    </SignupContext.Provider>
  );
};
