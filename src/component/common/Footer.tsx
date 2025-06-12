
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-[8.5%] z-10 bg-blue-100 border-t border-blue-300 backdrop-blur-md text-blue-900 p-0">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-1.5 text-sm pt-[8.8px] font-roboto">
        <div className="flex gap-6 flex-wrap justify-center text-[16px]">
          <a href="#" className="text-blue-600 hover:text-blue-900 transition">
            Privacy Policy
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-900 transition">
            Terms of Service
          </a>
          <a href="#" className="text-blue-600 hover:text-blue-900 transition">
            Contact Us
          </a>
        </div>
        <div className="text-blue-600 text-xs text-center">
          &copy; {currentYear} USCIB Carnet Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
