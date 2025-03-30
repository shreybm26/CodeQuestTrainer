import { useContext } from "react";

// Create a simple toast context since the real one is missing
type Toast = {
  title: string;
  description?: string;
};

// Simplify the toast function to just console log for now
export const useToast = () => {
  return {
    toast: (props: Toast) => {
      console.log(`Toast: ${props.title}${props.description ? ` - ${props.description}` : ''}`);
    }
  };
}; 