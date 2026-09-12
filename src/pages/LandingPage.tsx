import { ArrowRight, Check, ChevronDown, CircleAlert, HeartHandshake, Menu, MessageCircle, Radio, ShieldCheck, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const heroImage = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1800&q=85";
const communityImage = "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1000&q=85";

const steps = [
  { number: "01", title: "Listen across channels", text: "Meet people where access is possible: web, chat, assisted support, and low-bandwidth pathways." },
  { number: "02", title: "Read the signals", text: "Combine check-ins, behavioural patterns, and cognitive indicators into a clear wellbeing picture." },
  { number: "03", title: "Keep humans in the loop", text: "Give practitioners context, confidence, and reasons so every escalation stays accountable." },
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f6f1] text-[#1b2f28]">
      <header className="absolute left-0 right-0 top-0 z-30 px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/35 bg-[#1b2f28]/85 px-5 py-3 text-white shadow-lg shadow-[#1b2f28]/10 backdrop-blur-md">
          <a href="#top" className="flex items-center gap-2 text-lg font-semibold tracking-tight"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c3dfc8] text-sm text-[#1b2f28]">M</span> MindLink</a>
          <nav className="hidden items-center gap-7 text-sm text-white/75 md:flex" aria-label="Landing page navigation">
            <a href="#approach" className="transition hover:text-white">Our approach</a>
            <a href="#channels" className="transition hover:text-white">Access channels</a>
            <a href="#research" className="transition hover:text-white">For research</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex"><Link to="/login" className="px-3 py-2 text-sm text-white/80 transition hover:text-white">Sign in</Link><Link to="/signup" className="rounded-full bg-[#c3dfc8] px-4 py-2 text-sm font-semibold text-[#1b2f28] transition hover:bg-white">Get started <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full p-2 md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {menuOpen && <div className="mx-auto mt-2 max-w-7xl rounded-2xl bg-[#1b2f28] p-5 text-white md:hidden"><div className="flex flex-col gap-4 text-sm"><a href="#approach" onClick={() => setMenuOpen(false)}>Our approach</a><a href="#channels" onClick={() => setMenuOpen(false)}>Access channels</a><a href="#research" onClick={() => setMenuOpen(false)}>For research</a><div className="flex gap-3 border-t border-white/15 pt-4"><Link to="/login">Sign in</Link><Link to="/signup" className="font-semibold text-[#c3dfc8]">Get started <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div></div></div>}
      </header>

      <main id="top">
        <section className="relative min-h-[760px] overflow-hidden bg-[#1b2f28] text-white sm:min-h-[820px]">
          <img src={heroImage} alt="Person sitting quietly in a sunlit natural setting" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,43,35,0.98)_0%,rgba(20,43,35,0.78)_43%,rgba(20,43,35,0.18)_100%)]" />
          <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-[#f4f6f1] to-transparent" />
          <div className="relative mx-auto flex min-h-[760px] max-w-7xl items-center px-6 pb-28 pt-36 sm:min-h-[820px] sm:px-10 lg:px-12">
            <div className="max-w-3xl animate-[fade-up_0.9s_ease-out_both]">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#c3dfc8]/35 bg-[#c3dfc8]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#c3dfc8]"><Sparkles className="h-3.5 w-3.5" /> Thesis research prototype</div>
              <h1 className="max-w-4xl font-serif text-5xl leading-[0.96] tracking-[-0.03em] sm:text-7xl lg:text-[88px]">Care begins with being heard.</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">MindLink is an explainable, multi-channel mental health triage system designed for low-resource environments and the people who care within them.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4"><Link to="/signup" className="rounded-full bg-[#c3dfc8] px-6 py-3.5 text-sm font-bold text-[#1b2f28] shadow-lg shadow-[#102a20]/25 transition hover:-translate-y-0.5 hover:bg-white">Explore MindLink <ArrowRight className="ml-2 inline h-4 w-4" /></Link><a href="#approach" className="rounded-full border border-white/35 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">See how it works <ChevronDown className="ml-2 inline h-4 w-4" /></a></div>
              <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-xs text-white/60"><span><Check className="mr-1 inline h-3.5 w-3.5 text-[#c3dfc8]" /> Human-reviewed signals</span><span><Check className="mr-1 inline h-3.5 w-3.5 text-[#c3dfc8]" /> Built for limited connectivity</span><span><Check className="mr-1 inline h-3.5 w-3.5 text-[#c3dfc8]" /> No diagnosis by automation</span></div>
            </div>
          </div>
        </section>

        <section id="approach" className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5b2d]">The problem we are solving</p><h2 className="mt-4 max-w-md font-serif text-4xl leading-tight sm:text-5xl">A first step toward earlier, kinder support.</h2></div><div><p className="max-w-2xl text-lg leading-8 text-[#53675d]">When access to mental health care is limited, the first signal can be the most important one. MindLink helps communities notice patterns earlier, understand what they mean, and connect people to appropriate human support.</p><div className="mt-12 grid gap-8 sm:grid-cols-3">{steps.map((step) => <div key={step.number} className="border-t border-[#cbd8ce] pt-4 transition hover:-translate-y-1"><span className="font-mono text-xs text-[#9a5b2d]">{step.number}</span><h3 className="mt-7 text-lg font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-[#718279]">{step.text}</p></div>)}</div></div></div>
        </section>

        <section id="channels" className="bg-[#e6eee8] px-6 py-24 sm:px-10 lg:px-12 lg:py-32"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3f568e]">Designed around reality</p><h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">One system. More than one way in.</h2></div><p className="max-w-sm text-sm leading-6 text-[#61746a]">A useful tool should adapt to the available device, data, language, and support network.</p></div><div className="mt-14 grid gap-4 md:grid-cols-3"><article className="group rounded-[26px] bg-[#1b2f28] p-7 text-white transition duration-500 hover:-translate-y-2"><MessageCircle className="h-7 w-7 text-[#c3dfc8]" /><h3 className="mt-20 text-2xl font-serif">Conversation</h3><p className="mt-3 text-sm leading-6 text-white/65">Private chat and guided reflection turn everyday language into a safer starting point.</p></article><article className="group rounded-[26px] bg-[#f6eadf] p-7 text-[#1b2f28] transition duration-500 hover:-translate-y-2"><Radio className="h-7 w-7 text-[#9a5b2d]" /><h3 className="mt-20 text-2xl font-serif">Low-bandwidth access</h3><p className="mt-3 text-sm leading-6 text-[#61746a]">A pathway for communities where connectivity is intermittent, shared, or expensive.</p></article><article className="group rounded-[26px] bg-white p-7 text-[#1b2f28] transition duration-500 hover:-translate-y-2"><HeartHandshake className="h-7 w-7 text-[#3f568e]" /><h3 className="mt-20 text-2xl font-serif">Human support</h3><p className="mt-3 text-sm leading-6 text-[#61746a]">Practitioners and volunteers receive explainable context, not an opaque score.</p></article></div></div></section>

        <section id="research" className="mx-auto grid max-w-7xl gap-12 px-6 py-24 sm:px-10 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-24 lg:px-12 lg:py-32"><div className="relative"><img src={communityImage} alt="People sharing a calm moment together" className="h-[470px] w-full rounded-[30px] object-cover shadow-xl shadow-[#1b2f28]/10" /><div className="absolute -bottom-6 -right-3 max-w-xs rounded-2xl bg-[#1b2f28] p-5 text-white shadow-xl sm:-right-8"><ShieldCheck className="h-5 w-5 text-[#c3dfc8]" /><p className="mt-3 text-sm leading-6 text-white/75">Transparency is a care feature. Every triage signal should invite review, not replace it.</p></div></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a5b2d]">A research-led approach</p><h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Explainability belongs in the experience.</h2><p className="mt-6 text-base leading-7 text-[#61746a]">MindLink makes its reasoning visible: signals are contextual, confidence is explicit, and the final decision stays with a trained human. That is how technology can extend scarce capacity without pretending to be care itself.</p><div className="mt-8 space-y-4 text-sm font-semibold text-[#1b2f28]"><div><CircleAlert className="mr-3 inline h-5 w-5 text-[#d97263]" /> Risk levels are prompts for attention, never labels.</div><div><ShieldCheck className="mr-3 inline h-5 w-5 text-[#78b98a]" /> Consent and emergency contact choices stay visible.</div><div><HeartHandshake className="mr-3 inline h-5 w-5 text-[#3f568e]" /> Support pathways connect people to people.</div></div></div></section>

        <section className="px-6 pb-24 sm:px-10 lg:px-12"><div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#1b2f28] px-7 py-14 text-center text-white sm:px-12 sm:py-20"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c3dfc8]">Start with one honest check-in</p><h2 className="mx-auto mt-5 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">Small signals can open better conversations.</h2><p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/65">Explore the MindLink prototype and see how an explainable triage journey feels from the inside.</p><div className="mt-8"><Link to="/signup" className="rounded-full bg-[#c3dfc8] px-6 py-3.5 text-sm font-bold text-[#1b2f28] transition hover:bg-white">Enter the prototype <ArrowRight className="ml-2 inline h-4 w-4" /></Link></div></div></section>
      </main>

      <footer className="border-t border-[#dbe5dc] px-6 py-8 sm:px-10 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-[#718279] sm:flex-row sm:items-center sm:justify-between"><span className="font-semibold text-[#1b2f28]">MindLink</span><span>Thesis research prototype · Explainable mental health triage for low-resource environments</span><span>© 2026 MindLink</span></div></footer>
    </div>
  );
}
