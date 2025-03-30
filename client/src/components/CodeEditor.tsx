import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Loader2, 
  ThumbsUp, 
  AlertTriangle,
  Lightbulb,
  Wrench
} from 'lucide-react';

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
  onSubmit: (code: string, language: string) => void;
  isSubmitting?: boolean;
  testResults?: TestResult[];
  question: CodingQuestion;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  difficulty: string;
  starterCode: string;
}

export interface TestResult {
  status: 'success' | 'error' | 'loading';
  message: string;
  input?: string;
  expected?: string;
  actual?: string;
  time?: string;
  memory?: string;
}

const CodeEditor = ({
  initialCode,
  language = 'javascript',
  theme = 'vs-dark',
  onSubmit,
  isSubmitting = false,
  testResults = [],
  question
}: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [activeTab, setActiveTab] = useState<'code' | 'results'>('code');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // Available languages
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
  ];

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    
    // Update starter code based on language (in a real app, this would fetch language-specific code)
    const languageToExtension: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp'
    };
    
    // In a real app, starter code would be fetched for each language
    if (value === 'python') {
      setCode(code.includes('function') ? convertJsToPython(code) : code);
    } else if (value === 'java') {
      setCode(code.includes('function') ? convertJsToJava(code, question.title) : code);
    } else if (value === 'cpp') {
      setCode(code.includes('function') ? convertJsToCpp(code) : code);
    }
  };

  // Simplified function to convert JS code to Python
  const convertJsToPython = (jsCode: string): string => {
    // This is a very simplified conversion, just for demo
    let functionName = jsCode.match(/function\s+(\w+)/)?.[1] || 'solution';
    
    // Extract parameters
    let params = jsCode.match(/function\s+\w+\s*\((.*?)\)/)?.[1] || '';
    
    return `def ${functionName}(${params}):\n    # Your code here\n    pass`;
  };
  
  // Simplified function to convert JS code to Java
  const convertJsToJava = (jsCode: string, className: string): string => {
    // Very simplified conversion for demo
    let functionName = jsCode.match(/function\s+(\w+)/)?.[1] || 'solution';
    
    // Extract parameters
    let paramsMatch = jsCode.match(/function\s+\w+\s*\((.*?)\)/)?.[1] || '';
    let params = paramsMatch.split(',').map(p => `int ${p.trim()}`).join(', ');
    
    if (paramsMatch.includes('nums')) {
      params = 'int[] nums';
    }
    
    // Generate class name from question title
    const formattedClassName = className
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/\s+/g, '');
    
    return `class ${formattedClassName} {\n    public int ${functionName}(${params}) {\n        // Your code here\n        return 0;\n    }\n}`;
  };
  
  // Simplified function to convert JS code to C++
  const convertJsToCpp = (jsCode: string): string => {
    // Very simplified conversion for demo
    let functionName = jsCode.match(/function\s+(\w+)/)?.[1] || 'solution';
    
    // Extract parameters
    let paramsMatch = jsCode.match(/function\s+\w+\s*\((.*?)\)/)?.[1] || '';
    let params = paramsMatch.split(',').map(p => `int ${p.trim()}`).join(', ');
    
    if (paramsMatch.includes('nums')) {
      params = 'vector<int>& nums';
    }
    
    return `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int ${functionName}(${params}) {\n        // Your code here\n        return 0;\n    }\n};`;
  };

  // Handle code execution (in a real app, this would send code to a backend for execution)
  const handleRunCode = () => {
    setIsRunning(true);
    setActiveTab('results');
    setOutput('Running your code...');
    
    // Simulate code execution delay
    setTimeout(() => {
      setIsRunning(false);
      setOutput(`Code execution completed!\n\nThis is a simulated output. In a real application, your ${selectedLanguage} code would be executed on the server and the results would be displayed here.`);
    }, 1500);
  };

  // Handle code submission
  const handleSubmitCode = () => {
    onSubmit(code, selectedLanguage);
    setActiveTab('results');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Code
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSubmitCode}
            disabled={isSubmitting || isRunning}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wrench className="mr-2 h-4 w-4" />
            )}
            Submit Solution
          </Button>
        </div>
      </div>
      
      <div className="flex-grow border rounded-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'code' ? 'border-b-2 border-primary' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('code')}
          >
            Code
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'results' ? 'border-b-2 border-primary' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('results')}
          >
            Results
          </button>
        </div>
        
        <div className="h-64 md:h-96">
          {activeTab === 'code' ? (
            <Editor
              height="100%"
              defaultLanguage={selectedLanguage}
              language={selectedLanguage}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={theme}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="p-4 bg-gray-100 h-full overflow-auto">
              {isSubmitting || isRunning ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-gray-600">
                    {isSubmitting ? 'Evaluating your solution...' : 'Running your code...'}
                  </p>
                </div>
              ) : testResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Test Results</h3>
                  {testResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-md ${
                      result.status === 'success' ? 'bg-green-50 border border-green-200' :
                      result.status === 'error' ? 'bg-red-50 border border-red-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className="flex items-center mb-2">
                        {result.status === 'success' ? (
                          <ThumbsUp className="h-5 w-5 text-green-500 mr-2" />
                        ) : result.status === 'error' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        ) : (
                          <Loader2 className="h-5 w-5 text-gray-500 mr-2 animate-spin" />
                        )}
                        <span className="font-medium">Test Case {index + 1}</span>
                      </div>
                      
                      <p className="text-sm mb-2">{result.message}</p>
                      
                      {result.input && (
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Input:</span> {result.input}
                        </div>
                      )}
                      
                      {result.expected && (
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Expected:</span> {result.expected}
                        </div>
                      )}
                      
                      {result.actual && (
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">Your output:</span> {result.actual}
                        </div>
                      )}
                      
                      {(result.time || result.memory) && (
                        <div className="text-xs text-gray-500 mt-2">
                          {result.time && <span className="mr-3">Runtime: {result.time}</span>}
                          {result.memory && <span>Memory: {result.memory}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-mono text-sm">{output}</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
        <Lightbulb className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium mb-1">Tip:</p>
          <p>This is a simulated coding environment. In a real application, your code would be sent to a server for execution and testing.</p>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 