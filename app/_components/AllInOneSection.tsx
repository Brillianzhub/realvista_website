import React from 'react';
import Image from 'next/image';
import { Grid, User, Layers, CheckCircle, ArrowRight } from 'lucide-react';

export default function RealvistaAllInOneSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-white to-blue-50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-24 right-0 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-300 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Phone Mockup Section */}
          <div className="relative order-2 lg:order-1">
            <div className="relative flex justify-center">
              {/* Shadow and Glow Effect */}
              <div className="absolute -bottom-6 w-3/4 h-8 bg-black/10 blur-xl rounded-full"></div>
              
              {/* Image Frame */}
              <div className="relative z-10 p-1">
                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  <img
                    src="/design3.jpg"
                    alt="Realvista App Interface"
                    className="object-cover h-[32rem] w-full"
                  />
                </div>
              </div>
              
              {/* Accent Circle */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#FB902D] rounded-full opacity-10"></div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-10 order-1 lg:order-2">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-3 mb-2">
                <div className="bg-[#FB902D] p-2 rounded-lg shadow-lg shadow-orange-200">
                  <Grid className="text-white" size={20} />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#FB902D]">Powerful Solution</span>
              </div>
              
              <h2 className="text-3xl lg:text-3xl my-2 font-bold text-gray-800 leading-tight">
                ALL-IN-ONE <span className="text-[#FB902D]">APP</span>
              </h2>
              
              <p className="text-gray-600 text-lg max-w-xl">
                Experience seamless real estate management with our comprehensive solution designed for modern professionals.
              </p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 space-y-8 transform transition-all hover:shadow-2xl">
              <h3 className="text-2xl font-semibold text-gray-800">
                Your Real Estate, Your Way!
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                Take full control of your real estate journey with an app designed to fit your needs. Realvista offers a fully customizable experience, letting you tailor everything from financial tracking to property management tools.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 group">
                  <div className="p-2 bg-blue-50 rounded-lg text-[#348b8b] group-hover:bg-[#348b8b] group-hover:text-white transition-colors">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Personalized Dashboard</h4>
                    <p className="text-sm text-gray-500">Customized for your workflow</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="p-2 bg-green-50 rounded-lg text-[#348b8b] group-hover:bg-[#348b8b] group-hover:text-white transition-colors">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Flexible Management</h4>
                    <p className="text-sm text-gray-500">Adapt to changing needs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="p-2 bg-orange-50 rounded-lg text-[#FB902D] group-hover:bg-[#FB902D] group-hover:text-white transition-colors">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Smart Automation</h4>
                    <p className="text-sm text-gray-500">Save time on routine tasks</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="p-2 bg-purple-50 rounded-lg text-[#FB902D] group-hover:bg-[#FB902D] group-hover:text-white transition-colors">
                    <ArrowRight size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Seamless Integration</h4>
                    <p className="text-sm text-gray-500">Works with your tools</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FB902D] to-orange-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 transition-all hover:-translate-y-0.5">
                  <span>Explore Features</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}