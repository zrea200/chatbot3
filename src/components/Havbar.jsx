import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

const Havbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-white shadow-md fixed w-full z-50 transition-all duration-300">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <a href="#" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">H</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">HeroUI</span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">首页</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">组件</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">文档</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">资源</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">关于</a>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <a href="#" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5">
                            开始使用
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <button className="md:hidden text-gray-700" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-2xl" />
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4">
                        <div className="flex flex-col space-y-4">
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 border-b border-gray-100">首页</a>
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 border-b border-gray-100">组件</a>
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 border-b border-gray-100">文档</a>
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 border-b border-gray-100">资源</a>
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2 border-b border-gray-100">关于</a>
                            <a href="#" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium text-center hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                                开始使用
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Havbar;  