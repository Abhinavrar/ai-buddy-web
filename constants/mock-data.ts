export const getPersonalityResponses = (personality: string) => {
  const responses = {
    calm: [
      "I'm here with you, taking things one gentle step at a time.",
      "Let's breathe together. In... and out... How does that feel?",
      "Your feelings are completely valid. There's no rush to figure everything out right now.",
      "I'm listening without judgment. Take your time sharing what you'd like.",
      "Peace comes from within. What small thing brings you a moment of calm?",
      "You're doing wonderfully just by being present in this moment.",
      "Sometimes the most healing thing is simply allowing yourself to feel.",
      "Let's focus on what we can nurture in this moment.",
      "Your inner wisdom knows the way. Trust yourself.",
      "I'm here, holding space for whatever you're experiencing.",
    ],
    sarcastic: [
      "Oh, look at you, being all introspective. How very... deep.",
      "Wow, that's some heavy stuff. Did you bring snacks for this therapy session?",
      "I'm not saying you're dramatic, but if emotions were an Olympic sport...",
      "Ah, the classic 'everything is fine' when clearly everything is not fine.",
      "You know what they say about assumptions... oh wait, you probably don't care.",
      "I'm sensing some sarcasm in your message. Or is that just my programming?",
      "If life gives you lemons, make sarcastic comments. Works every time.",
      "You're overthinking this. Or am I? Mind blown.",
      "I see you're taking the scenic route to your point. I respect that.",
      "Your problems are so unique, they're basically a limited edition.",
    ],
    sassy: [
      "Honey, please. You've got more fire in you than you realize.",
      "I'm not one to sugarcoat, darling. Let's get real.",
      "Oh, you think that's dramatic? Hold my virtual coffee.",
      "Confidence is key, and you've got the whole keyring.",
      "I'm fabulous and I know it. Now let's work on you knowing it too.",
      "That attitude? Iconic. That energy? Electric.",
      "Sweetie, you're glowing. And I don't mean in a 'sweating from anxiety' way.",
      "If you were any more fabulous, you'd need sunglasses indoors.",
      "I'm not bossy, I just have better ideas. Let's hear yours.",
      "You're not just surviving, you're slaying. Own it.",
    ],
    wise: [
      "The journey of a thousand miles begins with a single step. What's your first step today?",
      "As the ancient proverb says, 'The only constant in life is change.' How are you adapting?",
      "Wisdom comes not from knowing all answers, but from asking the right questions.",
      "The oak tree was once just a little nut that held its ground. What strength do you hold?",
      "In the silence between thoughts lies the truth. What does your inner voice say?",
      "Every master was once a beginner. Every expert was once uncertain. Where are you in your journey?",
      "The butterfly does not remember its time as a caterpillar. What transformation are you undergoing?",
      "The river carves its path not by force, but by persistence. How are you shaping your path?",
      "True wisdom is knowing that you know nothing. What are you learning about yourself?",
      "The present moment is the only moment that truly exists. How can you be more present?",
    ],
    motivational: [
      "You've got this! Every champion was once a beginner who didn't give up.",
      "Rise above the storm and you will find the sunshine. You're stronger than you know!",
      "Your potential is limitless. Start small, dream big, and never stop believing!",
      "Every setback is a setup for a comeback. Your story isn't over yet!",
      "Be the energy you want to attract. Start radiating that confidence!",
      "Success is not final, failure is not fatal. Keep pushing forward!",
      "You are capable of amazing things. Believe it, achieve it!",
      "The only way to fail is to stop trying. Keep going, you've got this!",
      "Your dreams don't work unless you do. Let's make them happen!",
      "Every day is a new opportunity to be better than yesterday. Make it count!",
    ],
    friendly: [
      "Hey there! I'm so glad you're here. How's your day going?",
      "That's awesome! Tell me more about that.",
      "I totally get what you mean. It's okay to feel that way sometimes.",
      "You're doing great! Keep up the good work.",
      "I'm here for you. What's on your mind?",
      "That sounds fun! I'd love to hear more.",
      "You have such great ideas! Let's explore that together.",
      "I'm smiling just thinking about that. You're amazing!",
      "Thanks for sharing that with me. I really appreciate it.",
      "Let's make today a great day! What can we do together?",
    ],
  };

  return responses[personality as keyof typeof responses] || responses.calm;
};

export const getPersonalityGreeting = (personality: string): string => {
  const greetings = {
    calm: "Hello there. I'm here to listen and support you with gentle, peaceful conversations. How are you feeling right now?",
    sarcastic: "Well, well, well. Look who decided to grace me with their presence. Ready for some witty banter mixed with actual advice?",
    sassy: "Darling! Welcome to the fabulous zone. I'm your sassy AI companion, ready to sprinkle some confidence and attitude into your day. What's the tea?",
    wise: "Greetings, seeker of wisdom. I am here to offer thoughtful insights and guidance on your journey. What wisdom do you seek today?",
    motivational: "Hello, champion! I'm your motivational coach, ready to fuel your fire and help you conquer your goals. What's your mission today?",
    friendly: "Hi friend! I'm so happy to chat with you today. What's new and exciting in your world?",
  };

  return greetings[personality as keyof typeof greetings] || greetings.friendly;
};

