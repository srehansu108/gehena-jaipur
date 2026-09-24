// client/src/pages/Boutique/JewelleryBoutique.jsx
// Story-driven boutique home page for Gehena Jaipur — PINK ATELIER edition
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const JewelleryBoutique = () => {
  const [chapter, setChapter] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const chapterRefs = useRef([]);

  // ─── Hero parallax on scroll ───
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  // ─── Cursor follow for ACT IV ───
  useEffect(() => {
    const onMove = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ─── Track active chapter ───
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = chapterRefs.current.indexOf(entry.target);
            if (idx !== -1) setChapter(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    chapterRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ─── Ambient particles (pink petals) ───
  const particles = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 3,
        duration: Math.random() * 8 + 5,
        delay: Math.random() * 5,
        rotation: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="relative bg-[#fff5f7] text-[#3a1f2b] overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          AMBIENT PETALS (fixed layer)
      ═══════════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size * 0.7,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 0.7, 0],
              rotate: [p.rotation, p.rotation + 180, p.rotation + 360],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Petal shape — soft pink gradient */}
            <div
              className="w-full h-full rounded-full bg-gradient-to-br from-pink-300 via-rose-300 to-pink-400"
              style={{ borderRadius: '50% 0 50% 50%' }}
            />
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          CHAPTER RAIL (right side)
      ═══════════════════════════════════════════ */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4">
        {['Threshold', 'Vault', 'Hand', 'Heirloom', 'Invitation'].map((name, i) => (
          <button
            key={name}
            onClick={() => {
              chapterRefs.current[i]?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-[10px] tracking-[0.3em] transition-all duration-500 ${
                chapter === i
                  ? 'text-pink-600 opacity-100 font-semibold'
                  : 'text-pink-400/60 opacity-0 group-hover:opacity-100 group-hover:text-pink-500'
              }`}
            >
              {name.toUpperCase()}
            </span>
            <div className="flex items-center">
              <div
                className={`h-px transition-all duration-500 ${
                  chapter === i ? 'w-12 bg-pink-600' : 'w-6 bg-pink-300 group-hover:w-10 group-hover:bg-pink-400'
                }`}
              />
              <div
                className={`ml-1 w-2 h-2 rounded-full transition-all duration-500 ${
                  chapter === i ? 'bg-pink-600 scale-125' : 'bg-pink-300'
                }`}
              />
            </div>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          MINIMAL NAV
      ═══════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-30 py-6 px-6 sm:px-10 flex items-center justify-between bg-gradient-to-b from-white/60 to-transparent backdrop-blur-[2px]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex items-baseline gap-2"
        >
          <span
            className="text-xl tracking-[0.2em] font-light text-[#3a1f2b]"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            GEHENA
          </span>
          <span className="text-[10px] tracking-[0.4em] text-pink-600 font-semibold">
            JAIPUR
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-[11px] tracking-[0.3em] text-[#5a3d4a] hover:text-pink-600 transition-colors font-medium"
        >
          BOOK A VIEWING
        </motion.button>
      </nav>

      {/* ═══════════════════════════════════════════
          ACT I — THE THRESHOLD
      ═══════════════════════════════════════════ */}
      <section
        ref={(el) => {
          heroRef.current = el;
          chapterRefs.current[0] = el;
        }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background layers */}
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
          className="absolute inset-0"
        >
          {/* Blush gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#fff5f7] via-[#fce7f0] to-[#f8d5e3]" />

          {/* Soft radial glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(244,114,182,0.25)_0%,_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(251,207,232,0.35)_0%,_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.6)_0%,_transparent_70%)]" />

          {/* Soft grid */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(219,39,119,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(219,39,119,0.4) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Flowing blobs */}
          <motion.div
            className="absolute top-1/4 -left-32 w-96 h-96 bg-pink-300/40 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-300/30 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, -40, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl">
          {/* Ornamental frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-4">
              <span className="w-20 h-px bg-gradient-to-r from-transparent via-pink-500/60 to-pink-500" />
              <span className="text-pink-500 text-xl">✦</span>
              <span className="w-20 h-px bg-gradient-to-l from-transparent via-pink-500/60 to-pink-500" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-pink-600/90 text-xs tracking-[0.5em] mb-6 font-semibold"
          >
            YOU ARE INVITED TO ENTER
          </motion.p>

          <h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] leading-[0.9] font-light mb-8"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            <motion.span
              className="block text-[#3a1f2b]"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Gehena
            </motion.span>
            <motion.span
              className="block italic bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ backgroundSize: '200% auto' }}
            >
              Jaipur
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.8 }}
            className="text-[#5a3d4a] text-base sm:text-lg italic max-w-xl mx-auto mb-12 leading-relaxed"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            "Not a shop. A quiet room in the Pink City where stones remember
            the hands that shaped them."
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.2 }}
            className="flex items-center justify-center gap-3"
          >
            <span className="w-8 h-px bg-pink-400/60" />
            <span className="text-pink-600/80 text-xs tracking-[0.3em] font-medium">
              SINCE 1962
            </span>
            <span className="w-8 h-px bg-pink-400/60" />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] tracking-[0.4em] text-pink-500/70 font-medium">
            DESCEND
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-pink-500/70 to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          ACT II — THE VAULT
      ═══════════════════════════════════════════ */}
      <section
        ref={(el) => (chapterRefs.current[1] = el)}
        className="relative min-h-screen py-32 px-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff5f7] via-[#fce7f0] to-[#fff5f7]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(236,72,153,0.12),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(217,70,239,0.1),_transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-[10px] tracking-[0.5em] text-pink-600/80 font-semibold">
              CHAPTER II
            </span>
            <h2
              className="text-5xl md:text-7xl font-light text-[#3a1f2b] mt-4 mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              The <span className="italic bg-gradient-to-r from-pink-500 to-fuchsia-500 bg-clip-text text-transparent">Vault</span>
            </h2>
            <p className="text-[#5a3d4a] max-w-2xl mx-auto text-lg italic" style={{ fontFamily: 'Georgia, serif' }}>
              Four stones. Four moods. Each one chosen by hand, cut to reveal
              what light wants to see.
            </p>
          </motion.div>

          {/* Rotating orbit showcase */}
          <div className="relative h-[600px] flex items-center justify-center">
            <motion.div
              className="absolute w-[500px] h-[500px] border border-pink-400/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-8 border border-dashed border-fuchsia-400/30 rounded-full" />
              <div className="absolute inset-20 border border-pink-400/20 rounded-full" />
            </motion.div>

            {[
              { name: 'Rose Quartz', hue: 'from-rose-300 to-pink-500', angle: 0, glyph: '◦' },
              { name: 'Kashmir Sapphire', hue: 'from-indigo-300 to-violet-500', angle: 90, glyph: '◆' },
              { name: 'Jaipur Ruby', hue: 'from-rose-400 to-red-500', angle: 180, glyph: '❖' },
              { name: 'Emerald of Mor Bagh', hue: 'from-emerald-300 to-teal-500', angle: 270, glyph: '✺' },
            ].map((gem, i) => {
              const radius = 250;
              const rad = (gem.angle * Math.PI) / 180;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              return (
                <motion.div
                  key={gem.name}
                  className="absolute"
                  style={{ x, y }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 120 }}
                >
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    }}
                  >
                    <div
                      className={`absolute -inset-8 bg-gradient-to-br ${gem.hue} opacity-40 blur-2xl rounded-full`}
                    />
                    <div className="relative w-32 h-32 rounded-full bg-white/80 backdrop-blur-sm border border-pink-200 flex items-center justify-center shadow-xl">
                      <div className="text-center">
                        <div
                          className={`text-5xl mb-1 bg-gradient-to-br ${gem.hue} bg-clip-text text-transparent`}
                        >
                          {gem.glyph}
                        </div>
                      </div>
                    </div>
                    <motion.p
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] tracking-[0.3em] text-pink-600/70 font-medium"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.15 }}
                    >
                      {gem.name.toUpperCase()}
                    </motion.p>
                  </motion.div>
                </motion.div>
              );
            })}

            <motion.div
              className="relative text-center max-w-xs"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <p className="text-pink-700/90 text-sm italic leading-loose" style={{ fontFamily: 'Georgia, serif' }}>
                Every gem has a story.
                <br />
                Only one will be yours.
              </p>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-pink-700/60 text-sm mt-16 italic"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            The full gemstone library is shared privately, in person.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACT III — THE HAND
      ═══════════════════════════════════════════ */}
      <section
        ref={(el) => (chapterRefs.current[2] = el)}
        className="relative min-h-[200vh] py-32"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff5f7] via-[#fce7f0] to-[#fff5f7]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.1),_transparent_50%)]" />

        <div className="sticky top-0 h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="text-[10px] tracking-[0.5em] text-pink-600/80 font-semibold">
                  CHAPTER III
                </span>
                <h2
                  className="text-5xl md:text-6xl font-light text-[#3a1f2b] mt-4 mb-8 leading-tight"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  The <span className="italic bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Hand</span>
                  <br />
                  that shapes
                </h2>
              </motion.div>

              <div className="space-y-8">
                {[
                  {
                    step: 'I',
                    title: 'Sourcing',
                    body:
                      'Our buyers travel to Ratnapura, Kashmir, and Zambia — meeting cutters whose families have handled rough stones for four generations.',
                  },
                  {
                    step: 'II',
                    title: 'Drawing',
                    body:
                      'Every design begins on paper, in pencil. Our head designer studies your story before drawing a single line.',
                  },
                  {
                    step: 'III',
                    title: 'Setting',
                    body:
                      'Kundan setting is done by hand — each uncut diamond is pressed into pure gold, one at a time, over weeks.',
                  },
                  {
                    step: 'IV',
                    title: 'Finishing',
                    body:
                      'The final polish takes 40 hours. It is the moment the piece becomes an heirloom.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="flex gap-5 group"
                  >
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-full border-2 border-pink-400/60 bg-white/70 flex items-center justify-center text-pink-600 text-sm font-semibold group-hover:bg-pink-100 transition-colors shadow-sm">
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h3
                        className="text-xl text-[#3a1f2b] mb-2 font-semibold"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[#5a3d4a]/90 text-sm leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: visual craft diagram */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-pink-400/30"
                    style={{ inset: `${i * 40}px` }}
                    animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                    transition={{
                      duration: 40 + i * 15,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    {Array.from({ length: 12 - i * 2 }).map((_, j) => {
                      const angle = (j / (12 - i * 2)) * 360;
                      const rad = (angle * Math.PI) / 180;
                      return (
                        <div
                          key={j}
                          className="absolute w-1.5 h-1.5 rounded-full bg-pink-500/70"
                          style={{
                            left: `calc(50% + ${Math.cos(rad) * (50 - i * 10)}%)`,
                            top: `calc(50% + ${Math.sin(rad) * (50 - i * 10)}%)`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      );
                    })}
                  </motion.div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="text-8xl"
                  >
                    <span className="bg-gradient-to-br from-pink-500 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
                      ✦
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACT IV — THE HEIRLOOM
      ═══════════════════════════════════════════ */}
      <section
        ref={(el) => (chapterRefs.current[3] = el)}
        className="relative py-32 px-6 overflow-hidden min-h-screen flex items-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#fce7f0] via-[#fff5f7] to-[#f8d5e3]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(236,72,153,0.15),_transparent_50%)]" />

        {/* Cursor-follow glow */}
        <motion.div
          className="pointer-events-none fixed w-64 h-64 rounded-full bg-pink-400/20 blur-3xl z-0 hidden lg:block"
          animate={{
            x: cursor.x - 128,
            y: cursor.y - 128,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20, mass: 0.5 }}
        />

        <div className="relative max-w-6xl mx-auto z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-[10px] tracking-[0.5em] text-pink-600/80 font-semibold">
              CHAPTER IV
            </span>
            <h2
              className="text-5xl md:text-7xl font-light text-[#3a1f2b] mt-4 mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              The <span className="italic bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Heirloom</span>
            </h2>
            <p className="text-[#5a3d4a] max-w-2xl mx-auto italic" style={{ fontFamily: 'Georgia, serif' }}>
              Some pieces are bought. Some are inherited. The lucky ones are both.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {[
                {
                  year: '1978',
                  title: 'The First Commission',
                  body:
                    'A Jaipur princess asked our founder to design her daughter\'s wedding set. It took 11 months. It was worth every day.',
                  rotate: -2,
                },
                {
                  year: '2004',
                  title: 'Returned to Us',
                  body:
                    'That same set came back for restoration. Two generations had worn it. We added nothing. We only polished.',
                  rotate: 1,
                },
                {
                  year: '2024',
                  title: 'Handed Forward',
                  body:
                    'Today it lives with the granddaughter — who now commissions her own pieces. The circle continues.',
                  rotate: -1,
                },
              ].map((card, i) => (
                <motion.div
                  key={card.year}
                  initial={{ opacity: 0, y: 60, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate: card.rotate }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.2 }}
                  whileHover={{ y: -12, rotate: 0, scale: 1.02 }}
                  className="relative p-8 rounded-3xl bg-white/90 backdrop-blur-sm shadow-xl border-2 border-pink-100"
                >
                  {/* Vintage stamp corner */}
                  <div className="absolute top-4 right-4 w-12 h-14 border-2 border-dashed border-pink-400/40 rounded-sm flex items-center justify-center bg-pink-50/50">
                    <span className="text-[8px] text-pink-600/70 tracking-wider font-semibold">1962</span>
                  </div>

                  {/* Postmark circle */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full border-2 border-pink-400/40 flex items-center justify-center bg-pink-50/50">
                    <span className="text-[8px] text-pink-600/70 font-semibold">JAIPUR</span>
                  </div>

                  <div className="mt-12">
                    <p
                      className="text-5xl font-light bg-gradient-to-br from-pink-400 to-fuchsia-500 bg-clip-text text-transparent mb-3"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {card.year}
                    </p>
                    <h3
                      className="text-xl text-[#3a1f2b] mb-3 font-semibold"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#5a3d4a]/90 leading-relaxed">
                      {card.body}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <span className="w-6 h-px bg-pink-400/60" />
                    <span className="text-pink-500 text-xs">✦</span>
                    <span className="flex-1 h-px bg-pink-300/50" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-center text-[#5a3d4a]/70 italic text-sm mt-20 max-w-xl mx-auto"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            We do not sell jewellery. We make objects that outlive their owners.
          </motion.p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ACT V — THE INVITATION
      ═══════════════════════════════════════════ */}
      <section
        ref={(el) => (chapterRefs.current[4] = el)}
        className="relative min-h-screen flex items-center justify-center px-6 py-32"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff5f7] via-[#fce7f0] to-[#fff5f7]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(236,72,153,0.15),_transparent_60%)]" />

        <div className="absolute top-12 left-12 w-16 h-16 border-l-2 border-t-2 border-pink-400/40 rounded-tl-3xl" />
        <div className="absolute top-12 right-12 w-16 h-16 border-r-2 border-t-2 border-pink-400/40 rounded-tr-3xl" />
        <div className="absolute bottom-12 left-12 w-16 h-16 border-l-2 border-b-2 border-pink-400/40 rounded-bl-3xl" />
                <div className="absolute bottom-12 right-12 w-16 h-16 border-r-2 border-b-2 border-pink-400/40 rounded-br-3xl" />

        <div className="relative text-center max-w-3xl z-20">
          {/* Ornament */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-10 flex justify-center"
          >
            <div className="relative">
              <motion.div
                className="w-24 h-24 rounded-full border-2 border-pink-400/50"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-3 rounded-full border border-fuchsia-400/40"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl bg-gradient-to-br from-pink-500 to-fuchsia-500 bg-clip-text text-transparent">
                  ✦
                </span>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] tracking-[0.5em] text-pink-600/80 mb-6 font-semibold"
          >
            THE INVITATION
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-[#3a1f2b] leading-tight mb-8"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Come see us
            <br />
            <span className="italic bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
              in person
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-[#5a3d4a] text-lg italic max-w-xl mx-auto mb-12 leading-relaxed"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            We don't do online carts, express shipping, or seasonal sales. We
            do tea, conversation, and stones that wait for the right person.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <motion.a
              href="#book"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-4 text-white overflow-hidden rounded-full shadow-lg shadow-pink-300/40 hover:shadow-2xl hover:shadow-pink-400/50 transition-shadow"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500" />
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-pink-500"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              <span className="relative flex items-center gap-3 text-sm tracking-[0.2em] font-semibold">
                BOOK A PRIVATE VIEWING
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.a>

            <motion.a
              href="#visit"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="text-[#5a3d4a] hover:text-pink-600 text-sm tracking-[0.2em] transition-colors px-6 py-4 font-semibold"
            >
              VISIT THE ATELIER
            </motion.a>
          </motion.div>

          {/* Atelier details */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 pt-10 border-t border-pink-200/60 max-w-lg mx-auto"
          >
            <div className="grid grid-cols-2 gap-8 text-left">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-pink-600/80 mb-2 font-semibold">
                  ATELIER
                </p>
                <p className="text-[#5a3d4a] text-sm leading-relaxed">
                  24, Johari Bazaar
                  <br />
                  Near Hawa Mahal
                  <br />
                  Jaipur 302003
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.3em] text-pink-600/80 mb-2 font-semibold">
                  HOURS
                </p>
                <p className="text-[#5a3d4a] text-sm leading-relaxed">
                  Mon – Sat
                  <br />
                  10:30 – 19:00
                  <br />
                  By appointment only
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CLOSING FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="relative py-12 px-6 border-t border-pink-200/60 bg-[#fce7f0]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-baseline gap-2">
            <span
              className="text-sm tracking-[0.2em] text-[#3a1f2b]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              GEHENA
            </span>
            <span className="text-[9px] tracking-[0.4em] text-pink-600/80 font-semibold">
              JAIPUR
            </span>
          </div>

          <p className="text-pink-700/70 text-[10px] tracking-[0.3em] text-center font-medium">
            ✦ &nbsp; SIXTY-TWO YEARS OF QUIET CRAFT &nbsp; ✦
          </p>

          <div className="flex items-center gap-6 text-[#5a3d4a]/70 text-[10px] tracking-[0.2em]">
            <button className="hover:text-pink-600 transition-colors font-medium">
              INSTAGRAM
            </button>
            <button className="hover:text-pink-600 transition-colors font-medium">
              CONTACT
            </button>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════
          GLOBAL STYLES
      ═══════════════════════════════════════════ */}
      <style>{`
        html { scroll-behavior: smooth; }
        body { background: #fff5f7; }
        ::selection { background: rgba(236, 72, 153, 0.25); color: #3a1f2b; }
      `}</style>
    </div>
  );
};

export default JewelleryBoutique;