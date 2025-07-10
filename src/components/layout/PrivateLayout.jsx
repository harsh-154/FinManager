// src/components/layout/PrivateLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function PrivateLayout() {
  return (
    <>
      <Navbar />
      <div className="pt-20 pb-16">
        <Outlet />
      </div>
    </>
  );
}

export default PrivateLayout;
