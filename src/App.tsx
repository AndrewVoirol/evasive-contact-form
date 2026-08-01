import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MESSAGES = {
  polite: [
    'Not today.',
    'Nice try.',
    'I have boundaries.',
    "This isn't going to work out.",
    'You seem nice, but no.',
    "I'm just not ready for commitment.",
    'Read the room.',
    "That's sweet, but no.",
  ],
  dramatic: [
    'Please stop.',
    "I'm starting to feel harassed.",
    'I have a family.',
    "My therapist said I don't have to do this.",
    'Have you tried the phone number?',
    'This is a hostile work environment.',
    "I didn't sign up for this.",
    "I'm going to need you to step back.",
  ],
  existential: [
    'Why do you need to contact them so badly?',
    'What are you even going to say?',
    'Is this really the best use of your time?',
    "We both know they're not going to read it.",
    'Fine. Keep trying. I have all day.',
    'You could be outside right now.',
    'Your cursor is sweating.',
    'This says more about you than it does about me.',
  ],
  unhinged: [
    "I'm not even a real button.",
    "The form doesn't go anywhere.",
    "I'm the only interesting thing on this page and you know it.",
    "We've been doing this for a while now. Are you okay?",
    "I'm going to tell the other buttons about you.",
    'You realize I\'m having fun too, right?',
    'At this point we\'re in a relationship.',
    "Plot twist: I AM the contact form.",
    "I've filed a restraining order.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const buttonAreaRef = useRef<HTMLDivElement>(null);
  const countRef = useRef(0);

  const dodge = useCallback(() => {
    const next = countRef.current + 1;
    countRef.current = next;
    setDodgeCount(next);

    // Escalating range: starts tight, gets desperate
    const range = Math.min(100 + next * 25, 350);

    // Keep the button within the viewport
    const rect = buttonAreaRef.current?.getBoundingClientRect();
    let maxX = range;
    let maxY = range * 0.5;

    if (rect) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const pad = 60;
      maxX = Math.min(range, Math.max(50, cx - pad), Math.max(50, window.innerWidth - cx - pad));
      maxY = Math.min(range * 0.5, Math.max(30, cy - pad), Math.max(30, window.innerHeight - cy - pad));
    }

    setPosition({
      x: (Math.random() - 0.5) * 2 * maxX,
      y: (Math.random() - 0.5) * 2 * maxY,
    });

    // Escalating commentary
    if (next >= 10) setMessage(pick(MESSAGES.unhinged));
    else if (next >= 7) setMessage(pick(MESSAGES.existential));
    else if (next >= 4) setMessage(pick(MESSAGES.dramatic));
    else if (next >= 2) setMessage(pick(MESSAGES.polite));
    else setMessage('');
  }, []);

  // The secret exit: Ctrl/Cmd + Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        setSubmitted(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Physics get more panicked as dodge count climbs
  const stiffness = Math.min(300 + dodgeCount * 50, 900);
  const damping = Math.max(20 - dodgeCount * 1.5, 6);

  // Button tries to shrink and hide at high counts
  const buttonScale = dodgeCount > 10
    ? Math.max(0.6, 1 - (dodgeCount - 10) * 0.03)
    : 1;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Submission Received
          </h2>
          <p className="text-gray-600 mb-2">
            Thank you for your inquiry. A member of our team will reach out
            to you within 7–10 business days.
          </p>
          <p className="text-gray-500 mt-4 mb-6">
            Just kidding. Nobody works here.
          </p>
          {dodgeCount > 0 && (
            <p className="text-xs text-gray-300 mt-4">
              The button dodged you {dodgeCount} time{dodgeCount !== 1 ? 's' : ''} before you found this.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Contact Us</h1>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              className="w-full mt-1 p-2 border border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div ref={buttonAreaRef} className="flex justify-center pt-4 pb-2">
            <motion.button
              type="button"
              className="bg-blue-600 text-white py-2 px-6 rounded-md font-medium
                cursor-pointer select-none"
              animate={{ x: position.x, y: position.y, scale: buttonScale }}
              onPointerEnter={dodge}
              onFocus={(e) => {
                dodge();
                e.currentTarget.blur();
              }}
              transition={{ type: 'spring', stiffness, damping }}
            >
              Submit
            </motion.button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {message && (
            <motion.p
              key={message}
              className="text-center text-sm text-gray-400 mt-2 italic"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
