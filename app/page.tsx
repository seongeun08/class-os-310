"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  
  const [musicUrl, setMusicUrl] = useState("https://www.youtube.com/embed/jfKfPfyJRdk"); 
  const [editMusic, setEditMusic] = useState(false);
  const [newMusicInput, setNewMusicInput] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<Array<{ x: number, y: number, vx: number, vy: number, radius: number }>>([]);
  const bubbleElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // [추가] 페이지가 로드될 때 브라우저에 저장된 관리자 로그인 상태를 확인합니다.
    const adminStatus = localStorage.getItem("class_admin") === "true";
    setIsAdmin(adminStatus);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }, 1000);

    const events = [
      { name: "기말고사", date: "2026-06-29", displayDate: "6 / 29" },
      { name: "여름방학", date: "2026-07-25", displayDate: "7 / 25" },
      { name: "9월평가원", date: "2026-09-02", displayDate: "9 / 2" },
      { name: "수능", date: "2026-11-19", displayDate: "11 / 19" }
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calculatedEvents = events
      .map(event => {
        const eventDate = new Date(event.date);
        const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...event, diffDays };
      })
      .filter(event => event.diffDays >= 0)
      .sort((a, b) => a.diffDays - b.diffDays);

    setUpcomingEvents(calculatedEvents);
    return () => clearInterval(timer);
  }, []);

  // 물방울 물리엔진 (초저속 유영 및 완벽 튕기기)
  useEffect(() => {
    if (!containerRef.current || upcomingEvents.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const radius = 60; // 120px / 2

    bubblesRef.current = upcomingEvents.map(() => ({
      x: radius + Math.random() * (width - radius * 2),
      y: radius + Math.random() * (height - radius * 2),
      vx: (Math.random() - 0.5) * 0.4, 
      vy: (Math.random() - 0.5) * 0.4,
      radius: radius
    }));

    let animationFrameId: number;

    const update = () => {
      const bubbles = bubblesRef.current;
      const containerW = containerRef.current?.clientWidth || width;
      const containerH = containerRef.current?.clientHeight || height;

      for (let i = 0; i < bubbles.length; i++) {
        let b = bubbles[i];
        b.x += b.vx;
        b.y += b.vy;

        if (b.x <= 0) { b.x = 0; b.vx *= -1; }
        if (b.x + b.radius * 2 >= containerW) { b.x = containerW - b.radius * 2; b.vx *= -1; }
        if (b.y <= 0) { b.y = 0; b.vy *= -1; }
        if (b.y + b.radius * 2 >= containerH) { b.y = containerH - b.radius * 2; b.vy *= -1; }

        for (let j = i + 1; j < bubbles.length; j++) {
          let b2 = bubbles[j];
          let dx = (b2.x + b2.radius) - (b.x + b.radius);
          let dy = (b2.y + b2.radius) - (b.y + b.radius);
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < b.radius + b2.radius) {
            let tempVx = b.vx; let tempVy = b.vy;
            b.vx = b2.vx; b.vy = b2.vy;
            b2.vx = tempVx; b2.vy = tempVy;
            
            let overlap = (b.radius + b2.radius) - distance;
            b.x -= (dx / distance) * (overlap / 2);
            b.y -= (dy / distance) * (overlap / 2);
            b2.x += (dx / distance) * (overlap / 2);
            b2.y += (dy / distance) * (overlap / 2);
          }
        }

        if (bubbleElementsRef.current[i]) {
          bubbleElementsRef.current[i]!.style.transform = `translate(${b.x}px, ${b.y}px)`;
        }
      }
      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [upcomingEvents]);

  // 관리자 인증 로그인
  const handleAdminAuth = () => {
    if (password === "310") { 
      setIsAdmin(true); 
      localStorage.setItem("class_admin", "true"); // [수정] 브라우저에 저장하여 다른 페이지와 연동
      alert("Admin Mode Active."); 
      setPassword("");
    } 
    else { alert("Wrong password."); }
  };

  // [추가] 관리자 로그아웃 기능
  const handleLogout = () => {
    if (confirm("관리자 모드를 종료하시겠습니까?")) {
      setIsAdmin(false);
      localStorage.removeItem("class_admin");
    }
  };

  const changeMusic = () => {
    const videoId = newMusicInput.split('v=')[1]?.substring(0, 11) || newMusicInput.split('youtu.be/')[1]?.substring(0, 11);
    if (videoId) { setMusicUrl(`https://www.youtube.com/embed/${videoId}`); setEditMusic(false); } 
    else { alert("Invalid YouTube URL."); }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6 pb-24">
      
      {/* 상단 바 */}
      <header className="flex justify-between items-center aero-window p-6">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">Class OS 310</h1>
          <p className="text-xs font-bold text-sky-800/80 mt-0.5">Website Creator: 31012 박성은</p>
        </div>
        
        <div className="flex gap-2 items-center bg-white/50 p-2 rounded-xl border border-white">
          {!isAdmin ? (
            <>
              <input 
                type="password" 
                placeholder="Admin PW" 
                className="bg-white/90 px-3 py-1 rounded-lg text-xs outline-none w-28 border border-sky-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
              />
              <button onClick={handleAdminAuth} className="bg-[#0288d1] text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-sky-600 shadow-sm">
                Login
              </button>
            </>
          ) : (
            <button 
              onClick={handleLogout} 
              className="text-green-600 font-bold text-xs px-2 hover:bg-red-50 py-1 rounded-lg transition-all duration-200"
              title="클릭하면 로그아웃 됩니다"
            >
              Admin Mode
            </button>
          )}
        </div>
      </header>

      {/* 메인 뷰: [왼쪽 물방울 박스] [오른쪽 거대 카테고리 버튼] */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 왼쪽: 물방울 날짜 유영창 */}
        <div ref={containerRef} className="aero-window h-[400px] relative overflow-hidden bg-gradient-to-b from-white/30 to-white/10">
          {upcomingEvents.map((item, index) => (
            <div 
              key={item.name} 
              ref={(el) => { bubbleElementsRef.current[index] = el; }}
              className="aero-water-bubble absolute top-0 left-0"
            >
              <span className="text-xs font-extrabold text-[#003366]/60 tracking-tight">{item.name}</span>
              <span className="text-xl font-black text-[#0066cc] mt-0.5">{item.displayDate}</span>
            </div>
          ))}
        </div>

        {/* 오른쪽: 완벽한 투명 유리 질감으로 변경된 버튼들 */}
        <div className="flex flex-col gap-4 h-[400px]">
          <Link href="/schedule" className="flex-1 flex">
            <button className="w-full flex items-center justify-center text-3xl font-black tracking-wide cursor-pointer bg-white/20 backdrop-blur-md border border-white/60 text-[#003366]/60 rounded-2xl shadow-lg hover:bg-white/40 hover:scale-[1.02] hover:text-[#003366]/80 transition-all duration-300">
              학사일정
            </button>
          </Link>
          <Link href="/eval" className="flex-1 flex">
            <button className="w-full flex items-center justify-center text-3xl font-black tracking-wide cursor-pointer bg-white/20 backdrop-blur-md border border-white/60 text-[#003366]/60 rounded-2xl shadow-lg hover:bg-white/40 hover:scale-[1.02] hover:text-[#003366]/80 transition-all duration-300">
              수행평가
            </button>
          </Link>
          <Link href="/board" className="flex-1 flex">
            <button className="w-full flex items-center justify-center text-3xl font-black tracking-wide cursor-pointer bg-white/20 backdrop-blur-md border border-white/60 text-[#003366]/60 rounded-2xl shadow-lg hover:bg-white/40 hover:scale-[1.02] hover:text-[#003366]/80 transition-all duration-300">
              자유게시판
            </button>
          </Link>
        </div>

      </div>

      {/* 하단: 뮤직 섹션 */}
      <section className="aero-window p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-black text-[#003366] tracking-tight">Music Box</h2>
          {isAdmin && (
            <button 
              onClick={() => setEditMusic(!editMusic)} 
              className="text-xs bg-white/80 border border-sky-300 px-3 py-1 rounded-lg font-bold text-sky-800 hover:bg-white"
            >
              {editMusic ? "Cancel" : "Change Video"}
            </button>
          )}
        </div>

        {editMusic && (
          <div className="flex gap-2 bg-white/60 p-2 rounded-xl border border-white">
            <input 
              type="text" 
              placeholder="Paste YouTube Link..." 
              className="flex-1 bg-white px-3 py-1 text-xs rounded-lg border outline-none"
              value={newMusicInput}
              onChange={(e) => setNewMusicInput(e.target.value)}
            />
            <button onClick={changeMusic} className="bg-sky-600 text-white text-xs px-4 py-1 rounded-lg font-bold">Set</button>
          </div>
        )}

        <div className="w-full rounded-xl overflow-hidden border-2 border-white shadow-md">
          <iframe 
            width="100%" 
            height="220" 
            src={musicUrl} 
            title="Class Video Player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* 고정 하단바 */}
      <footer className="fixed bottom-0 left-0 w-full h-12 bg-white/30 backdrop-blur-lg border-t border-white/80 flex items-center justify-between px-6 z-50">
        <Link href="/">
          <button className="bg-gradient-to-b from-sky-400 to-sky-600 text-white font-black px-6 py-1.5 rounded-xl shadow-md hover:brightness-110 transition text-xs border border-white/40">
            Home
          </button>
        </Link>
        <div className="bg-white/70 px-4 py-1 rounded-xl text-xs font-bold text-sky-900 border border-white shadow-inner">
          {currentTime || "Loading..."}
        </div>
      </footer>

    </main>
  );
}