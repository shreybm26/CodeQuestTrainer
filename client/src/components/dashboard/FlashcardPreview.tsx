import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Flashcard = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export default function FlashcardPreview() {
  const { data: flashcards, isLoading } = useQuery<Flashcard[]>({
    queryKey: ['/api/flashcards/daily'],
  });
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [_, setLocation] = useLocation();

  // Default flashcards if none are fetched
  const defaultFlashcards: Flashcard[] = [
    {
      id: '1',
      category: 'Operating Systems',
      question: 'What is a Deadlock?',
      answer: 'A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.'
    },
    {
      id: '2',
      category: 'Data Structures',
      question: 'What is a Binary Search Tree?',
      answer: 'A binary search tree is a data structure where each node has at most two children, with the left child containing values less than the node and the right child containing values greater than the node.'
    },
    {
      id: '3',
      category: 'Algorithms',
      question: 'What is the time complexity of quicksort?',
      answer: 'The average time complexity of quicksort is O(n log n), but the worst-case time complexity is O(n²) when the pivot selection is poor.'
    }
  ];

  const availableFlashcards = flashcards || defaultFlashcards;
  const currentFlashcard = availableFlashcards[currentIndex];
  const totalCards = availableFlashcards.length;
  
  const handleStartFlashcardSession = () => {
    setLocation('/lessons/1');
  };

  const goToNextCard = () => {
    if (isFlipped) setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const goToPreviousCard = () => {
    if (isFlipped) setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  return (
    <Card className="bg-white rounded-xl p-6 shadow-md h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Daily Flashcards</h2>
        <Badge className="bg-yellow-100 text-yellow-700 py-1 px-3">
          {totalCards} Cards
        </Badge>
      </div>
      
      {/* Flashcard container with fixed height */}
      <div className="mb-6 relative" style={{ height: '180px' }}>
        <motion.div 
          className="relative h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of card */}
          <motion.div 
            className={`bg-white rounded-lg shadow-lg p-5 border-2 border-primary/30 h-full flex flex-col ${isFlipped ? 'absolute inset-0 backface-hidden' : ''}`}
            style={{ backfaceVisibility: 'hidden' }}
            onClick={() => setIsFlipped(true)}
          >
            <p className="text-sm text-primary mb-2 font-bold">{currentFlashcard.category}</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{currentFlashcard.question}</h3>
            <div className="text-sm text-gray-500 mt-auto">
              <span className="font-medium text-red-500">Click to flip</span>
            </div>
          </motion.div>
          
          {/* Back of card */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-5 border-2 border-primary/30 absolute inset-0 backface-hidden h-full flex flex-col"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            onClick={() => setIsFlipped(false)}
          >
            <p className="text-sm text-primary mb-2 font-bold">{currentFlashcard.category}</p>
            <p className="text-sm text-gray-800">{currentFlashcard.answer}</p>
            <div className="flex justify-between mt-auto">
              <Button variant="link" className="text-red-500 font-bold p-0">Difficult</Button>
              <Button variant="link" className="text-primary font-bold p-0">Easy</Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Navigation arrows and card indicators */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToPreviousCard} 
          className="h-8 w-8 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex justify-center space-x-2">
          {availableFlashcards.map((_, index) => (
            <span 
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-primary' : 'bg-gray-200'}`}
            ></span>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToNextCard} 
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Button className="w-full" onClick={handleStartFlashcardSession}>
        Start Flashcard Session
      </Button>
    </Card>
  );
}
