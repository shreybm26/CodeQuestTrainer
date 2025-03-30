import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CodingQuestion, TestResult } from './CodeEditor';
import CodeEditor from './CodeEditor';

interface ProblemLayoutProps {
  question: CodingQuestion;
  onSubmit: (code: string, language: string) => Promise<void>;
  currentIndex?: number;
  totalProblems?: number;
}

const ProblemLayout = ({
  question,
  onSubmit,
  currentIndex = 0,
  totalProblems = 1
}: ProblemLayoutProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const handleSubmit = async (code: string, language: string) => {
    setIsSubmitting(true);
    setTestResults([
      { status: 'loading', message: 'Running test cases...' }
    ]);

    try {
      await onSubmit(code, language);
      
      // Simulate test results after a delay
      setTimeout(() => {
        setTestResults([
          {
            status: 'success',
            message: 'All test cases passed!',
            input: question.examples[0].input,
            expected: question.examples[0].output,
            actual: question.examples[0].output,
            time: '12ms',
            memory: '40.2MB'
          },
          {
            status: 'success',
            message: 'Test case passed!',
            input: question.examples[1]?.input || 'nums = [3,2,4], target = 6',
            expected: question.examples[1]?.output || '[1,2]',
            actual: question.examples[1]?.output || '[1,2]',
            time: '10ms',
            memory: '38.7MB'
          }
        ]);
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      // Simulate test failure
      setTimeout(() => {
        setTestResults([
          {
            status: 'success',
            message: 'Test case passed!',
            input: question.examples[0].input,
            expected: question.examples[0].output,
            actual: question.examples[0].output,
            time: '15ms',
            memory: '41.0MB'
          },
          {
            status: 'error',
            message: 'Wrong answer',
            input: question.examples[1]?.input || 'nums = [3,2,4], target = 6',
            expected: question.examples[1]?.output || '[1,2]',
            actual: '[0,1]',
            time: '12ms',
            memory: '39.2MB'
          }
        ]);
        setIsSubmitting(false);
      }, 2000);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Problem Statement */}
      <div className="overflow-auto">
        <Card className="h-full flex flex-col">
          <CardContent className="p-6 flex-grow overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  Problem {currentIndex + 1} of {totalProblems}
                </div>
                <h2 className="text-xl font-bold">{question.title}</h2>
              </div>
              <Badge className={
                question.difficulty === 'Easy' ? 'bg-green-500' :
                question.difficulty === 'Medium' ? 'bg-yellow-500' :
                'bg-red-500'
              }>
                {question.difficulty}
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-6">{question.description}</p>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Examples:</h3>
              <div className="space-y-4">
                {question.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-1"><strong>Example {index + 1}:</strong></div>
                    <div className="mb-1"><strong>Input:</strong> {example.input}</div>
                    <div className="mb-1"><strong>Output:</strong> {example.output}</div>
                    {example.explanation && (
                      <div><strong>Explanation:</strong> {example.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-semibold text-lg mb-3">Constraints:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>The array length will be at least 2</li>
                <li>Each element's value will be between -10^9 and 10^9</li>
                <li>There is exactly one valid solution</li>
                <li>You may not use the same element twice</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Code Editor */}
      <div className="h-full flex flex-col">
        <Card className="h-full">
          <CardContent className="p-6 h-full flex flex-col">
            <CodeEditor
              initialCode={question.starterCode}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              testResults={testResults}
              question={question}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProblemLayout; 