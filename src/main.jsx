import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import SchedulePage from './pages/SchedulePage'; 
import './index.css'
import { Navigate } from 'react-router-dom';

import SearchTeacherPage from './pages/SearchTeacherPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import TeacherSchedulePage from './pages/TeacherSchedulePage';
import CreateSubjectPage from './pages/CreateSubjectPage';
import TeacherSubjectsPage from './pages/TeacherSubjectsPage';
import ManageTimeSlotsPage from './pages/ManageTimeSlotsPage';
import NewClientSchedulePage from './pages/NewClientSchedulePage';
import ClientSearchPage from './pages/ClientSearchPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>

          <Route index element={<Navigate to="login" replace />} />

          <Route path="schedule" element={<SchedulePage />} />
          <Route path="mySchedule" element={<TeacherSchedulePage />} />
          <Route path="/find-teacher" element={<SearchTeacherPage />} />
          <Route path="/login"    element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="profile"  element={<ProfilePage/>} />
          <Route path="subjects"  element={<CreateSubjectPage/>} />
          <Route path="subjects"  element={<CreateSubjectPage/>} />
          <Route path="subjectsTeacher"  element={<TeacherSubjectsPage/>} />


          <Route path="searchClient"  element={<ClientSearchPage/>} />
          <Route path="/addTimeSlots" element={<ManageTimeSlotsPage />} />
          <Route path="/createMain" element={<NewClientSchedulePage />} />
          

        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);