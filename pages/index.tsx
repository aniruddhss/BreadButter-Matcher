import { useState } from "react";
import { FormEvent, ChangeEvent } from "react";

interface Match {
  id?: string;
  name: string;
  city: string;
  budget_min: number;
  budget_max: number;
  finalScore: number;
  vectorScore: number;
  ruleScore: number;
  reasons: string[];
}

export default function Home() {
  const [form, setForm] = useState({
    text: "",
    location: "",
    budget: "",
    style_tags: "",
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMatches([]);
    
    try {
      if (!form.text || !form.location || !form.budget || !form.style_tags) {
        throw new Error('Please fill in all fields');
      }

      const budget = parseInt(form.budget);
      if (isNaN(budget) || budget <= 0) {
        throw new Error('Please enter a valid budget amount');
      }

      const style_tags = form.style_tags.split(",").map((tag: string) => tag.trim()).filter(Boolean);
      if (style_tags.length === 0) {
        throw new Error('Please enter at least one style tag');
      }

      console.log('Submitting form:', { ...form, budget, style_tags });
      
      const res = await fetch("/api/submitBrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: form.text,
          location: form.location,
          budget,
          style_tags,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.matches || !Array.isArray(data.matches)) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Received matches:', data.matches);
      setMatches(data.matches);
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981'; // green
    if (score >= 6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            BreadButter Matcher
          </h1>
          <p className="text-gray-600">
            Submit your creative brief and find the perfect talent matches
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief Description
              </label>
              <textarea
                name="text"
                placeholder="Describe your creative project needs..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                value={form.text}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  name="location"
                  placeholder="e.g., Mumbai, Delhi"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (₹)
                </label>
                <input
                  name="budget"
                  placeholder="50000"
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.budget}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style Tags
                </label>
                <input
                  name="style_tags"
                  placeholder="modern, minimalist, bold"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.style_tags}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding Matches...
                </>
              ) : (
                'Find Talent Matches'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {matches.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Top Talent Matches ({matches.length})
            </h2>
            
            <div className="space-y-4">
              {matches.map((match: Match, idx: number) => (
                <div 
                  key={match.id || idx} 
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {match.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: getScoreColor(match.finalScore) }}
                      >
                        Score: {match.finalScore}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>{match.city}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                      <span>{formatCurrency(match.budget_min)} - {formatCurrency(match.budget_max)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      Vector: {match.vectorScore.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      Rules: {match.ruleScore}
                    </span>
                  </div>

                  {match.reasons.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500 mb-2">Match Reasons:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.reasons.map((reason, reasonIdx) => (
                          <span 
                            key={reasonIdx}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {!loading && matches.length === 0 && form.text && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">No matches found</h3>
            <p className="text-yellow-700">
              Try adjusting your location, budget, or style preferences to find more talents.
            </p>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-indigo-100 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Technical Architecture
            </span>
          </h2>

          {/* Architecture Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-800">Machine Learning Pipeline</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Language Model</h4>
                  <p className="text-gray-600">Powered by BAAI/bge-small-en-v1.5, a state-of-the-art embedding model optimized for semantic search, generating dense vector embeddings with 384 dimensions.</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-indigo-800 mb-2">Vector Search</h4>
                  <p className="text-gray-600">Implements in-memory cosine similarity computation for precise vector matching, with calculated similarity scores ranging from -1 to 1.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-purple-800 mb-2">Scoring Algorithm</h4>
                  <p className="text-gray-600">Hybrid scoring system combining vector similarity (multiplied by 10) with rule-based points (location: 2, budget: 3, style: 3) for comprehensive matching.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="ml-4 text-2xl font-bold text-gray-800">Tech Infrastructure</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Frontend Stack</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Next.js 15.4 with SSR optimization
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      React 19.1 with TypeScript for type safety
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      TailwindCSS with custom design system
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Backend Architecture</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Supabase with pgvector extension
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Serverless API with edge computing
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      Real-time WebSocket connections
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Process Flow */}
          <div className="bg-white rounded-xl shadow-xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Technical Process Flow
            </h3>
            <div className="space-y-8">
              <div className="relative pl-8 pb-8 border-l-2 border-blue-200">
                <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
                <h4 className="text-xl font-bold text-blue-800 mb-2">Brief Vectorization</h4>
                <p className="text-gray-600 mb-3">Your creative brief is transformed into a dense vector representation using BGE:</p>
                <div className="bg-gray-800 text-blue-300 rounded-lg p-4 font-mono text-sm">
                  brief → BGE → [0.123, -0.456, ..., 0.789] <span className="text-gray-500">// 384-dimensional vector</span>
                </div>
              </div>
              
              <div className="relative pl-8 pb-8 border-l-2 border-blue-200">
                <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
                <h4 className="text-xl font-bold text-blue-800 mb-2">Semantic Search</h4>
                <p className="text-gray-600 mb-3">Vector similarity search using cosine distance in PostgreSQL:</p>
                <div className="bg-gray-800 text-green-300 rounded-lg p-4 font-mono text-sm">
                  SELECT *, (1 - (embedding &lt;=&gt; query_vector)) as similarity<br/>
                  FROM talents<br/>
                  ORDER BY similarity DESC<br/>
                  LIMIT 50;
                </div>
              </div>

              <div className="relative pl-8 pb-8 border-l-2 border-blue-200">
                <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
                <h4 className="text-xl font-bold text-blue-800 mb-2">Rule-Based Filtering</h4>
                <p className="text-gray-600 mb-3">Multi-criteria matching system:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Location Match</h5>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Budget Alignment</h5>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">Style Compatibility</h5>
                  </div>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
                <h4 className="text-xl font-bold text-blue-800 mb-2">Final Score Computation</h4>
                <p className="text-gray-600 mb-3">Weighted scoring formula:</p>
                <div className="bg-gray-800 text-purple-300 rounded-lg p-4 font-mono text-sm">
                  finalScore = (<br/>
                  &nbsp;&nbsp;0.7 * vectorScore +<br/>
                  &nbsp;&nbsp;0.15 * locationScore +<br/>
                  &nbsp;&nbsp;0.1 * budgetScore +<br/>
                  &nbsp;&nbsp;0.05 * styleScore<br/>
                  ) * 10;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
