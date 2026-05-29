"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EventItem {
  date: string; // "2026-MM-DD"
  text: string;
}

export default function SchedulePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(6); // 6월 ~ 11월 제한
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // [수정] 메인 홈 화면과 동일한 키("class_admin")를 바라보도록 연동했습니다.
    const adminStatus = localStorage.getItem("class_admin") === "true";
    setIsAdmin(adminStatus);
    
    const saved = localStorage.getItem("class_events");
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      const defaultEvents = [
        { date: "2026-06-29", text: "기말고사" },
        { date: "2026-07-25", text: "여름방학" },
        { date: "2026-09-02", text: "9월평가원" },
        { date: "2026-11-19", text: "수능" }
      ];
      setEvents(defaultEvents);
      localStorage.setItem("class_events", JSON.stringify(defaultEvents));
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 달력 생성 로직 (2026년 기준)
  const year = 2026;
  const firstDay = new Date(year, currentMonth - 1, 1).getDay();
  const totalDays = new Date(year, currentMonth, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const handleSaveEvent = () => {
    if (!selectedDate) return;
    let updated = [...events];
    if (!inputVal.trim()) {
      updated = updated.filter(e => e.date !== selectedDate);
    } else {
      const existing = updated.find(e => e.date === selectedDate);
      if (existing) existing.text = inputVal;
      else updated.push({ date: selectedDate, text: inputVal });
    }
    setEvents(updated);
    localStorage.setItem("class_events", JSON.stringify(updated));
    setSelectedDate(null);
    setInputVal("");
  };

  const handleDeleteEvent = (dateStr: string) => {
    if (!confirm("정말 이 일정을 삭제하시겠습니까?")) return;
    const updated = events.filter(e => e.date !== dateStr);
    setEvents(updated);
    localStorage.setItem("class_events", JSON.stringify(updated));
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex justify-between items-center aero-window p-6">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">학사일정</h1>
          <p className="text-xs font-bold text-sky-800/80 mt-0.5">
            {isAdmin ? "Admin Mode" : "View Mode"}
          </p>
        </div>
      </header>

      {/* 달력 컨트롤 창 */}
      <section className="aero-window p-6 space-y-4">
        <div className="flex justify-between items-center bg-white/40 p-3 rounded-2xl border border-white">
          <button 
            type="button"
            disabled={currentMonth <= 6}
            onClick={() => setCurrentMonth(prev => prev - 1)}
            className="aero-giant-btn px-4 py-2 text-sm disabled:opacity-30 cursor-pointer z-10"
          >
            ← Prev
          </button>
          <h2 className="text-2xl font-black text-[#003366] select-none">{year} . {currentMonth}</h2>
          <button 
            type="button"
            disabled={currentMonth >= 11}
            onClick={() => setCurrentMonth(prev => prev + 1)}
            className="aero-giant-btn px-4 py-2 text-sm disabled:opacity-30 cursor-pointer z-10"
          >
            Next →
          </button>
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-2 text-center font-bold text-sm text-sky-900">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="p-2 text-[#003366]/60 select-none">{d}</div>
          ))}
          
          {calendarCells.map((day, idx) => {
            const cellKey = `cell-${currentMonth}-${idx}`;
            
            if (day === null) {
              return <div key={cellKey} className="h-16 bg-transparent opacity-0" />;
            }
            
            const dateStr = `2026-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = events.find(e => e.date === dateStr);

            return (
              <div 
                key={cellKey}
                onClick={() => {
                  if (isAdmin) {
                    setSelectedDate(dateStr);
                    setInputVal(hasEvent ? hasEvent.text : "");
                  }
                }}
                className={`h-16 border border-white/40 rounded-xl p-1 flex flex-col justify-between items-center transition relative ${isAdmin ? 'cursor-pointer hover:bg-white/60 hover:scale-105' : ''} ${hasEvent ? 'bg-gradient-to-br from-cyan-300/50 to-emerald-300/40 shadow-inner border-cyan-400' : 'bg-white/20'}`}
              >
                <span className="text-xs self-start ml-1 select-none">{day}</span>
                {hasEvent && (
                  <span className="bg-sky-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-md w-full truncate text-center shadow-sm font-black">
                    {hasEvent.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 관리자 일정 추가 모달 */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="aero-window p-6 w-full max-w-sm space-y-4 bg-white/90">
            <h3 className="text-lg font-black text-[#003366]">{selectedDate} 일정 관리</h3>
            <input 
              type="text"
              placeholder="일정 내용을 입력하세요. (비우면 삭제)"
              className="w-full bg-white p-2 text-sm rounded-xl border outline-none shadow-inner"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelectedDate(null)} className="flex-1 bg-gray-400 text-white font-bold p-2 text-sm rounded-xl">취소</button>
              <button type="button" onClick={handleSaveEvent} className="flex-1 bg-sky-600 text-white font-bold p-2 text-sm rounded-xl shadow-md">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 리스트 영역 */}
      <section className="aero-window p-5 space-y-3">
        <h3 className="text-base font-black text-[#003366]">이번 달 일정 리스트</h3>
        <div className="space-y-2">
          {events
            .filter(e => {
              const eventMonth = parseInt(e.date.split('-')[1]);
              return eventMonth === currentMonth;
            })
            .sort((a,b) => a.date.localeCompare(b.date))
            .map(e => {
              const [,, d] = e.date.split('-');
              return (
                <div key={e.date} className="flex justify-between items-center bg-white/50 px-4 py-2.5 rounded-xl border border-white/60 shadow-sm">
                  <span className="text-sm font-extrabold text-[#003366]">
                    {currentMonth} / {parseInt(d)} : <span className="font-black text-sky-700 ml-1">{e.text}</span>
                  </span>
                  {isAdmin && (
                    <button 
                      type="button"
                      onClick={() => handleDeleteEvent(e.date)}
                      className="text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          {events.filter(e => parseInt(e.date.split('-')[1]) === currentMonth).length === 0 && (
            <p className="text-xs text-center py-4 text-sky-800/60 font-bold">등록된 학사일정이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 작업 표시줄 고정 */}
      <footer className="fixed bottom-0 left-0 w-full h-12 bg-white/30 backdrop-blur-lg border-t border-white/80 flex items-center justify-between px-6 z-50">
        <Link href="/"><button className="bg-gradient-to-b from-sky-400 to-sky-600 text-white font-black px-6 py-1.5 rounded-xl shadow-md text-xs border border-white/40 cursor-pointer">Home</button></Link>
        <div className="bg-white/70 px-4 py-1 rounded-xl text-xs font-bold text-sky-900 border border-white">{currentTime || "Loading..."}</div>
      </footer>
    </main>
  );
}