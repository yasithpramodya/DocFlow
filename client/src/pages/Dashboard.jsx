import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInbox, getOutbox } from '../api/document';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Plus,
    LogOut,
    FileText,
    Inbox,
    Send,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    User,
    ChevronRight,
    Loader2,
    Sun,
    Moon,
    Briefcase
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inbox'); // inbox, outbox
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, [activeTab]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            let data;
            if (activeTab === 'inbox') {
                data = await getInbox();
            } else {
                data = await getOutbox();
            }
            setDocuments(data.data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded border border-orange-100';
            case 'Urgent': return 'text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100';
            default: return 'text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-200';
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.trackingId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 border-r border-slate-800">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span>DocFlow</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/50 mb-6 font-medium"
                    >
                        <Plus size={20} />
                        <span>New Document</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('inbox')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'inbox' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Inbox size={20} />
                        <span>Inbox</span>
                        {/* You could add a badge here for unread items */}
                    </button>
                    <button
                         onClick={() => setActiveTab('outbox')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'outbox' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Send size={20} />
                        <span>Outbox</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-sm font-bold shadow-inner">
                            {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate text-gray-200">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                             <div className="flex items-center gap-1 mt-1 text-blue-400">
                                <Briefcase size={10} />
                                <p className="text-[10px] uppercase tracking-wider font-semibold truncate">{user?.department || 'Staff'}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950">
                <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10 px-8 py-5 flex items-center justify-between transition-colors">
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {activeTab === 'inbox' && 'Inbox'}
                            {activeTab === 'outbox' && 'Sent Documents'}
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                             {activeTab === 'inbox' ? 'Documents awaiting your review' : 'Track documents you have dispatched'}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by ID or Title..."
                                className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-72 transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                            <p>Loading documents...</p>
                        </div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 border-dashed">
                            <div className="bg-gray-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <FileText className="text-gray-400 w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No documents found</h3>
                            <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                                {activeTab === 'inbox' ? "You don't have any incoming documents yet." : "You haven't sent any documents yet."}
                            </p>
                            {activeTab === 'outbox' && (
                                <button 
                                    onClick={() => navigate('/register')}
                                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Create First Document
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Document</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            {activeTab === 'inbox' ? 'Sender' : 'Receiver'}
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {filteredDocs.map((doc) => (
                                        <tr 
                                            key={doc._id} 
                                            onClick={() => navigate(`/document/${doc._id}`)}
                                            className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doc.title}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">{doc.trackingId}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">{doc.type}</span>
                                                    <span className={`text-[10px] ${getPriorityColor(doc.priority)}`}>{doc.priority}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs text-gray-500 dark:text-slate-300 font-medium">
                                                        {(activeTab === 'inbox' ? doc.sender?.email : doc.receiver?.email)?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                                                        {activeTab === 'inbox' ? doc.sender?.email : doc.receiver?.email}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500 dark:text-slate-500">
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 ml-auto transition-colors" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
