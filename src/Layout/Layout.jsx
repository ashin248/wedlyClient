import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBarTop from './NavBarTop';
import NavBarBottom from './NavBarBottom';
import './css/NavBar.css';

function Layout() {
  return (
    <>
      <NavBarTop />
      <NavBarBottom />
      <Outlet />
    </>
  );
}

export default Layout;


