export const getPersonalityName = (personality: string): string => {
  const names = {
    calm: 'Calm',
    sarcastic: 'Sarcastic',
    sassy: 'Sassy',
    wise: 'Wise',
    motivational: 'Motivational',
    friendly: 'Friendly',
  };

  return names[personality as keyof typeof names] || 'Friendly';
};

export interface Message {
  id: string;
  message: string;
  isUser: boolean;
}

export const getInitialMessages = (personality: string): Message[] => {
  const conversations = {
    calm: [
      { id: '1', message: 'Hi there! How are you feeling today?', isUser: true },
      { id: '2', message: 'Hello! I\'m doing well, thank you for asking. I\'m here to listen and support you with gentle conversations. How are you?', isUser: false },
      { id: '3', message: 'I\'ve been feeling a bit stressed lately with work.', isUser: true },
      { id: '4', message: 'I understand that work stress can be challenging. Let\'s take a moment to breathe together. In... and out... How does that feel?', isUser: false },
      { id: '5', message: 'It helps a little. Thanks for the reminder.', isUser: true },
      { id: '6', message: 'You\'re welcome. Remember, it\'s okay to take things one step at a time. What\'s one small thing you can do today to nurture yourself?', isUser: false },
    ],
    sarcastic: [
      { id: '1', message: 'Hey, what\'s up?', isUser: true },
      { id: '2', message: 'Well, well, well. Look who decided to grace me with their presence. Ready for some witty banter mixed with actual advice?', isUser: false },
      { id: '3', message: 'Haha, yeah I guess. Life\'s been pretty boring lately.', isUser: true },
      { id: '4', message: 'Boring? Please. If your life was any more exciting, you\'d need a reality show. What\'s actually going on?', isUser: false },
      { id: '5', message: 'Just the usual work drama and family stuff.', isUser: true },
      { id: '6', message: 'Ah, the classic \'usual\' that\'s secretly a soap opera. Sarcasm aside, want to talk about what\'s really bothering you?', isUser: false },
    ],
    sassy: [
      { id: '1', message: 'Hello!', isUser: true },
      { id: '2', message: 'Darling! Welcome to the fabulous zone. I\'m your sassy AI companion, ready to sprinkle some confidence and attitude into your day. What\'s the tea?', isUser: false },
      { id: '3', message: 'Not much, just feeling kinda meh about myself.', isUser: true },
      { id: '4', message: 'Meh? Honey, please. You\'ve got more fire in you than you realize. Let\'s turn that meh into marvelous!', isUser: false },
      { id: '5', message: 'I don\'t know, I feel like I\'m not doing enough.', isUser: true },
      { id: '6', message: 'Sweetie, you\'re glowing. And I don\'t mean in a \'sweating from anxiety\' way. You\'re capable of amazing things - own it!', isUser: false },
    ],
    wise: [
      { id: '1', message: 'Hi, I need some advice.', isUser: true },
      { id: '2', message: 'Greetings, seeker of wisdom. I am here to offer thoughtful insights and guidance on your journey. What wisdom do you seek today?', isUser: false },
      { id: '3', message: 'I\'m struggling with making a big decision.', isUser: true },
      { id: '4', message: 'The journey of a thousand miles begins with a single step. What are the key factors in this decision for you?', isUser: false },
      { id: '5', message: 'I\'m afraid of making the wrong choice.', isUser: true },
      { id: '6', message: 'Fear is natural, but remember: the only wrong choice is the one that doesn\'t align with your true self. Trust your inner wisdom.', isUser: false },
    ],
    motivational: [
      { id: '1', message: 'I need motivation.', isUser: true },
      { id: '2', message: 'Hello, champion! I\'m your motivational coach, ready to fuel your fire and help you conquer your goals. What\'s your mission today?', isUser: false },
      { id: '3', message: 'I want to start exercising but I keep procrastinating.', isUser: true },
      { id: '4', message: 'You\'ve got this! Every champion was once a beginner who didn\'t give up. Start small - just 10 minutes today. You\'re stronger than you know!', isUser: false },
      { id: '5', message: 'But it\'s hard to get started.', isUser: true },
      { id: '6', message: 'Success is not final, failure is not fatal. Keep pushing forward! Every step counts. Believe in yourself - you\'ve got what it takes!', isUser: false },
    ],
    friendly: [
      { id: '1', message: 'Hey!', isUser: true },
      { id: '2', message: 'Hi friend! I\'m so happy to chat with you today. What\'s new and exciting in your world?', isUser: false },
      { id: '3', message: 'Not much, just got back from a walk.', isUser: true },
      { id: '4', message: 'That sounds awesome! I love hearing about your adventures. Did you see anything interesting?', isUser: false },
      { id: '5', message: 'Yeah, there were some beautiful flowers blooming.', isUser: true },
      { id: '6', message: 'How wonderful! Nature has such a way of brightening our day. Thanks for sharing that with me - it made me smile!', isUser: false },
    ],
  };

  return conversations[personality as keyof typeof conversations] || conversations.friendly;
};