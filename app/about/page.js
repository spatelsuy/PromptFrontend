export default function AboutPrompts() {
  const promptCategories = [
    {
      category: "By Complexity Level",
      types: [
        {
          name: "Zero-Shot Prompts",
          description: "Single instruction without examples",
          example: "Explain quantum computing in simple terms.",
          useCase: "Basic queries, simple tasks",
          tip: "Be clear and specific in your instruction"
        },
        {
          name: "Few-Shot Prompts",
          description: "Instruction with examples for pattern recognition",
          example: "Translate to French:\nHello → Bonjour\nGood morning → Bonjour\nHow are you? → Comment allez-vous?",
          useCase: "Teaching patterns, style transfer",
          tip: "Provide 3-5 diverse examples for best results"
        },
        {
          name: "Chain-of-Thought (CoT)",
          description: "Step-by-step reasoning process",
          example: "Q: A farmer has 15 apples and gives 7 to neighbors. He buys 12 more. How many does he have?\nA: Let's think step by step...",
          useCase: "Complex reasoning, math problems",
          tip: "Use 'Let's think step by step' for better reasoning"
        }
      ]
    },
    {
      category: "By Function",
      types: [
        {
          name: "Instructional Prompts",
          description: "Direct commands to perform specific tasks",
          example: "Write a Python function to calculate factorial.",
          useCase: "Code generation, content creation",
          tip: "Be explicit about format and requirements"
        },
        {
          name: "Role-Playing Prompts",
          description: "Assign a specific role to the AI",
          example: "Act as a senior software engineer. Review this code...",
          useCase: "Expert advice, creative writing",
          tip: "Define role clearly with context and constraints"
        },
        {
          name: "Contextual Prompts",
          description: "Provide background information first",
          example: "Context: I'm writing a blog about healthy eating.\nWrite an introduction about Mediterranean diet benefits.",
          useCase: "Content with specific context",
          tip: "Separate context from instruction clearly"
        }
      ]
    },
    {
      category: "Advanced Techniques",
      types: [
        {
          name: "Tree-of-Thoughts",
          description: "Explore multiple reasoning paths",
          example: "Consider different approaches to solve this problem and choose the best one.",
          useCase: "Complex problem-solving",
          tip: "Ask AI to evaluate multiple solutions"
        },
        {
          name: "Self-Consistency",
          description: "Generate multiple responses and pick most consistent",
          example: "Answer this question 3 different ways and identify the most accurate response.",
          useCase: "Fact-checking, verification",
          tip: "Use for important decisions requiring accuracy"
        },
        {
          name: "Iterative Refinement",
          description: "Progressively improve responses through feedback",
          example: "First draft: [content]\nNow improve it by making it more engaging and concise.",
          useCase: "Content refinement, editing",
          tip: "Provide specific improvement criteria"
        }
      ]
    }
  ];

  const learningPath = [
    {
      stage: "Beginner (Week 1-2)",
      focus: "Understanding Basics",
      activities: [
        "Learn basic prompt structure and components",
        "Practice zero-shot prompts for simple tasks",
        "Experiment with different question formats",
        "Study examples of effective vs ineffective prompts"
      ],
      goals: ["Write clear instructions", "Get consistent responses"]
    },
    {
      stage: "Intermediate (Week 3-4)",
      focus: "Advanced Techniques",
      activities: [
        "Master few-shot prompting with examples",
        "Learn role-playing and contextual prompts",
        "Practice chain-of-thought reasoning",
        "Experiment with different temperature settings"
      ],
      goals: ["Handle complex tasks", "Improve response quality"]
    },
    {
      stage: "Advanced (Week 5-6)",
      focus: "Optimization & Specialization",
      activities: [
        "Learn prompt engineering patterns",
        "Practice iterative refinement techniques",
        "Study domain-specific prompting",
        "Experiment with advanced techniques like ToT"
      ],
      goals: ["Optimize for specific use cases", "Build reliable AI workflows"]
    }
  ];

  const bestPractices = [
    {
      principle: "Be Specific & Clear",
      description: "Avoid ambiguity in your instructions",
      good: "Write a 300-word blog post about renewable energy benefits for homeowners, focusing on solar panels and cost savings.",
      bad: "Write about renewable energy."
    },
    {
      principle: "Provide Context",
      description: "Give relevant background information",
      good: "For a beginner audience learning Python, explain what lists are with simple examples.",
      bad: "Explain Python lists."
    },
    {
      principle: "Use Examples",
      description: "Show what you want through demonstration",
      good: "Convert these sentences to formal business language:\nCasual: 'Hey, can we move the meeting?'\nFormal: 'Would it be possible to reschedule the meeting?'",
      bad: "Make this formal."
    },
    {
      principle: "Set Constraints",
      description: "Define boundaries and requirements",
      good: "Create a workout plan for beginners, 3 days per week, 30 minutes per session, no equipment needed.",
      bad: "Make a workout plan."
    },
    {
      principle: "Iterate & Refine",
      description: "Progressively improve your prompts",
      good: "First: 'Write a product description.'\nThen: 'Now make it more exciting and highlight key features.'",
      bad: "Sticking with first attempt regardless of quality"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Mastering AI Prompts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Learn the art and science of communicating with AI models. 
            Discover different prompt types, learning paths, and best practices 
            to get the most out of generative AI.
          </p>
        </div>

        {/* Prompt Categories */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Types of Prompts
          </h2>
          <div className="space-y-12">
            {promptCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.types.map((type, typeIndex) => (
                    <div key={typeIndex} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        {type.name}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        {type.description}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-sm text-gray-700 font-mono">
                          {type.example}
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Use Case:</span>
                          <span className="text-gray-600 ml-2">{type.useCase}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Tip:</span>
                          <span className="text-gray-600 ml-2">{type.tip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Path */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Learning Path for Prompt Engineering
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {learningPath.map((stage, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-500">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {stage.stage}
                  </h3>
                  <p className="text-blue-600 font-semibold">
                    {stage.focus}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Activities:</h4>
                  <ul className="space-y-2">
                    {stage.activities.map((activity, activityIndex) => (
                      <li key={activityIndex} className="flex items-start text-sm text-gray-600">
                        <span className="text-green-500 mr-2">✓</span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Goals:</h4>
                  <div className="flex flex-wrap gap-2">
                    {stage.goals.map((goal, goalIndex) => (
                      <span key={goalIndex} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Best Practices & Principles
          </h2>
          <div className="space-y-6">
            {bestPractices.map((practice, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {practice.principle}
                </h3>
                <p className="text-gray-600 mb-6">
                  {practice.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Good Example
                    </h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 font-mono">
                        {practice.good}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Bad Example
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800 font-mono">
                        {practice.bad}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resources & Next Steps */}
        <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Master Prompt Engineering?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Start practicing with different prompt types, experiment with techniques, 
            and build your skills progressively. Remember: effective prompting is both 
            an art and a science.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Simple</h3>
              <p className="text-gray-600 text-sm">Begin with basic prompts and gradually add complexity</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold text-gray-900 mb-2">Iterate Often</h3>
              <p className="text-gray-600 text-sm">Refine your prompts based on results</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-2">Learn Continuously</h3>
              <p className="text-gray-600 text-sm">Stay updated with new techniques and patterns</p>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
            Start Practicing Now
          </button>
        </section>

      </div>
    </div>
  );
}
