import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiGet, apiPost } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

type EmotionDetectionModalProps = {
  type: 'confused' | 'bored';
  onClose: () => void;
  currentTopic?: string;
};

// Interface for simplified explanation response
interface SimplifiedExplanationResponse {
  explanation: string;
}

// Interface for fun fact response
interface FunFactResponse {
  funFact: string;
}

// Interface for recommendation
interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: string;
  cta: string;
}

// Interface for recommendations response
interface RecommendationsResponse {
  recommendations: Recommendation[];
}

export default function EmotionDetectionModal({ type, onClose, currentTopic = 'Process Scheduling in Operating Systems' }: EmotionDetectionModalProps) {
  const [loading, setLoading] = useState(true);
  const [aiContent, setAiContent] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  const confusedContent = {
    title: 'We noticed you seem confused',
    description: 'Would you like some help understanding this concept?',
    helpTitle: 'Simplified Explanation',
    defaultContent: 'Process scheduling is like deciding which customer to serve next at a busy restaurant. The OS has different ways to decide: First-come-first-served, round-robin (everyone gets a small turn), or priority-based (VIPs first).'
  };

  const boredContent = {
    title: 'Need a quick break?',
    description: 'You seem to be losing focus. Here\'s something that might help:',
    helpTitle: 'Quick Fun Fact',
    defaultContent: 'Did you know? The first computer bug was an actual bug - a moth found trapped in a computer relay in 1947, which caused a malfunction. The term "debugging" comes from this incident!'
  };

  const content = type === 'confused' ? confusedContent : boredContent;

  // Fetch AI-powered content based on emotion type
  useEffect(() => {
    const fetchAiContent = async () => {
      try {
        setLoading(true);
        
        if (type === 'confused') {
          // Get simplified explanation for the current topic
          const response = await apiPost<SimplifiedExplanationResponse>(
            '/api/ai/simplify', 
            { topic: currentTopic }
          );
          
          setAiContent(response.explanation);
        } else {
          // Get a fun fact to re-engage the student
          const response = await apiGet<FunFactResponse>('/api/ai/fun-fact');
          
          // Check if the response is a string that needs to be parsed
          if (typeof response.funFact === 'string' && response.funFact.includes('recommendations')) {
            try {
              // Try to parse the response as JSON
              const parsedData = JSON.parse(response.funFact) as RecommendationsResponse;
              setRecommendations(parsedData.recommendations || []);
              setAiContent(''); // Clear aiContent since we're now using recommendations
            } catch (jsonError) {
              console.error('Error parsing recommendations JSON:', jsonError);
              setAiContent(response.funFact); // Fall back to showing the raw data
            }
          } else {
            setAiContent(response.funFact);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${type === 'confused' ? 'explanation' : 'fun fact'}:`, error);
        // Use default content if API call fails
        setAiContent(content.defaultContent);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAiContent();
  }, [type, currentTopic, content.defaultContent]);

  const handleAdditionalAction = () => {
    if (type === 'confused') {
      // Future implementation: Show video explanation
      console.log('Show video explanation for', currentTopic);
    } else {
      // Future implementation: Present a challenge to re-engage
      console.log('Present a quick challenge to re-engage');
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-gray-800 mb-2">{content.helpTitle}</h4>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="font-semibold text-sm mb-1">{rec.title}</h5>
                  <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.type === 'weak_area' ? 'bg-red-100 text-red-700' :
                      rec.type === 'needs_practice' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.type.replace('_', ' ')}
                    </span>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      {rec.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{aiContent}</p>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between">
          <Button type="button" onClick={onClose} disabled={loading}>
            {type === 'confused' ? 'That helps!' : 'Back to learning'}
          </Button>
          
          <Button 
            variant="outline" 
            type="button" 
            className="mt-2 sm:mt-0" 
            onClick={handleAdditionalAction}
            disabled={loading}
          >
            {type === 'confused' ? 'Show video' : 'Give me a challenge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
