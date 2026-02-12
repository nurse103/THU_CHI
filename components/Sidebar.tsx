import React from 'react';

interface SidebarProps {
    activeTab: 'dashboard' | 'transactions' | 'tax' | 'settings';
    setActiveTab: (tab: 'dashboard' | 'transactions' | 'tax' | 'settings') => void;
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: 'fa-home' },
        { id: 'transactions', label: 'Thu-Chi', icon: 'fa-list' },
        { id: 'tax', label: 'Thuế TNCN', icon: 'fa-calculator' },
        { id: 'settings', label: 'Cài đặt', icon: 'fa-cog' },
    ] as const;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Content */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:flex-col md:h-screen md:shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo / Header */}
                <div className="p-6 border-b border-indigo-800 flex items-center justify-between">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <i className="fas fa-wallet"></i>
                        THU-CHI
                    </h1>
                    <button onClick={onClose} className="md:hidden text-indigo-300 hover:text-white">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        onClose();
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                                        ? 'bg-indigo-700 text-white font-medium'
                                        : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                                        }`}
                                >
                                    <i className={`fas ${item.icon} w-5 text-center`}></i>
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User / Footer */}
                <div className="p-4 border-t border-indigo-800">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-200 hover:bg-red-600 hover:text-white transition-colors"
                    >
                        <i className="fas fa-sign-out-alt w-5 text-center"></i>
                        Đăng xuất
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
