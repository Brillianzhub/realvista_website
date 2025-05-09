'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Cookie, X, ChevronDown, ChevronUp, Check } from 'lucide-react';

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<any>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  });
  const [hasConsented, setHasConsented] = useState(false);
  
  useEffect(() => {
    // Check if user already consented
    const consent = Cookies.get('cookieConsent');
    if (consent) {
      setHasConsented(true);
      setIsOpen(false);
      try {
        setPreferences(JSON.parse(consent));
      } catch (e) {
        // If parsing fails, keep default preferences
      }
    }
  }, []);
  
  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    savePreferences(allAccepted);
  };
  
  const handleAcceptSelected = () => {
    savePreferences(preferences);
  };
  
  const savePreferences = (prefs:any) => {
    Cookies.set('cookieConsent', JSON.stringify(prefs), { 
      expires: 365, // 1 year
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax'
    });
    
    setHasConsented(true);
    setIsOpen(false);
  };
  
  const togglePreference = (key:any) => {
    if (key === 'necessary') return; // Can't toggle necessary cookies
    
    setPreferences((prev:any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const reopenConsent = () => {
    setIsOpen(true);
  };

  if (!isOpen && hasConsented) {
    return (
      <button 
        onClick={reopenConsent}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-all z-50 flex items-center justify-center"
        aria-label="Cookie settings"
      >
        <Cookie size={20} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="bg-white border-t border-gray-200 rounded-md shadow-lg p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center">
            <Cookie className="text-teal-600 mr-2 flex-shrink-0" size={24} />
            <h2 className="text-lg font-medium text-gray-800">Cookie Preferences</h2>
          </div>
          
          {!showDetails && (
            <p className="text-gray-600 text-sm md:text-base pr-8">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <button 
              onClick={() => setShowDetails(!showDetails)} 
              className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Customize'} 
              {showDetails ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>
            <button 
              onClick={handleAcceptSelected} 
              className="text-sm bg-white border border-teal-600 text-teal600 hover:bg-blue-50 px-3 py-2 rounded transition-colors"
            >
              Accept Selected
            </button>
            <button 
              onClick={handleAcceptAll} 
              className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-4 border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({
              necessary: {
                title: "Necessary",
                description: "Essential cookies required for basic website functionality."
              },
              functional: {
                title: "Functional",
                description: "Cookies that remember your preferences and enhance usability."
              },
              analytics: {
                title: "Analytics",
                description: "Helps us understand how visitors interact with our website."
              },
              marketing: {
                title: "Marketing",
                description: "Used to track visitors across websites for advertising purposes."
              }
            }).map(([key, { title, description }]) => (
              <div key={key} className="flex items-start p-3 bg-gray-50 rounded">
                <div className="mr-3 mt-1">
                  <button 
                    onClick={() => togglePreference(key)}
                    disabled={key === 'necessary'}
                    className={`w-5 h-5 flex items-center justify-center rounded ${
                      key === 'necessary' ? 'bg-teal-600 cursor-not-allowed' : 
                        preferences[key] ? 'bg-teal-600 hover:bg-teal-700' : 'bg-white border border-gray-300 hover:border-teal-500'
                    } transition-colors`}
                    aria-label={preferences[key] ? `Disable ${title} cookies` : `Enable ${title} cookies`}
                  >
                    {(preferences[key] || key === 'necessary') && <Check size={12} className="text-white" />}
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{title} {key === 'necessary' && <span className="text-xs text-gray-500">(Required)</span>}</h3>
                  <p className="text-xs text-gray-600 mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}