import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Calendar, Sparkles, Clock, DollarSign, MapPin, Phone, MessageCircle, Users } from 'lucide-react';

// Glen avatar image path
const GLEN_AVATAR_URL = '/images/glen-avatar.png';

// Simple markdown parser for Glen's responses
const parseMarkdown = (text: string): JSX.Element[] => {
  const parts: JSX.Element[] = [];
  let key = 0;

  // Split by newlines first to handle line breaks
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      parts.push(<br key={`br-${key++}`} />);
    }

    // Parse bold (**text**) and handle emojis
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${key++}`}>{line.slice(lastIndex, match.index)}</span>);
      }
      // Add bold text
      parts.push(<strong key={`bold-${key++}`} className="font-semibold text-white">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(<span key={`text-${key++}`}>{line.slice(lastIndex)}</span>);
    }
  });

  return parts;
};
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'glen';
  type?: 'text' | 'services' | 'quickActions';
  services?: ServiceCard[];
  actions?: QuickAction[];
}

interface ServiceCard {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string;
}

interface QuickAction {
  label: string;
  action: string;
  icon?: string;
}

// Animation variants
const dialogVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, x: -10, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.08,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.95 },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.7, 0.3, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Slide-up animation for chat button on mobile
const slideUpVariants = {
  hidden: {
    y: 100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: 0.5,
    },
  },
};

export const GlenAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showOnMobile, setShowOnMobile] = useState(false);
  const messageIdRef = useRef(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: messageIdRef.current++,
      text: "Welcome to Zavira. I'm Glen, your AI assistant. How may I assist you today?",
      sender: 'glen',
      type: 'quickActions',
      actions: [
        { label: 'View Services', action: 'services', icon: 'sparkles' },
        { label: 'Book Now', action: 'book', icon: 'calendar' },
        { label: 'Prices', action: 'prices', icon: 'dollar' },
        { label: 'Hours & Location', action: 'location', icon: 'map' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show chat icon on mobile after scrolling past hero section
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 513;
      const scrolledPastHero = window.scrollY > window.innerHeight * 0.5; // 50% of viewport height

      if (isMobile) {
        setShowOnMobile(scrolledPastHero);
      } else {
        setShowOnMobile(true); // Always show on desktop
      }
    };

    // Initial check
    handleScroll();

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: messageIdRef.current++,
      text: textToSend,
      sender: 'user',
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/glen-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.map(m => ({ text: m.text, sender: m.sender }))
        })
      });

      const data = await response.json();

      // Handle both success and error responses
      const glenMessage: Message = {
        id: messageIdRef.current++,
        text: data.response || 'I apologize, I couldn\'t process your request at this moment.',
        sender: 'glen',
        type: data.type || 'text',
        services: data.services,
        actions: data.actions
      };

      setIsTyping(false);
      setMessages(prev => [...prev, glenMessage]);

      if (!response.ok) {
        console.error('API error:', response.status, data.error);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: messageIdRef.current++,
        text: 'I apologize, I\'m having trouble connecting right now. Please try again shortly.',
        sender: 'glen',
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'book':
        navigate('/booking');
        setIsOpen(false);
        break;
      case 'call':
        window.location.href = 'tel:+14318163330';
        break;
      case 'services':
        handleSend('What services do you offer?');
        break;
      case 'prices':
        handleSend('What are your prices?');
        break;
      case 'location':
        handleSend('What are your hours and location?');
        break;
      case 'hair':
        handleSend('Tell me about your hair services');
        break;
      case 'nails':
        handleSend('Tell me about your nail services');
        break;
      case 'massage':
        handleSend('Tell me about your massage services');
        break;
      case 'skin':
        handleSend('Tell me about your skin treatments');
        break;
      case 'tattoo':
        handleSend('Tell me about tattoos and piercings');
        break;
      case 'staff':
        navigate('/about');
        setIsOpen(false);
        break;
      default:
        handleSend(action);
    }
  };

  const handleServiceClick = (service: ServiceCard) => {
    navigate(`/booking?service=${service.id}`);
    setIsOpen(false);
  };

  const sampleQuestions = [
    "What services do you offer?",
    "How do I book an appointment?",
    "What are your most popular treatments?"
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hair': return '💇';
      case 'nails': return '💅';
      case 'massage': return '💆';
      case 'skin': return '✨';
      case 'tattoo': return '🎨';
      case 'piercing': return '💎';
      case 'waxing': return '🌸';
      default: return '💫';
    }
  };

  const getActionIcon = (icon?: string) => {
    switch (icon) {
      case 'calendar': return <Calendar className="h-3 w-3" />;
      case 'sparkles': return <Sparkles className="h-3 w-3" />;
      case 'dollar': return <DollarSign className="h-3 w-3" />;
      case 'map': return <MapPin className="h-3 w-3" />;
      case 'clock': return <Clock className="h-3 w-3" />;
      case 'phone': return <Phone className="h-3 w-3" />;
      case 'users': return <Users className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <>
      {/* Chat Window - Black bg with glassmorphism */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            data-lenis-prevent
            className="fixed bottom-24 right-6 z-[9999] w-80 sm:w-96 h-[520px] rounded-3xl flex flex-col overflow-hidden"
            style={{
              background: 'rgba(10, 10, 10, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Header - Frosted glass with white glow */}
            <motion.div
              className="flex items-center justify-between p-4 border-b"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20 ring-offset-2 ring-offset-black/50"
                    style={{
                      boxShadow: '0 0 15px rgba(255,255,255,0.2)',
                      backgroundImage: `url(${GLEN_AVATAR_URL})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    {/* Fallback content if image fails to load */}
                    {avatarError && (
                      <div className="w-full h-full flex items-center justify-center bg-white">
                        <span className="text-black font-serif font-bold text-lg">G</span>
                      </div>
                    )}
                  </div>
                  <motion.span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white border-2 border-[#0a0a0a] rounded-full"
                    style={{ boxShadow: '0 0 8px rgba(255,255,255,0.6)' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3
                    className="font-semibold text-[15px] text-white tracking-wide"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      textShadow: '0 0 10px rgba(255,255,255,0.3)'
                    }}
                  >
                    Glen
                  </h3>
                  <p className="text-xs text-white/60 font-medium tracking-wide">
                    AI Assistant
                  </p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[85%]">
                        {/* Text Message */}
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            message.sender === 'user'
                              ? 'rounded-br-md text-black'
                              : 'rounded-bl-md text-white/90'
                          }`}
                          style={
                            message.sender === 'user'
                              ? {
                                  background: '#FAFAFA',
                                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.15), 0 0 20px rgba(255,255,255,0.1)'
                                }
                              : {
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)'
                                }
                          }
                        >
                          {message.sender === 'glen' ? parseMarkdown(message.text) : message.text}
                        </div>

                        {/* Service Cards */}
                        {message.services && message.services.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.services.map((service) => (
                              <motion.div
                                key={service.id}
                                onClick={() => handleServiceClick(service)}
                                className="rounded-xl p-3 cursor-pointer transition-all duration-300 group"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                whileHover={{
                                  scale: 1.02,
                                  boxShadow: '0 0 20px rgba(255,255,255,0.1)'
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{getCategoryIcon(service.category)}</span>
                                      <h4 className="font-medium text-white text-sm group-hover:text-white transition-colors">
                                        {service.name}
                                      </h4>
                                    </div>
                                    <p className="text-xs text-white/50 mt-1 line-clamp-2">{service.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                                  <div className="flex items-center gap-3 text-xs text-white/50">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {service.duration} min
                                    </span>
                                    <span className="flex items-center gap-1 text-white/70 font-medium">
                                      <DollarSign className="h-3 w-3" />
                                      {service.price}
                                    </span>
                                  </div>
                                  <span className="text-xs text-white/60 group-hover:text-white font-medium">
                                    Book →
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Quick Action Buttons */}
                        {message.actions && message.actions.length > 0 && (
                          <motion.div
                            className="mt-3 flex flex-wrap gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {message.actions.map((action, index) => (
                              <motion.button
                                key={index}
                                onClick={() => handleQuickAction(action.action)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)'
                                }}
                                whileHover={{
                                  scale: 1.05,
                                  background: 'rgba(255, 255, 255, 0.15)',
                                  borderColor: 'rgba(255, 255, 255, 0.3)',
                                  boxShadow: '0 0 15px rgba(255,255,255,0.1)'
                                }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {getActionIcon(action.icon)}
                                {action.label}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div
                        className="rounded-2xl rounded-bl-md px-4 py-3"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <div className="flex items-center space-x-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-white"
                              animate={{
                                y: [0, -6, 0],
                                opacity: [0.4, 1, 0.4]
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sample Questions */}
                {messages.length === 1 && !isTyping && (
                  <motion.div
                    className="space-y-3 mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-xs text-white/40 font-medium px-1 uppercase tracking-wider">
                      Suggestions
                    </p>
                    <div className="flex flex-col space-y-2">
                      {sampleQuestions.map((question, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleSend(question)}
                          className="text-left px-4 py-3 text-xs text-white/70 hover:text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50"
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                          whileHover={{
                            scale: 1.02,
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            boxShadow: '0 0 15px rgba(255,255,255,0.05)'
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input - Frosted glass */}
            <motion.div
              className="p-4 border-t"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isTyping}
                  className="flex-1 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10 rounded-xl"
                />
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    size="icon"
                    className="rounded-xl h-10 w-10 transition-all duration-200 disabled:opacity-50 bg-white hover:bg-white/90 text-black"
                    style={{
                      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255,255,255,0.1)'
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button - White with glow */}
      {/* Hidden on mobile until scrolled past hero, always visible on desktop */}
      {showOnMobile && (
        <motion.div
          className="fixed bottom-6 right-6 z-[9999]"
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
        <motion.div
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
        {/* White outer glow ring effect */}
        {!isOpen && (
          <motion.div
            className="absolute inset-[-4px] rounded-full"
            style={{
              background: 'transparent',
              boxShadow: '0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.4), 0 0 60px rgba(255,255,255,0.2)'
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.2), 0 0 60px rgba(255,255,255,0.1)',
                '0 0 30px rgba(255,255,255,0.7), 0 0 50px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3)',
                '0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.2), 0 0 60px rgba(255,255,255,0.1)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-full w-16 h-16 p-0 border border-white/40 transition-all duration-300 bg-black hover:bg-black/90 text-white"
          style={{
            boxShadow: isOpen
              ? '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255,255,255,0.3)'
              : '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
          size="icon"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8)) drop-shadow(0 0 8px rgba(255,255,255,0.6))' }} />
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.7)) drop-shadow(0 0 12px rgba(255,255,255,0.5))' }}
              >
                <MessageCircle className="h-7 w-7" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        </motion.div>
      </motion.div>
      )}
    </>
  );
};
