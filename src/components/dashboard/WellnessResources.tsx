export function WellnessResources() {
  return (
    <section>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          Take a moment to breathe and reconnect with yourself.
        </h3>
        <button className="text-purple-600 font-medium hover:text-purple-700 text-sm sm:text-base">
          View all
        </button>
      </div>
      <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="relative">
          <div className="w-full h-64 relative overflow-hidden">
            <img
              src="/breath.jpg"
              alt="Breathing exercise"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-purple-600/40 flex items-center justify-center">
              <div className="relative z-10 w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors cursor-pointer">
                <span className="text-3xl text-purple-600 ml-1">▶</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-600">Let go of tension and find calm within.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

