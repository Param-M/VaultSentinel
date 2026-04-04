"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Globe, Clock, Calendar as CalIcon, X } from "lucide-react";
import { useState } from "react";

type Step = 'datetime' | 'form' | 'success';

export default function CalendarModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState<Step>('datetime');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [is24Hour, setIs24Hour] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  
  // To keep it simple, we hardcode April 2026 as per the user's reference mockup
  const currentMonthName = "April 2026";
  const daysInMonth = 30;
  const startDayOfWeek = 3; // April 1 2026 is a Wednesday (0=Sun, 1=Mon, 2=Tue, 3=Wed)

  // Dynamic time generation
  const times = Array.from({ length: 30 }).map((_, i) => {
    const totalMinutes = 9 * 60 + i * 30; // Starts at 9:00 AM
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    if (is24Hour) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    } else {
      const hour12 = h > 12 ? h - 12 : h;
      return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`;
    }
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => { 
      setStep('datetime'); 
      setSelectedDate(null); 
      setSelectedTime(null); 
    }, 300);
  };

  const getDayOfWeek = (day: number) => {
    return (startDayOfWeek + day - 1) % 7;
  };

  const isWeekend = (day: number) => {
    const dow = getDayOfWeek(day);
    return dow === 0 || dow === 6; // Sunday or Saturday
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-[#1C1C1C] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row relative text-white min-h-[500px]"
          >
             
             {/* Left Pane: Info (Always visible, expands on mobile) */}
             <div className="w-full md:w-[320px] bg-[#242424] border-r border-white/5 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center border border-accent-blue/40">
                    <span className="text-accent-blue font-bold text-xs">VS</span>
                  </div>
                  <span className="text-sm text-gray-400 font-medium">Vault Sentinel</span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Platform Demo & Risk Assessment</h2>
                
                <div className="text-sm text-gray-300 mb-8 space-y-4">
                  <p>Speak directly with our engineering team to map out your security posture.</p>
                  <p>In this call:<br/>
                  <span className="font-bold text-white">- Identify active API vulnerabilities</span><br/>
                  <span className="font-bold text-white">- Discuss integration architecture</span>
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-4 text-sm text-gray-400">
                   {(step === 'form' || step === 'success') && selectedDate && selectedTime && (
                     <div className="flex items-start gap-3 text-white">
                        <CalIcon size={16} className="mt-0.5 opacity-60" />
                        <span>Thursday, April {selectedDate}, 2026<br/>{selectedTime} - {selectedTime.replace('00', '30').replace('30', '00')}</span>
                     </div>
                   )}
                   <div className="flex items-center gap-3">
                      <Clock size={16} className="opacity-60" />
                      <span>30m</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.1303 6.94042L18.4285 4.54562C17.7588 3.95213 16.7025 4.41443 16.7025 5.30825V8.12501H4C3.44772 8.12501 3 8.57272 3 9.12501V14.875C3 15.4273 3.44772 15.875 4 15.875H16.7025V18.6918C16.7025 19.5856 17.7588 20.0479 18.4285 19.4544L21.1303 17.0596C21.8415 16.4296 21.8415 15.5704 21.1303 14.9404L18.4285 12.5456C17.7588 11.9521 16.7025 12.4144 16.7025 13.3083V13.875H5V10.125H16.7025V10.6918C16.7025 11.5856 17.7588 12.0479 18.4285 11.4544L21.1303 9.0596C21.8415 8.42962 21.8415 7.57041 21.1303 6.94042Z" fill="#00E073"/>
                      </svg>
                      <span>Google Meet</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Globe size={16} className="opacity-60" />
                      <span>Asia/Delhi</span>
                   </div>
                </div>
             </div>

             {/* Right Pane: Dynamic Content */}
             <div className="flex-1 flex flex-col md:flex-row relative">
               
               {/* STEP 1: DATE & TIME */}
               {step === 'datetime' && (
                 <>
                   {/* Calendar Column */}
                   <div className="flex-1 p-8 border-r border-white/5">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-xl font-medium">{currentMonthName}</h3>
                         <div className="flex gap-2">
                           <button className="text-gray-500 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
                           <button className="text-gray-500 hover:text-white transition-colors"><ChevronRight size={20}/></button>
                         </div>
                      </div>

                      <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center mb-4 text-xs font-semibold text-gray-500">
                         <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
                      </div>
                      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                         {/* Empty days offset */}
                         {Array.from({ length: startDayOfWeek }).map((_, i) => (
                           <div key={`empty-${i}`} className="aspect-square"></div>
                         ))}
                         {/* Days */}
                         {Array.from({ length: daysInMonth }).map((_, i) => {
                           const dayNumber = i + 1;
                           const disabled = isWeekend(dayNumber);
                           const isSelected = selectedDate === dayNumber;

                           return (
                             <button
                               key={i}
                               disabled={disabled}
                               onClick={() => { setSelectedDate(dayNumber); setSelectedTime(null); }}
                               className={`
                                 aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all
                                 ${disabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
                                 ${isSelected && !disabled ? 'bg-white text-black hover:bg-white scale-110' : ''}
                               `}
                             >
                               {dayNumber}
                             </button>
                           )
                         })}
                      </div>
                   </div>

                   {/* Time Column */}
                   <div className="w-full md:w-[280px] p-8 flex flex-col h-full bg-[#1C1C1C]">
                      {selectedDate ? (
                        <>
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-lg font-medium">Wed {selectedDate < 10 ? `0${selectedDate}` : selectedDate}</h4>
                            <div className="bg-black/30 p-1 rounded-md flex text-[10px] font-bold">
                              <button onClick={() => setIs24Hour(false)} className={`px-2 py-1 rounded transition-colors ${!is24Hour ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}>12h</button>
                              <button onClick={() => setIs24Hour(true)} className={`px-2 py-1 rounded transition-colors ${is24Hour ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}>24h</button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2 custom-scrollbar max-h-[300px]">
                            {times.map(t => (
                              <div key={t} className="flex gap-2">
                                <button
                                  onClick={() => setSelectedTime(t)}
                                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm border transition-all ${selectedTime === t ? 'bg-[#333] border-[#555]' : 'border-white/10 hover:border-white/30 text-white'}`}
                                >
                                  {t}
                                </button>
                                {/* Next step trigger if selected */}
                                {selectedTime === t && (
                                  <button onClick={() => setStep('form')} className="bg-white text-black px-4 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors animate-in slide-in-from-left-2">
                                    Next
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-sm">
                           <p>Select a date to see times</p>
                        </div>
                      )}
                   </div>
                 </>
               )}

               {/* STEP 2: FORM */}
               {step === 'form' && (
                 <div className="flex-1 p-8 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    <button onClick={() => setStep('datetime')} className="w-max p-2 -ml-2 mb-6 rounded-full hover:bg-white/10 transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex-1 flex flex-col gap-6 max-w-[400px]">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Your name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Email address *</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Bank name *</label>
                        <input type="text" className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Additional notes *</label>
                        <textarea rows={3} className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-500" placeholder="Please share anything that will help prepare for our meeting."></textarea>
                      </div>
                      
                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/10">
                        <span className="text-xs text-gray-500 max-w-[180px]">By proceeding, you agree to Vault Sentinel's Terms.</span>
                        <div className="flex gap-4 items-center">
                          <button onClick={() => setStep('datetime')} className="text-sm font-bold text-gray-300 hover:text-white">Back</button>
                          <button 
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/book', { 
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ name, email })
                                });
                                const data = await res.json();
                                if (data.previewUrl) {
                                  setEmailPreviewUrl(data.previewUrl);
                                  console.log("View the sent email at: ", data.previewUrl);
                                }
                              } catch(e) {
                                console.error(e);
                              }
                              setStep('success');
                            }} 
                            className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors"
                          >Confirm</button>
                        </div>
                      </div>
                    </div>
                 </div>
               )}

               {/* STEP 3: SUCCESS */}
               {step === 'success' && (
                 <div className="flex-1 p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-accent-green/20 text-accent-green rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,224,115,0.3)]">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Meeting confirmed</h2>
                    <p className="text-gray-400 mb-4 max-w-[300px]">
                      We've sent a calendar invitation and Google Meet link to {email || "your email"}.
                    </p>
                    {emailPreviewUrl && (
                      <a href={emailPreviewUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-accent-blue/10 text-accent-blue border border-accent-blue/50 rounded-lg text-sm mb-8 hover:bg-accent-blue/20 transition-colors">
                        View Mocked Delivery Inbox
                      </a>
                    )}
                    <button onClick={handleClose} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                      Done
                    </button>
                 </div>
               )}

               <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md">
                 <X size={20} />
               </button>
             </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
