import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useState } from 'react';
import {
  Register, AccountRecovery, SignInPhoneNumber, Singup, OwnerMotivation, BusinessInfoOwnerSignUp, CreateOwnerAccount,
  SignupEmployee, UserSignup, UserContactInfoSignup, UserAccountinfo,
  UserCheckingAccountInfo, EmployeeDashboard, FinalizeOwnerAccount, EmployeeSettings,
  Team, Message, EmployerProfile, EmployerSettings, EmployeeSchedule, EmployerSchedule,
  EmployerNavbar, EmployeeAvailabilities,
  Navbar
} from './index';
import OwnerSignup from "./components/Employer/Registration/OwnerSignup"
import HomePage from './components/Homepage/HomePage';
import Profile from './components/Employee/Settings/Profile';
import PasswordAndSecurity from './components/Employee/Settings/PasswordAndSecurity';
import Notifications from './components/Employee/Settings/Notifications';
import LocationsAndPINs from './components/Employee/Settings/LocationsAndPINs';
import EmployerLocationsAndPINs from './components/Employer/EmployerLocationsAndPINs';
import EmployerasswordAndSecurity from './components/Employer/Settings/EmployerasswordAndSecurity';
import EmployerNotifications from './components/Employer/Settings/EmployerNotifications';
import EmployerEmployeeMain from './EmployerEmployeeMain';
import EmployeeRequestsMain from '../src/components/Requests/EmployeeRequestsMain';
import EmployerDashboard from './components/Employer/Dashboard/EmployerDashboard';

const App = () => {
  const [message, setMessage] = useState(false);
  const [activeBot, setActiveBot] = useState(false);
  const handleMessageState = (data) => setMessage(data);

  return (
    <BrowserRouter>
      <Routes>
        {/* Other routes */}
        <Route path='/' element={<HomePage />} />
        <Route path='/accounts/sign-in' element={<Register />} />
        <Route path='/accounts/sign-in/phone' element={<SignInPhoneNumber />} />
        <Route path='/security/authentication-tokens/new' element={<AccountRecovery />} />
        <Route path='/onboarding/sign-up' element={<Singup />} />

        {/* Owner Routes */}
        <Route
          path='/onboarding/sign-up/owner-info'
          element={<OwnerSignup />}
        />
        <Route
          path='/onboarding/sign-up/owner-motivation'
          element={<OwnerMotivation />}
        />
        <Route
          path='/onboarding/sign-up/business-info'
          element={<BusinessInfoOwnerSignUp />}
        />
        <Route
          path='/onboarding/sign-up/business-info/create-owner-account'
          element={<CreateOwnerAccount />}
        />
        <Route
          path='/onboarding/sign-up/business-info/finalize-create-owner-account'
          element={<FinalizeOwnerAccount />}
        />

        {/* Employer dashboard (with navbar) */}
        <Route
          path='/onboarding/sign-up/employer-dashboard'
          element={
            <>
              <EmployerNavbar messageState={handleMessageState} />
              <EmployerDashboard message={message} setMessage={setMessage} activeBot={activeBot} setActiveBot={setActiveBot}/>
            </>
          }
        />

        {/* Employer employees main page (also with navbar) */}
        <Route
          path='/employees/main'
          element={
            <>
              <EmployerNavbar messageState={handleMessageState} />
              <EmployerEmployeeMain
                message={message}
                handleMessageState={handleMessageState}
                setMessage={setMessage}
                activeBot={activeBot}
                setActiveBot={setActiveBot}
              />
            </>
          }
        />

        <Route
          path='/onboarding/sign-up/employer-schedule'
          element={<EmployerSchedule
            message={message}
            handleMessageState={handleMessageState}
            setMessage={setMessage} 
            activeBot={activeBot}
            setActiveBot={setActiveBot}
            />}
        />

        {/* Employee Routes */}
        <Route
          path='/onboarding/sign-up/user-info'
          element={<UserSignup />}
        />
        <Route
          path='/onboarding/sign-up/user-contact'
          element={<UserContactInfoSignup />}
        />
        <Route
          path='/onboarding/sign-up/user-accountuser'
          element={<UserAccountinfo />}
        />
        <Route
          path='/onboarding/sign-up/user-account-edit-checking'
          element={<UserCheckingAccountInfo />}
        />

        <Route
          path='/onboarding/sign-up/employee-dashboard'
          element={
            <>
              <Navbar messageState={handleMessageState} />
              <EmployeeDashboard message={message} setMessage={setMessage} activeBot={activeBot} setActiveBot={setActiveBot} />
            </>
          }
        />
        <Route
          path='/employees/requests'
          element={
            <>
              <Navbar messageState={handleMessageState} />
              <EmployeeRequestsMain message={message} setMessage={setMessage} activeBot={activeBot} setActiveBot={setActiveBot} />
            </>
          }
        />

        {/* Settings Layout with nested pages */}
        <Route
          path='/onboarding/sign-up/employee-settings'
          element={
            <EmployeeSettings
              message={message}
              handleMessageState={handleMessageState}
              setMessage={setMessage}
              activeBot={activeBot}
              setActiveBot={setActiveBot}
            />
          }
        >
          <Route index element={<Profile />} />
          <Route path='employee-settings-profile' element={<Profile />} />
          <Route path='employee-settings-locations' element={<LocationsAndPINs />} />
          <Route path='employee-settings-notifications' element={<Notifications />} />
          <Route
            path='employee-settings-passwordandsecurity'
            element={<PasswordAndSecurity />}
          />
        </Route>

        <Route
          path='/onboarding/sign-up/employer-settings'
          element={<>
          <EmployerSettings
            message={message}
            handleMessageState={handleMessageState}
            setMessage={setMessage} 
            activeBot={activeBot}
            setActiveBot={setActiveBot}
            />
          </>}
        >
          <Route index element={<EmployerProfile />} />
          <Route
            path='employer-settings-profile'
            element={<EmployerProfile />}
          />
          <Route
            path='employer-settings-locations'
            element={<EmployerLocationsAndPINs />}
          />
          <Route
            path='employer-settings-notifications'
            element={<EmployerNotifications />}
          />
          <Route
            path='employer-settings-passwordandsecurity'
            element={<EmployerasswordAndSecurity />}
          />
        </Route>

        <Route
          path='/onboarding/sign-up/team'
          element={
            <Team
              message={message}
              handleMessageState={handleMessageState}
              setMessage={setMessage}
              activeBot={activeBot}
              setActiveBot={setActiveBot}
            />
          }
        />
        <Route path='/onboarding/sign-up/message' element={<Message activeBot={activeBot} setActiveBot={setActiveBot} />} />
        <Route
          path='/onboarding/Schedule'
          element={
            <>
            <Navbar messageState={handleMessageState}/>
            <EmployeeSchedule
              message={message}
              handleMessageState={handleMessageState}
              setMessage={setMessage}
              activeBot={activeBot}
              setActiveBot={setActiveBot}
            /> 
            </>
           
          }
        />
        <Route
          path='/onboarding/My_Availabilities'
          element={
            <>
                        <Navbar messageState={handleMessageState} />
<EmployeeAvailabilities
              message={message}
              handleMessageState={handleMessageState}
              setMessage={setMessage}
              activeBot={activeBot}
              setActiveBot={setActiveBot}
            />
            </>
            
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
