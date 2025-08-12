import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AIAssistant from "./components/AIAssistant";
import { Bot } from 'lucide-react';

function Layout() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      
      {/* AI Assistant Floating Button */}
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        title="Open AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* AI Assistant Modal */}
      {isAIOpen && (
        <AIAssistant 
          isOpen={isAIOpen} 
          onClose={() => setIsAIOpen(false)} 
        />
      )}
    </>
  );
}

export default Layout;
