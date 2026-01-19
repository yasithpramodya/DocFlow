import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, updateDocumentStatus, forwardDocument } from '../api/document';
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, User as UserIcon, Loader2, Send, Briefcase, Share } from 'lucide-react'; // Changed CornerUpRight to Share
import { useAuth } from '../context/AuthContext';

const TrackDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    
    // Status update state
    const [statusComment, setStatusComment] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [targetStatus, setTargetStatus] = useState('');

    // Forward document state
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardEmail, setForwardEmail] = useState('');
    const [forwardComment, setForwardComment] = useState('');

    useEffect(() => {
        fetchDocument();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const data = await getDocument(id);
            setDocument(data.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch document');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            setUpdating(true);
            await updateDocumentStatus(id, targetStatus, statusComment);
            setShowStatusModal(false);
            setStatusComment('');
            fetchDocument(); // Refresh
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleForward = async () => {
         try {
            setUpdating(true);
            await forwardDocument(id, forwardEmail, forwardComment);
            setShowForwardModal(false);
            setForwardEmail('');
            setForwardComment('');
            fetchDocument();
        } catch (err) {
            alert(err.response?.data?.error || 'Forward failed');
        } finally {
            setUpdating(false);
        }
    };

    const openStatusModal = (status) => {
        setTargetStatus(status);
        setShowStatusModal(true);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!document) return null;

    const isReceiver = user && document.receiver._id === user._id;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6 min-h-screen">
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </button>

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                                {document.type}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                                document.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 
                                document.priority === 'High' ? 'bg-orange-100 text-orange-700' : 
                                'bg-green-100 text-green-700'
                            }`}>
                                {document.priority} Priority
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{document.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">Tracking ID: {document.trackingId}</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                         <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
                            document.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700' :
                            document.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                            document.status === 'Accepted' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            'bg-yellow-50 border-yellow-200 text-yellow-700'
                        }`}>
                            {document.status === 'Approved' ? <CheckCircle className="w-5 h-5" /> :
                             document.status === 'Rejected' ? <XCircle className="w-5 h-5" /> :
                             document.status === 'Accepted' ? <CheckCircle className="w-5 h-5" /> :
                             <Clock className="w-5 h-5" />}
                            <span className="font-semibold">{document.status}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Document Details</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{document.description}</p>
                        
                        <div className="space-y-3">
                            <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="mt-0.5"><UserIcon className="w-4 h-4 text-gray-400" /></div>
                                <div>
                                    <span className="block text-xs uppercase text-gray-400 font-semibold tracking-wider">Sender</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{document.sender?.name || document.sender?.email}</span>
                                    {document.sender?.department && (
                                        <div className="flex items-center gap-1 text-blue-500 text-xs mt-0.5">
                                            <Briefcase className="w-3 h-3" />
                                            <span>{document.sender.department}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                            <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                                <div className="mt-0.5"><Send className="w-4 h-4 text-gray-400" /></div>
                                <div>
                                    <span className="block text-xs uppercase text-gray-400 font-semibold tracking-wider">Receiver</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{document.receiver?.name || document.receiver?.email}</span>
                                    {document.receiver?.department && (
                                        <div className="flex items-center gap-1 text-blue-500 text-xs mt-0.5">
                                            <Briefcase className="w-3 h-3" />
                                            <span>{document.receiver.department}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                    </div>

                    {/* Actions Panel (Only for Receiver) */}
                    {isReceiver && (document.status === 'Pending' || document.status === 'Accepted') && (
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-100 dark:border-slate-800 transition-colors">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {document.status === 'Pending' ? (
                                    <button 
                                        onClick={() => openStatusModal('Accepted')}
                                        className="col-span-2 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Accept Document
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => openStatusModal('Approved')}
                                            className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button 
                                            onClick={() => openStatusModal('Rejected')}
                                            className="flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                        <button 
                                            onClick={() => openStatusModal('Reviewed')}
                                            className="flex items-center justify-center gap-2 bg-slate-600 text-white py-2.5 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                                        >
                                            <FileText className="w-4 h-4" /> Reviewed
                                        </button>
                                        <button 
                                            onClick={() => setShowForwardModal(true)}
                                            className="flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                        >
                                            <Share className="w-4 h-4" /> Forward
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8 transition-colors">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Document History</h3>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
                    {document.history.map((event, index) => (
                        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                <div className={`w-3 h-3 rounded-full ${
                                    event.status === 'Approved' ? 'bg-green-500' :
                                    event.status === 'Rejected' ? 'bg-red-500' :
                                    event.status === 'Accepted' ? 'bg-blue-500' :
                                    event.status === 'Forwarded' ? 'bg-purple-500' :
                                    'bg-yellow-500'
                                }`}></div>
                            </div>
                            
                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-slate-900 dark:text-white">{event.status}</div>
                                    <time className="font-mono italic text-xs text-slate-500 dark:text-slate-400">{new Date(event.timestamp).toLocaleString()}</time>
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 text-sm">
                                    Updated by <span className="font-medium text-slate-800 dark:text-slate-200">{event.updatedBy?.name || event.updatedBy?.email}</span>
                                </div>
                                <div className="text-slate-600 dark:text-slate-300 text-sm mt-2 italic bg-slate-50 dark:bg-slate-700/50 p-2 rounded transition-colors">
                                    "{event.comment}"
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-gray-100 dark:border-slate-800 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm {targetStatus}</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Please add a comment or remarks for this action.</p>
                        <textarea
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none mb-4 transition-colors"
                            rows="3"
                            placeholder="Add remarks..."
                            value={statusComment}
                            onChange={(e) => setStatusComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleStatusUpdate}
                                disabled={updating}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Forward Modal */}
            {showForwardModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-gray-100 dark:border-slate-800 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Forward Document</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Select the next receiver for this document.</p>
                        
                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receiver Email</label>
                                <input 
                                    type="email" 
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                    placeholder="Enter email..."
                                    value={forwardEmail}
                                    onChange={(e) => setForwardEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                                <textarea
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                    rows="3"
                                    placeholder="Add remarks..."
                                    value={forwardComment}
                                    onChange={(e) => setForwardComment(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowForwardModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleForward}
                                disabled={updating}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                                Forward
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackDocument;
