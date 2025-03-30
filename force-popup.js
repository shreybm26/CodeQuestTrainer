// Copy and paste this code into your browser console while on any page of the application
// This will find the right component instance and trigger the emotion detection modal
(() => {
  console.log("🔍 Searching for emotion detection components...");
  
  // Find React root
  const rootNodes = document.querySelectorAll('div[id^="root"]');
  if (rootNodes.length === 0) {
    console.log("❌ No React root found. Make sure you're on the right page.");
    return;
  }
  
  // First, try to directly set the emotion state in ChallengeDetail or Dashboard
  let success = false;
  
  // Method 1: Find exposed React components or hooks in the window object
  console.log("Method 1: Looking for React components in window...");
  const allProps = Object.getOwnPropertyNames(window);
  const reactProps = allProps.filter(prop => 
    prop.includes("react") || 
    prop.includes("fiber") || 
    prop.startsWith("__") || 
    prop.includes("internal")
  );
  
  // Method 2: Manually trigger the right callback
  console.log("Method 2: Manually triggering emotion detection...");
  try {
    // Fallback to creating and dispatching a custom event
    const manualEmotionEvent = new CustomEvent('manualEmotionTrigger', { 
      detail: { type: 'bored' } 
    });
    window.dispatchEvent(manualEmotionEvent);
    
    // Trigger potential handleEmotionDetected functions
    if (typeof window.handleEmotionDetected === 'function') {
      window.handleEmotionDetected('bored');
      success = true;
      console.log("✅ Called window.handleEmotionDetected");
    }
  } catch (e) {
    console.log("Method 2 error:", e);
  }
  
  // Method 3: Find and modify the EmotionDetectionModal component
  console.log("Method 3: Directly creating and mounting the modal...");
  try {
    // This simplest approach is to create a new EmotionDetectionModal element
    const modalContainer = document.createElement('div');
    modalContainer.id = 'manual-emotion-modal';
    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <h2 class="text-xl font-bold mb-2">Need a quick break?</h2>
          <p class="mb-4">You seem to be losing focus. Here's something that might help:</p>
          <div class="bg-gray-100 rounded-lg p-4 mb-4">
            <h4 class="font-bold text-gray-800 mb-2">Quick Fun Fact</h4>
            <p class="text-sm text-gray-600">The first computer bug was an actual bug - a moth found trapped in a computer relay in 1947, which caused a malfunction. The term "debugging" comes from this incident!</p>
          </div>
          <div class="flex justify-between">
            <button class="px-4 py-2 bg-primary text-white rounded" onclick="document.getElementById('manual-emotion-modal').remove()">
              Back to learning
            </button>
            <button class="px-4 py-2 border rounded" onclick="document.getElementById('manual-emotion-modal').remove()">
              Give me a challenge
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalContainer);
    success = true;
    console.log("✅ Manually created emotion modal");
  } catch (e) {
    console.log("Method 3 error:", e);
  }
  
  if (!success) {
    console.log("❌ Could not trigger the emotion detection modal automatically.");
    console.log("Please try waiting for 30 seconds without any interaction, or navigate to a challenge page first.");
  }
})(); 