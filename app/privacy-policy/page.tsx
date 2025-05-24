"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';


export default function PrivacyPolicy() {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Privacy Policy | Realvista Properties</title>
        <meta name="description" content="Privacy Policy for Realvista Properties" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="bg-[#348b8b] text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl max-w-2xl mx-auto">
            How we collect, use, disclose, and protect your personal information when you interact with our services.
          </p>
          <p className="mt-3 italic opacity-80">Effective Date: January 1, 2025</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Introduction */}
          <div className="mb-8">
            <p className="mb-4">
              As a company, Realvista Properties Ltd values the privacy of our clients, website visitors, and partners. 
              How we collect, use, disclose, and protect your personal information when you interact with our services, 
              website, mobile applications, and transactions is well detailed in this Privacy Policy. This Policy also 
              offers tools you can access to stay in control and manage your privacy. Your use of our Services and any 
              dispute over privacy, is subject to this Privacy Notice and our Terms of Use.
            </p>
            <p className="mb-4">
              When we use the term 'Realvista', 'we', 'us', or 'our' in this privacy policy, we are referring to 
              Realvista Properties and all its affiliated brands and subsidiaries.
            </p>
            <p>
              By using our services, you consent to the practices described in this policy. We carefully evaluate how we 
              use data to make sure that we're using your information to provide value for you. We periodically revise 
              this Notice to reflect new and evolving laws that govern privacy.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold text-[#348b8b] mb-4">Contents</h3>
            <ul className="space-y-2">
              <li>
                <a href="#information-collect" className="text-[#348b8b] hover:underline">
                  1. Information We Collect
                </a>
              </li>
              <li>
                <a href="#information-usage" className="text-[#348b8b] hover:underline">
                  2. Your Information Usage
                </a>
              </li>
              <li>
                <a href="#disclosure" className="text-[#348b8b] hover:underline">
                  3. Our Disclosure of Your Information
                </a>
              </li>
              <li>
                <a href="#data-security" className="text-[#348b8b] hover:underline">
                  4. Data Security Implementation
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-[#348b8b] hover:underline">
                  5. Cookies and Similar Tracking Technologies
                </a>
              </li>
              <li>
                <a href="#rights" className="text-[#348b8b] hover:underline">
                  6. Your Rights and Choices
                </a>
              </li>
              <li>
                <a href="#children" className="text-[#348b8b] hover:underline">
                  7. Children's Data Privacy
                </a>
              </li>
              <li>
                <a href="#third-party" className="text-[#348b8b] hover:underline">
                  8. Third-Party Links
                </a>
              </li>
              <li>
                <a href="#international" className="text-[#348b8b] hover:underline">
                  9. International Data Transfers
                </a>
              </li>
              <li>
                <a href="#changes" className="text-[#348b8b] hover:underline">
                  10. Changes to This Privacy Policy
                </a>
              </li>
              <li>
                <a href="#contact" className="text-[#348b8b] hover:underline">
                  11. Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Policy Sections */}
          <div className="space-y-10">
            {/* Section 1 */}
            <section id="information-collect">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                1. Information We Collect
              </h2>
              <p className="mb-4">
                Your level of engagement with our Services informs the type of information we may require from you to provide the Services. 
                We may collect the following types of personal information when you use our App, Website or interact with us through 
                emails or call:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <span className="font-medium">Personal Information You Provide:</span> When you inquire about properties, register on our 
                  Website/App, schedule a property viewing, make a transaction, or contact us for support, we may collect your name, email 
                  address, phone number, mailing address, property preferences, financial details, and other information necessary for 
                  providing our services. Additionally, when you are signup through Facebook, Google, or any other third-party authorization 
                  service, we may make use of the information that they provide us to further customize your experience. We may share Personal 
                  Information with such third parties to deliver tailored content both on our Services and on third party sites (e.g., social 
                  media sites).
                </li>
                <li>
                  <span className="font-medium">Automatic Information:</span> For both registered and unregistered users, we automatically 
                  collect certain information when you visit our Website/App, such as IP addresses, browser type, cookie information, device 
                  information, location data (if enabled), and browsing activity (such as pages visited, properties that you view or save, and 
                  property that you claim).
                </li>
                <li>
                  <span className="font-medium">Transaction Data:</span> If you buy, sell, or lease property through us, we may collect 
                  financial details such as payment information, purchase history, and other transaction-related data.
                </li>
                <li>
                  <span className="font-medium">Publicly Available Information:</span> We may collect personal data from publicly available 
                  sources, such as information you publicly post or tag us in on social media sites or elsewhere online, and information 
                  contained in public records databases, such as government records or public review websites, to supplement the personal data 
                  identified above. We will use this information to conduct market research, verify your identity, prevent fraud, and improve 
                  our services.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="information-usage">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                2. Your Information Usage
              </h2>
              <p className="mb-4">
                We may disclose your Personal Information for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <span className="font-medium">To Provide Real Estate Services:</span> This includes facilitating property transactions, 
                  assisting with property searches, arranging viewings, processing offers, communicating about property details, and connecting 
                  you with a real estate agent, lender, landlord, or other real estate professional.
                </li>
                <li>
                  <span className="font-medium">To Improve Our Services:</span> We analyse how our website and services are used to enhance the 
                  user experience, improve property listings, and develop new features or offerings. Personalize your individual experience, 
                  including providing educational resources and pointing you to homes you might be interested in or offerings of ours that might 
                  help you find your next home, and investments.
                </li>
                <li>
                  <span className="font-medium">Service Providers:</span> Our service providers, such as payment processors and marketing 
                  providers, collect personal data and often share some or all of this information with us. For example, we receive personal 
                  data from payment processors to confirm that an individual's payment for the services was accepted. We use this information 
                  to comply with our legal obligations, to monitor activity to identify and provide you with promotions and offers, and to 
                  prevent fraud, protect our rights and the rights of others, to inform our marketing and advertising activities, and to help 
                  provide our services.
                </li>
                <li>
                  <span className="font-medium">To Communicate with You:</span> We may use your contact details to send you property updates, 
                  promotional offers, newsletters, or respond to inquiries. You can opt out of marketing communications at any time by following 
                  the unsubscribe instructions in our emails.
                </li>
                <li>
                  <span className="font-medium">To Meet Legal and Regulatory Requirements:</span> We may use your information to comply with 
                  legal obligations, such as tax laws, and to resolve disputes or enforce agreements and other governmental demands.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="disclosure">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                3. Our Disclosure of Your Information
              </h2>
              <p className="mb-4">
                We do not sell or disclose your personal information to third parties, except in instances outlined in this policy.
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <span className="font-medium">Service Providers:</span> We may share your information with trusted third parties who provide 
                  services on our behalf, such as payment processors, marketing agencies, website hosts, or property management companies.
                </li>
                <li>
                  <span className="font-medium">Business Transaction or Reorganization:</span> We may take part in or be involved with a 
                  corporate business transaction, such as a merger, acquisition, joint venture, or financing or sale of company assets. We may 
                  disclose your personal data to a third-party during negotiation of, in connection with, or as an asset in such a corporate 
                  business transaction. Your personal data may also be disclosed in the event of insolvency, bankruptcy, or receivership.
                </li>
                <li>
                  <span className="font-medium">Legal Compliance:</span> We may disclose your information if required by law, to respond to 
                  legal processes, or to protect the rights, property, and safety of our business, employees, customers, or the public.
                </li>
                <li>
                  <span className="font-medium">Third-Party Advertising Partners:</span> We may share limited personal information (such as 
                  browsing behaviour or location) with trusted advertising partners to display relevant ads, but these partners are prohibited 
                  from using your information for any other purpose.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="data-security">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                4. Data Security Implementation
              </h2>
              <p className="mb-4">
                We ensure the implementation of best available technologies, physical, and administrative measures to protect your personal 
                information from unauthorized access, use, or disclosure. However, no method of transmission or electronic storage is completely 
                secure. While we strive to use commercially acceptable means to protect your information, we cannot fully guarantee its absolute 
                security as most of these are third party security infrastructures.
              </p>
            </section>

            {/* Section 5 */}
            <section id="cookies">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                5. Cookies and Similar Tracking Technologies
              </h2>
              <p className="mb-4">
                Our Services may use site and app Technologies (including cookies, web-beacons, java scripts, and other technologies) to collect 
                and share Personal Information about you, your device, and your use of our Services for any of our business purposes described 
                in this Privacy Policy. This technology enables us to enhance your browsing experience, remember your preferences, track website 
                usage patterns, and offer personalized services.
              </p>
              <p className="mb-4">
                We, or our third-party partners, may link your various devices so that content you see on one device can result in relevant 
                advertising on another device. We may share a common account identifier (such as a hashed email address or user ID) or work with 
                third-party partners who use tracking technologies or statistical modelling tools to determine if two or more devices are linked 
                to a single user or household. We, and our partners, can use this cross-device linkage to serve interest-based advertising and 
                other personalized content to you across your devices (including to improve your user experience), to perform analytics, and to 
                measure the performance of our advertising campaigns.
              </p>
              <p>
                However, you can adjust your browser settings to manage cookies or block them entirely. For information on rights, you may have 
                to opt-out of data collection or sharing by such technologies used on our services, see section 6 below.
              </p>
            </section>

            {/* Section 6 */}
            <section id="rights">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                6. Your Rights and Choices
              </h2>
              <p className="mb-4">
                You have certain rights to opt in or opt out regarding your personal information we collect or use:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <span className="font-medium">Access and Correction:</span> At any point, you can request access to the personal information 
                  we hold about you and ask us to correct any inaccuracies. This can by done through the updating of your profile. However, we 
                  may retain the previous details for business purposes or to meet our legal obligations.
                </li>
                <li>
                  <span className="font-medium">Notifications:</span> We may send you push notifications through the RealVista mobile application. 
                  You may at any time opt-out from receiving these types of communications by changing the settings on your mobile device. 
                  RealVista may also collect location-based information if you use our mobile applications. You may opt-in or opt-out of this 
                  collection by changing the settings on your mobile device.
                </li>
                <li>
                  <span className="font-medium">Deletion:</span> Circumstances may require that you request the deletion of your personal 
                  information. However, this may limit our ability to continue providing services to you. We may retain Personal Information for 
                  as long as we have a valid business purpose to or to meet our legal obligations.
                </li>
                <li>
                  <span className="font-medium">Opt-Out:</span> You can opt-out of receiving promotional emails or marketing communications at 
                  any time by clicking the "unsubscribe" link in the email or contacting us directly. Note that you will continue to receive 
                  transaction-related emails regarding products or Services you have requested. We may also send you certain non-promotional 
                  communications regarding us and our Services, and you will not be able to opt out of those communications (e.g., communications 
                  regarding the Services or updates to out Terms of Use or this Privacy Policy).
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="children">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                7. Children's Data Privacy
              </h2>
              <p className="mb-4">
                Our website, mobile application and services are not intended for or directed to children under the age of 13. We do not 
                knowingly collect or solicit personal information from anyone under 13. If a child under the age of 13 has provided personal 
                data to us, we encourage the child's parent or guardian to contact us as described below to request that we remove the personal 
                data from our systems. If we discover that we have collected personal information from a child under 13, we will take prompt 
                steps to delete such information.
              </p>
            </section>

            {/* Section 8 */}
            <section id="third-party">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                8. Third-Party Links
              </h2>
              <p className="mb-4">
                Our website and mobile application may contain links or redirect you to external sites or third-party services, plug-ins and 
                applications that are not operated by us. We are not responsible for the privacy practices of these third-party services or 
                the practices of other third parties. We encourage you to review the privacy policies of these sites before providing any 
                personal information.
              </p>
            </section>

            {/* Section 9 */}
            <section id="international">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                9. International Data Transfers
              </h2>
              <p className="mb-4">
                If you are located outside of the countries where we are domiciled, please be aware that your personal information may be 
                transferred, processed, and stored in a country that may have different data protection laws than your country of residence.
              </p>
            </section>

            {/* Section 10 */}
            <section id="changes">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4 pb-2 border-b-2 border-[#4aa0a0]">
                10. Changes to This Privacy Policy
              </h2>
              <p className="mb-4">
                This Privacy Policy will be reviewed and modified from time to time, and we reserve the right to any modification at any time. 
                Any changes will be posted on this page with an updated "Effective Date." We will also notify you of any updated through emails 
                and push notifications. We encourage you to review this Privacy Policy periodically to stay informed about how we collect and 
                protect your information.
              </p>
            </section>

            {/* Section 11 (Contact) */}
            <section id="contact" className="bg-gray-50 p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-[#348b8b] mb-4">
                11. Contact Us
              </h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy, or if you would like to exercise your rights, 
                please contact us at:
              </p>
              <p className="font-bold text-[#348b8b]">
                contact@realvistaproperties.com
              </p>
            </section>
          </div>
        </div>
      </main>
      {/* Scroll to top button */}
      {/* {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#348b8b] text-white p-3 rounded-full shadow-lg hover:bg-[#2a7070] transition-colors duration-300 focus:outline-none"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )} */}
    </div>
  );
}