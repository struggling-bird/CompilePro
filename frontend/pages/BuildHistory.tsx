import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Terminal, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { MOCK_BUILD_HISTORY, MOCK_DEPLOYMENTS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const BuildHistory: React.FC = () => {
  const navigate = useNavigate();
  const { deployId } = useParams();
  const { t } = useLanguage();

  const deployment = MOCK_DEPLOYMENTS.find(d => d.id === deployId);
  const history = MOCK_BUILD_HISTORY.filter(h => h.deploymentId === deployId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center">
           <button onClick={() => navigate('/manage')} className="text-slate-500 hover:text-slate-800 mr-4">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
              <h1 className="text-lg font-bold text-slate-800">{t.buildHistory.title}</h1>
              <p className="text-xs text-slate-500">{deployment?.name}</p>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
         <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
               <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.buildHistory.buildNo}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.buildHistory.startTime}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.buildHistory.status}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.buildHistory.duration}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.buildHistory.triggerBy}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.buildHistory.commit}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t.buildHistory.action}</th>
               </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
               {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        #{record.buildNumber}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {record.startTime}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`flex items-center px-2 py-0.5 rounded-full text-xs w-fit font-medium ${
                           record.status === 'Success' ? 'bg-green-100 text-green-800' : 
                           record.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                           'bg-yellow-100 text-yellow-800'
                        }`}>
                           {record.status === 'Success' && <CheckCircle className="w-3 h-3 mr-1" />}
                           {record.status === 'Failed' && <XCircle className="w-3 h-3 mr-1" />}
                           {record.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" /> {record.duration}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {record.triggerBy}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                        {record.commitHash || '-'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                           onClick={() => navigate(`/build/${deployId}`)} 
                           className="text-slate-600 hover:text-blue-600 flex items-center ml-auto"
                        >
                           <Terminal className="w-4 h-4 mr-1" />
                           {t.buildHistory.viewLog}
                        </button>
                     </td>
                  </tr>
               ))}
               {history.length === 0 && (
                  <tr>
                     <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        {t.buildHistory.noHistory}
                     </td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default BuildHistory;