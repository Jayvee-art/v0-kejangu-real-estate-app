import RealEstateChat from "@/components/real-estate-chat"

export default function ChatDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kejangu Real Estate</h1>
          <p className="text-xl text-gray-600 mb-8">Your AI-powered real estate assistant is ready to help</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Property Search</h3>
              <p className="text-gray-600">Find your perfect home with AI-powered search</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Market Insights</h3>
              <p className="text-gray-600">Get real-time market data and trends</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibent mb-2">Expert Guidance</h3>
              <p className="text-gray-600">24/7 real estate advice and support</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg text-gray-700 mb-4">Click the chat button in the bottom right to get started!</p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">AI Assistant Online</span>
          </div>
        </div>
      </div>

      <RealEstateChat />
    </div>
  )
}
