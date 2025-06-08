// src/components/VerticalNavbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../http/index';
import 'bootstrap/dist/css/bootstrap.min.css';

export function VerticalNavbar() {
  const defaultItems = [
    { path: '/login',    label: 'Вход',        icon: '🔐' },
    { path: '/register', label: 'Регистрация', icon: '✍️' }
  ];

  
  const itemsByRole = {
    Teacher: [ 
      { path: '/mySchedule',     label: 'Моё расписание', icon: '📅' },
      { path: '/profile',        label: 'Профиль',          icon: '👩‍🏫' },
      { path: '/subjectsTeacher',label: 'Мои предметы',     icon: '📚' },
      { path: '/addTimeSlots',   label: 'Время',            icon: '🕛' },
    ],
    Manager: [ 
      { path: '/createMain',   label: 'Составить расписание', icon: '🔄' },
      { path: '/profile',        label: 'Профиль',          icon: '👤' },
      { path: '/searchClient',        label: 'Ученики',          icon: '👤' },
      { path: '/subjects',       label: 'Предметы',         icon: '📖' },
    ],
    Administrator: [ 
      { path: '/users',          label: 'Пользователи',     icon: '🛠️' },
      { path: '/settings',       label: 'Настройки',        icon: '⚙️' },
      { path: '/profile',        label: 'Профиль',          icon: '👑' }
    ]
  };

  const [navItems, setNavItems] = useState(defaultItems);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setNavItems(defaultItems);
      return;
    }
    api.get('/auth/me')
      .then(({ data: user }) => {
        // user.role — строка "Teacher", "Manager" или "Administrator"
        setNavItems(itemsByRole[user.role] || defaultItems);
      })
      .catch(() => {
        setNavItems(defaultItems);
      });
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setNavItems(defaultItems);
    navigate('/login');
  };

  return (
    <nav
      className="navbar navbar-expand-md navbar-dark bg-dark flex-column align-items-start vh-100"
      style={{ width: '250px' }}
    >
      <div className="container-fluid flex-column align-items-start">
        <Link className="navbar-brand mb-4 mt-3" to="/">TimeFlow</Link>
        <div className="navbar-nav flex-column w-100">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              className="nav-link py-3 d-flex align-items-center"
              to={item.path}
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {localStorage.getItem('jwtToken') && (
            <button
              onClick={handleLogout}
              className="nav-link btn btn-link text-start text-white py-3"
              style={{ textDecoration: 'none' }}
            >
              <span className="me-2">🚪</span>
              Выйти
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default VerticalNavbar;
