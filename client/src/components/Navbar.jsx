import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '@/assets/assets';
import { AuthContext } from '@/context/AuthContext';
import UserButton from './UserButton';

const Navbar = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <div className="shadow py-4">
      <div className="container px-4 2xl:px-20 mx-auto flex justify-between items-center">
        <Link to="/">
          <img src={assets.logo} alt="" className='max-sm:w-32' />
        </Link>
        <div className="flex gap-4 max-sm:text-xs">
          {!isAuthenticated ? (
            <>
              <button className="text-gray-600">Post a Job</button>
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full"
              >
                Login
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to={'/applications'}>Applied Jobs</Link>
              <p></p>
              <UserButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
