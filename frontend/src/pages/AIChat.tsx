import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Съжалявам, възникна грешка. Моля опитайте отново.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <i className="fas fa-robot text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Асистент</h2>
            <p className="text-sm text-gray-500">Задайте ми всякакви въпроси</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Изчисти чата"
        >
          <i className="fas fa-trash mr-2"></i>
          Изчисти
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-robot text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Здравейте! Как мога да помогна?
            </h3>
            <p className="text-gray-600 mb-6">
              Напишете съобщение за да започнем разговор
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <button
                onClick={() => setInput('Помогни ми да напиша описание на продукт')}
                className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-pen text-blue-500 mb-2"></i>
                <div className="text-sm font-medium text-gray-900">Описания на продукти</div>
                <div className="text-xs text-gray-500">Генерирай качествени описания</div>
              </button>
              <button
                onClick={() => setInput('Какви цени да сложа на продуктите ми?')}
                className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-tag text-blue-500 mb-2"></i>
                <div className="text-sm font-medium text-gray-900">Съвети за цени</div>
                <div className="text-xs text-gray-500">Оптимизирай ценообразуването</div>
              </button>
              <button
                onClick={() => setInput('Как да организирам инвентара си?')}
                className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-boxes text-blue-500 mb-2"></i>
                <div className="text-sm font-medium text-gray-900">Управление на инвентар</div>
                <div className="text-xs text-gray-500">Съвети за организация</div>
              </button>
              <button
                onClick={() => setInput('Как да подобря продажбите си?')}
                className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="fas fa-chart-line text-blue-500 mb-2"></i>
                <div className="text-sm font-medium text-gray-900">Увеличаване на продажби</div>
                <div className="text-xs text-gray-500">Стратегии и идеи</div>
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-500 ml-3'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 mr-3'
                    }`}
                  >
                    <i
                      className={`fas ${
                        message.role === 'user' ? 'fa-user' : 'fa-robot'
                      } text-white text-sm`}
                    ></i>
                  </div>
                  <div>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('bg-BG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 mr-3">
                    <i className="fas fa-robot text-white text-sm"></i>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишете вашето съобщение..."
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <i className="fas fa-paper-plane"></i>
            <span>Изпрати</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Натиснете Enter за изпращане, Shift+Enter за нов ред
        </p>
      </div>
    </div>
  );
}
