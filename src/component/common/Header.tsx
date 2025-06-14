import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaUserCircle, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import type { AppDispatch, RootState } from '../../store';
import { useSelector } from 'react-redux';
import { StyleManager } from '../../../styleManager';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const homeState = useSelector((state: RootState) => state.home)



  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
  };

  const handleLogOut = async () => {
    await StyleManager.removeStyle('theme');
    dispatch(logoutUser())
  }


  return (
    <nav className="flex justify-between items-center h-16 px-6 md:px-12 bg-[var(--mat-sys-primary-container)] text-primary shadow-md relative z-50">
      <div className="flex items-center gap-4">
        {homeState.data?.LOGONAME && <img src={`/images/logos/${homeState.data.LOGONAME}`} alt="App Logo" className="h-10" />}
        {/* <span className="text-lg font-medium hidden md:inline">USCIB Carnet Portal</span> */}
      </div>

      <div className={`flex items-center gap-4 md:gap-6 text-[var(--mat-sys-primary)]`}>
        <button onClick={() => navigate('home')} className="text-sm font-medium hover:underline">Home</button>

        <Dropdown label="Users">
          <MenuItem onClick={() => navigate('usersettings')}>User Settings</MenuItem>
        </Dropdown>

        <Dropdown label="Maintenance">
          <MenuItem onClick={() => navigate('preparer')}>Preparer</MenuItem>
          <MenuItem onClick={() => navigate('holder')}>Holder</MenuItem>
          <MenuItem onClick={() => navigate('carnet')}>Carnet</MenuItem>
        </Dropdown>

        <Dropdown label="Admin">
          <MenuItem onClick={() => navigate('sequence')}>Sequence</MenuItem>
          <MenuItem onClick={() => navigate('regions')}>Regions</MenuItem>
          <MenuItem onClick={() => navigate('users')}>Users</MenuItem>
        </Dropdown>

        {/* Profile dropdown */}
        <div className="relative">
          <button onClick={toggleProfileMenu} className="text-xl">
            <FaUserCircle />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-md bg-secondary-container shadow-lg z-50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-white text-secondary border-b">
                <FaEnvelope />
                <span className="text-sm truncate">{'userEmail'}</span>
              </div>
              <button
                onClick={handleLogOut}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-secondary hover:bg-secondary-container"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const Dropdown = ({ label, children }: any) => (
  <Menu as="div" className="relative inline-block text-left">
    <Menu.Button className="text-sm font-medium hover:underline">{label}</Menu.Button>
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-40">
        <div className="py-1">{children}</div>
      </Menu.Items>
    </Transition>
  </Menu>
);

const MenuItem = ({ children, onClick }: any) => (
  <Menu.Item>
    {({ active }) => (
      <button
        onClick={onClick}
        className={`${active ? 'bg-secondary-container' : ''
          } block w-full px-4 py-2 text-sm text-left text-secondary`}
      >
        {children}
      </button>
    )}
  </Menu.Item>
);

export default Header;
