/**
 * lessons.js
 * ─────────────────────────────────────────────────────────────────────
 * Educational content and progress metadata for Signova.AI
 */

export const LESSONS = [
    {
        id: 'alphabet-1',
        title: 'The Alphabet (A-G)',
        description: 'Master the first 7 letters of the manual alphabet.',
        category: 'Basics',
        difficulty: 'Beginner',
        progress: 0,
        content: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    },
    {
        id: 'alphabet-2',
        title: 'The Alphabet (H-N)',
        description: 'Continue your journey with the next set of letters.',
        category: 'Basics',
        difficulty: 'Beginner',
        progress: 0,
        content: ['H', 'I', 'J', 'K', 'L', 'M', 'N']
    },
    {
        id: 'greetings',
        title: 'Basic Greetings',
        description: 'Learn how to say Hello, Welcome, and ask How are you.',
        category: 'Communication',
        difficulty: 'Beginner',
        progress: 0,
        content: ['HELLO', 'WELCOME', 'HOW_ARE_YOU', 'NAME']
    },
    {
        id: 'needs',
        title: 'Daily Needs',
        description: 'Crucial signs for Water, Help, and Please.',
        category: 'Communication',
        difficulty: 'Beginner',
        progress: 0,
        content: ['WATER', 'HELP', 'PLEASE', 'THANK_YOU']
    }
];

export function getLessonById(id) {
    return LESSONS.find(l => l.id === id);
}

export function saveProgress(lessonId, progress) {
    const key = `signova_progress_${lessonId}`;
    localStorage.setItem(key, progress);
}

export function loadProgress(lessonId) {
    const key = `signova_progress_${lessonId}`;
    return parseInt(localStorage.getItem(key) || '0');
}
