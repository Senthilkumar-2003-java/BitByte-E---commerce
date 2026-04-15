import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const layers = document.querySelectorAll(".parallax-layer");

      const x = (window.innerWidth - e.pageX * 2) / 100;
      const y = (window.innerHeight - e.pageY * 2) / 100;

      layers.forEach((layer, index) => {
        const speed = (index + 1) * 0.12;

        layer.style.transform = `translate3d(${x * speed}px, ${
          y * speed
        }px, 0)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0f14] text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-5 backdrop-blur-xl">
        <h1 className="text-cyan-400 font-black text-xl uppercase tracking-wider">
          Bit Byte Technology
        </h1>

        <div className="hidden md:flex gap-8 text-gray-400 uppercase text-sm">
          <a href="#">Solutions</a>
          <a href="#">Innovations</a>
          <a href="#">Ecosystem</a>
          <a href="#">Mission</a>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 border border-cyan-300/20 rounded-full text-cyan-300"
        >
          Access
        </button>
      </nav>

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-400/10 blur-[120px] rounded-full"></div>

      {/* PARALLAX ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none">

        <div className="parallax-layer absolute top-[20%] left-[10%] animate-float">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-xl w-52 h-32 border border-cyan-300/10"></div>
        </div>

        <div className="parallax-layer absolute bottom-[20%] left-[15%] animate-float">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-green-400 blur-sm"></div>
        </div>

        <div className="parallax-layer absolute top-[15%] right-[20%] animate-spin-slow">
          <div className="w-40 h-40 border border-cyan-300/20 rounded-full"></div>
        </div>

        <div className="parallax-layer absolute bottom-[20%] right-[10%] animate-float">
          <div className="bg-white/5 backdrop-blur-xl px-5 py-3 rounded-lg border border-cyan-300/10">
            Neural Core
          </div>
        </div>

      </div>

      {/* HERO */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        
        <h1 className="text-5xl md:text-7xl font-black uppercase bg-gradient-to-r from-cyan-300 via-green-300 to-cyan-300 text-transparent bg-clip-text mb-6">
          Future of Shopping
        </h1>

        <p className="text-gray-400 max-w-xl mb-10">
          Experience next-gen commerce powered by Bit Byte Technology.
        </p>

        <div className="flex gap-6 flex-wrap justify-center">
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-gradient-to-r from-cyan-300 to-green-300 rounded-full text-black font-bold"
          >
            Start Now
          </button>

          <button className="px-8 py-3 border border-gray-500 rounded-full">
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}