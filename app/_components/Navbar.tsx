"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Home,
  Building2,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Heart,
  ClipboardList
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [userData, setUserData] = useState<any>();
  const router = useRouter()

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
      }
    };

    // Load user data initially
    loadUserData();

    // Set up event listener for login/logout events
    const handleUserLogin = () => loadUserData();
    const handleUserLogout = () => setUserData(null);

    window.addEventListener('userLogin', handleUserLogin);
    window.addEventListener('userLogout', handleUserLogout);

    // Clean up event listeners
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, []);

  const navItems = [
    {
      label: 'ABOUT',
      type: 'link',
      href: '/about'
    },
    {
      label: 'PRICING',
      type: 'link',
      href: '/pricing'
    },
    {
      label: 'LISTINGS',
      type: 'link',
      href: '/listings'
    },
    {
      label: 'FAQ',
      type: 'link',
      href: '/faq'
    },
    {
      label: 'TREND',
      type: 'link',
      href: '/trend'
    },
    {
      label: 'CONTACT',
      type: 'link',
      href: '/contact'
    },
  ];

  const searchFilters = [
    { value: 'all', label: 'All Properties', icon: <Home className="mr-2 w-4 h-4" /> },
    { value: 'residential', label: 'Residential', icon: <Home className="mr-2 w-4 h-4" /> },
    { value: 'commercial', label: 'Commercial', icon: <Building2 className="mr-2 w-4 h-4" /> },
    { value: 'location', label: 'By Location', icon: <MapPin className="mr-2 w-4 h-4" /> },
  ];

  const userMenuItems = [
    { label: 'My Profile', icon: <User className="w-4 h-4 mr-2" />, href: '/profile' },
  ];

  const scrollToSection = (sectionId: any) => {
    const element = document.querySelector(sectionId);

    // Close mobile menu if open
    setIsMobileMenuOpen(false);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleNavigation = (item: any) => {
    if (item.type === 'scroll') {
      // Remove the '#' and scroll to the section
      scrollToSection(item.href);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    // Implement search logic here
    console.log('Searching:', searchQuery, 'Filter:', searchFilter);
  };

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    // Update state
    setUserData(null);

    // Close the dropdown
    setIsUserDropdownOpen(false);
    router.push("/")
    // Dispatch logout event
    window.dispatchEvent(new Event('userLogout'));
  };

  return (
    <nav className="bg-white sticky top-0 shadow-sm py-2 w-full z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link href="/" className='cursor-pointer'>
            <Image src="/logo.webp" width={200} height={30} alt="logo" />
          </Link>

          {/* Search Bar */}
          <div className="hidden lg:block relative w-[400px] mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348b8b]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.type === 'scroll' ? (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item)}
                  className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors duration-200 text-sm font-medium"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 cursor-pointer transition-colors duration-200 text-sm font-medium"
                >
                  {item.label}
                </Link>
              )
            ))}

            {/* User Profile or Auth Buttons based on login status */}
            {userData ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-full bg-[#348b8b] flex items-center justify-center text-white overflow-hidden">
                    {userData.avatar ? (
                      <Image
                        src={userData.avatar}
                        width={36}
                        height={36}
                        alt={userData.name}
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-medium text-sm">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium">{userData.name}</p>
                      <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                    </div>

                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* <Link href="/login" className="text-gray-800 border py-2 font-medium text-sm transition-colors">
                  Login
                </Link> */}
                <Link href="/register" className='cursor-pointer'>
                  <button className="bg-[#FB902D] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black transition-colors duration-200">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none transition duration-150 ease-in-out"
            >
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {/* Mobile Search */}
          <div className="px-3 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348b8b]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

              {/* Mobile Search Filter */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                  className="flex items-center px-3 text-gray-600 hover:text-gray-900"
                >
                  {searchFilters.find(f => f.value === searchFilter)?.label}
                  <ChevronDown className="ml-1 w-4 h-4" />
                </button>

                {isSearchDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border">
                    {searchFilters.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => {
                          setSearchFilter(filter.value);
                          setIsSearchDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        {filter.icon}
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          {navItems.map((item) => (
            item.type === 'scroll' ? (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            )
          ))}

          {/* Mobile User Profile or Auth Buttons */}
          {userData ? (
            <>
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#348b8b] flex items-center justify-center text-white">
                    {userData.avatar ? (
                      <Image
                        src={userData.avatar}
                        width={40}
                        height={40}
                        alt={userData.name}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-medium">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{userData.name}</p>
                    <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                  </div>
                </div>
                <div className="py-1">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { setIsUserDropdownOpen(false); setIsMobileMenuOpen(false) }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-2 py-2 text-red-600 hover:text-red-800 mt-2"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="px-3 pt-2 flex flex-col space-y-2">
              <Link
                href="/sign-in"
                className="w-full bg-white border border-[#348b8b] text-[#348b8b] px-4 py-2 rounded-full text-center font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="w-full bg-[#FB902D] text-white px-4 py-2 rounded-full text-center font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}