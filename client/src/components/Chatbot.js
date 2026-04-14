import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiMessageCircle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './Chatbot.css';

const Chatbot = ({ onClose }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: language === 'hi' 
        ? 'नमस्ते! मैं FIR जमा करने में आपकी मदद के लिए यहाँ हूँ। मैं आपकी कैसे सहायता कर सकता हूँ?'
        : 'Hello! I\'m here to help you with FIR submission. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { text: language === 'hi' ? 'FIR कैसे जमा करें?' : 'How to file FIR?', action: 'how to file fir' },
    { text: language === 'hi' ? 'ब्लॉकचेन क्या है?' : 'What is blockchain?', action: 'what is blockchain' },
    { text: language === 'hi' ? 'FIR ट्रैक करें' : 'Track my FIR', action: 'track my fir' },
    { text: language === 'hi' ? 'FIR स्थिति' : 'FIR status', action: 'fir status' },
  ];

  const responses = {
    'how to file fir': language === 'hi'
      ? 'FIR जमा करने के लिए, मेनू में "Submit FIR" पर जाएं, घटना की तारीख, स्थान और विवरण सहित सभी आवश्यक विवरण भरें, फिर जमा करें। सिस्टम आपके FIR के लिए एक ब्लॉकचेन हैश उत्पन्न करेगा।'
      : 'To file an FIR, go to "Submit FIR" in the menu, fill in all required details including incident date, location, and description, then submit. The system will generate a blockchain hash for your FIR.',
    'what is blockchain': language === 'hi'
      ? 'ब्लॉकचेन यह सुनिश्चित करता है कि आपका FIR छेड़छाड़-प्रूफ और अपरिवर्तनीय है। प्रत्येक FIR को ब्लॉकचेन पर संग्रहीत एक अद्वितीय हैश मिलता है, जो इसे कानूनी रूप से भरोसेमंद बनाता है।'
      : 'Blockchain ensures your FIR is tamper-proof and immutable. Each FIR gets a unique hash stored on the blockchain, making it legally trustworthy.',
    'track my fir': language === 'hi'
      ? '"Track FIR" पर जाएं अपने सभी जमा किए गए FIR और उनकी वर्तमान स्थिति (लंबित, समीक्षा के अधीन, अनुमोदित, या हल) देखने के लिए।'
      : 'Go to "Track FIR" to see all your submitted FIRs and their current status (Pending, Under Review, Approved, or Resolved).',
    'fir status': language === 'hi'
      ? 'FIR स्थिति हो सकती है: लंबित (जमा किया गया, समीक्षा की प्रतीक्षा), समीक्षा के अधीन (अधिकारी द्वारा समीक्षा की जा रही है), अनुमोदित (मामला संख्या असाइन की गई), या हल (मामला बंद)।'
      : 'FIR status can be: Pending (submitted, awaiting review), Under Review (being reviewed by officer), Approved (assigned case number), or Resolved (case closed).',
    'register': language === 'hi'
      ? 'पंजीकरण करने के लिए, सभी आवश्यक फ़ील्ड भरें: नाम, ईमेल, फोन नंबर, पता, और पासवर्ड (न्यूनतम 6 वर्ण)। सुनिश्चित करें कि आपका ईमेल वैध है और पासवर्ड मेल खाता है।'
      : 'To register, fill in all required fields: Name, Email, Phone Number, Address, and Password (minimum 6 characters). Make sure your email is valid and passwords match.',
    'help': language === 'hi'
      ? 'मैं आपकी मदद कर सकता हूं: FIR कैसे जमा करें, ब्लॉकचेन को समझना, अपने FIR को ट्रैक करना, FIR स्थिति की जांच करना, और बहुत कुछ। आप क्या जानना चाहेंगे?'
      : 'I can help you with: How to file FIR, Understanding blockchain, Tracking your FIR, Checking FIR status, and more. What would you like to know?',
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response
    const lowerInput = input.toLowerCase();
    let botResponse = language === 'hi'
      ? 'मैं मदद के लिए यहाँ हूँ! आप मुझसे पूछ सकते हैं: FIR कैसे जमा करें, ब्लॉकचेन क्या है, अपने FIR को ट्रैक करें, FIR स्थिति, या अधिक विकल्पों के लिए "help" टाइप करें।'
      : 'I\'m here to help! You can ask me about: How to file FIR, What is blockchain, Track my FIR, FIR status, or type "help" for more options.';

    for (const [key, value] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        botResponse = value;
        break;
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
    }, 500);

    setInput('');
  };

  const handleQuickAction = (action) => {
    setInput(action);
    const userMessage = { type: 'user', text: quickActions.find(a => a.action === action)?.text || action };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text: responses[action] || responses['help'] }]);
    }, 500);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <FiMessageCircle />
          <span>Chatbot Assistant</span>
        </div>
        <button className="chatbot-close" onClick={onClose}>
          <FiX />
        </button>
      </div>
      
      <div className="chatbot-messages">
        {messages.length === 1 && (
          <div className="quick-actions">
            <p className="quick-actions-label">{language === 'hi' ? 'त्वरित कार्रवाई:' : 'Quick Actions:'}</p>
            <div className="quick-actions-buttons">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action.action)}
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-message ${msg.type}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input-form" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === 'hi' ? 'अपना प्रश्न टाइप करें...' : 'Type your question...'}
          className="chatbot-input"
        />
        <button type="submit" className="chatbot-send">
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;

