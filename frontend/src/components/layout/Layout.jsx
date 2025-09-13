import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  
  // Don't show header on login and register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  // Don't show header on landing page
  const isLandingPage = location.pathname === '/';
  
  // Show header on all authenticated pages including task details
  
  return (
    <>
      {!isAuthPage && !isLandingPage && <Header />}
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;