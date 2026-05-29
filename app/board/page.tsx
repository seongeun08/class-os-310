"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// 1️⃣ Supabase 창고와 연결하는 열쇠 장착!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Comment {
  id: number;
  author: string;
  text: string;
  img?: string | null;
}

interface Post {
  id: number;
  author: string;
  title: string;
  content: string;
  img?: string | null;
  comments: Comment[];
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postImg, setPostImg] = useState("");
  
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [commentAuth, setCommentAuth] = useState<{[key: number]: string}>({});
  const [commentText, setCommentText] = useState<{[key: number]: string}>({});
  const [commentImg, setCommentImg] = useState<{[key: number]: string}>({});

  const [currentTime, setCurrentTime] = useState("");

  // 2️⃣ Supabase에서 작성된 글 목록 불러오기
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("id", { ascending: false }); // 최신 글이 위로 오도록 정렬

    if (error) {
      console.error("데이터를 불러오지 못했습니다:", error);
    } else {
      setPosts(data || []);
    }
  };

  useEffect(() => {
    fetchPosts(); // 페이지가 열리면 즉시 데이터 가져오기

    const adminStatus = localStorage.getItem("class_admin") === "true";
    setIsAdmin(adminStatus);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleImgConvert = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 3️⃣ 새 글 작성해서 Supabase로 전송하기
  const handleCreatePost = async () => {
    if (!author.trim() || !title.trim() || !content.trim()) return alert("모든 칸을 채워주세요.");
    
    const newPost = {
      id: Date.now(), // 고유 번호
      author: author.trim(),
      title,
      content,
      img: postImg || null,
      comments: []
    };

    // Supabase의 'posts' 표에 새 데이터 넣기
    const { error } = await supabase.from("posts").insert([newPost]);

    if (error) {
      alert("글 업로드 중 오류가 발생했습니다 😭");
      console.error(error);
    } else {
      setPosts([newPost, ...posts]); // 화면에도 즉시 반영
      setAuthor(""); setTitle(""); setContent(""); setPostImg(""); // 입력창 초기화
    }
  };

  // 4️⃣ 관리자 권한으로 글 삭제하기 (Supabase에서도 삭제)
  const handleDeletePost = async (postId: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;
    
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert("글 삭제 중 오류가 발생했습니다 😭");
      console.error(error);
    } else {
      setPosts(posts.filter(p => p.id !== postId)); // 화면에서도 즉시 지우기
    }
  };

  // 5️⃣ 댓글 작성해서 Supabase 업데이트하기
  const handleAddComment = async (postId: number) => {
    const cAuth = commentAuth[postId]?.trim() || "익명";
    const cText = commentText[postId]?.trim();
    if (!cText) return alert("댓글 내용을 작성하세요.");

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    const newComment = {
      id: Date.now(),
      author: cAuth,
      text: cText,
      img: commentImg[postId] || null
    };

    // 기존 댓글 배열에 새 댓글 추가
    const updatedComments = [...(targetPost.comments || []), newComment];

    // Supabase의 해당 글(postId) 댓글 항목만 쏙 업데이트
    const { error } = await supabase
      .from("posts")
      .update({ comments: updatedComments })
      .eq("id", postId);

    if (error) {
      alert("댓글 작성 중 오류가 발생했습니다 😭");
      console.error(error);
    } else {
      // 화면 업데이트 및 입력창 초기화
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
      setCommentAuth(prev => ({ ...prev, [postId]: "" }));
      setCommentText(prev => ({ ...prev, [postId]: "" }));
      setCommentImg(prev => ({ ...prev, [postId]: "" }));
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex justify-between items-center aero-window p-6">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">자유게시판</h1>
          <p className="text-xs font-bold text-sky-800/80 mt-0.5">
            {isAdmin ? "Admin Mode" : "View&Post Mode"}
          </p>
        </div>
      </header>

      {/* 새 포스트 작성 창 */}
      <section className="aero-window p-5 space-y-3 bg-white/30">
        <h3 className="text-sm font-black text-[#003366]">게시글 작성</h3>
        <div className="grid grid-cols-2 gap-3">
          <input 
            type="text" 
            placeholder="닉네임" 
            className="bg-white px-3 py-2 rounded-xl text-xs border outline-none shadow-inner"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="글 제목" 
            className="bg-white px-3 py-2 rounded-xl text-xs border outline-none shadow-inner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <textarea 
          placeholder="소통할 내용을 자유롭게 타이핑하세요..." 
          className="w-full h-20 bg-white p-3 rounded-xl text-xs border outline-none shadow-inner resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
            <span>Add Photo:</span>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImgConvert(e.target.files[0], setPostImg)} />
          </div>
          <button onClick={handleCreatePost} className="bg-sky-600 text-white text-xs font-black px-6 py-2 rounded-xl shadow-md">
            Submit Post
          </button>
        </div>
        {postImg && <img src={postImg} alt="업로드 피드" className="h-16 rounded border" />}
      </section>

      {/* 글 피드 스트림 */}
      <section className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="aero-window p-5 space-y-4 bg-white/40">
            <div className="flex justify-between border-b border-white/60 pb-2 items-center">
              <div className="flex items-center gap-3">
                <span className="font-black text-base text-sky-900">{post.title}</span>
                {isAdmin && (
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="text-[10px] bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white px-2 py-0.5 rounded-md font-bold transition-all duration-200 border border-red-500/20"
                  >
                    삭제
                  </button>
                )}
              </div>
              <span className="text-xs bg-sky-100 text-sky-800 font-extrabold px-2.5 py-0.5 rounded-full">{post.author}</span>
            </div>
            
            <p className="text-xs text-[#003366] leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.img && <img src={post.img} alt="본문 이미지" className="max-h-60 rounded-xl border object-contain shadow-sm" />}

            {/* 댓글 리스트 */}
            <div className="bg-white/30 p-3 rounded-2xl space-y-2 border border-white/40">
              <h4 className="text-xs font-extrabold text-[#003366]/70 mb-2">Replies</h4>
              {(post.comments || []).map(c => (
                <div key={c.id} className="text-xs border-b border-gray-200/40 pb-2 last:border-none">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sky-700">{c.author}</span>
                    <p className="text-gray-800">{c.text}</p>
                  </div>
                  {c.img && <img src={c.img} alt="댓글 이미지" className="h-20 rounded border mt-1" />}
                </div>
              ))}

              {/* 댓글 쓰기 인터페이스 */}
              <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-white/60">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="닉네임" 
                    className="w-24 bg-white px-2 py-1.5 rounded-lg text-[11px] border outline-none"
                    value={commentAuth[post.id] || ""}
                    onChange={(e) => setCommentAuth({...commentAuth, [post.id]: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="댓글을 입력하세요..." 
                    className="flex-1 bg-white px-3 py-1.5 rounded-lg text-[11px] border outline-none"
                    value={commentText[post.id] || ""}
                    onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                  />
                  <button onClick={() => handleAddComment(post.id)} className="bg-sky-500 text-white text-[11px] font-bold px-4 rounded-lg">Write</button>
                </div>
                <div className="text-[10px] flex items-center gap-1 font-bold text-sky-800">
                  <span>Add Photo:</span>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImgConvert(e.target.files[0], (base64) => setCommentImg({...commentImg, [post.id]: base64}))} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <footer className="fixed bottom-0 left-0 w-full h-12 bg-white/30 backdrop-blur-lg border-t border-white/80 flex items-center justify-between px-6 z-50">
        <Link href="/"><button className="bg-gradient-to-b from-sky-400 to-sky-600 text-white font-black px-6 py-1.5 rounded-xl shadow-md text-xs border border-white/40">Home</button></Link>
        <div className="bg-white/70 px-4 py-1 rounded-xl text-xs font-bold text-sky-900 border border-white">{currentTime || "Loading..."}</div>
      </footer>
    </main>
  );
}