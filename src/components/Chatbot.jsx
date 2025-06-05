import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Input, Tooltip } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';

// 使用内联SVG图标代替导入
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

/**
 * 模拟流式响应生成器
 * @param {string} question - 用户提问
 * @yields {string} - 生成的字符流
 */
// const simulateStreamResponse = async function* (question) {
//   // 此函数模拟DeepSeek API的流式响应
//   const responses = [
//     '您好！我是智能助手，',
//     '很高兴能够帮助您解答问题。',
//     '请问您有什么需要我协助的吗？',
//     '我可以提供各种信息和建议。'
//   ];

//   for (const part of responses) {
//     // 模拟网络延迟
//     await new Promise(resolve => setTimeout(resolve, 300));
//     // 每个部分再按字符输出
//     for (let i = 0; i < part.length; i++) {
//       yield part[i];
//       // 字符间的打字延迟
//       await new Promise(resolve => setTimeout(resolve, 50));
//     }
//   }
// };

/**
 * 聊天机器人组件
 * @returns {JSX.Element} - 聊天界面
 */
const Chatbot = () => {
  // 消息列表状态
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是智能助手，很高兴为您服务。请问有什么我可以帮助您的吗？' }
  ]);

  // 输入框文本状态
  const [inputText, setInputText] = useState('');

  // 加载状态
  const [isLoading, setIsLoading] = useState(false);

  // 当前请求控制器
  const [currentController, setCurrentController] = useState(null);

  // 滚动定位引用
  const messagesEndRef = useRef(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * 调用流式API获取回答
   * @param {string} question - 用户问题
   */
  /**
   * 调用流式API获取回答
   * @param {string} question - 用户问题
   */
  const callStreamAPI = async (question) => {
    setIsLoading(true);

    // 创建AbortController用于取消请求
    const controller = new AbortController();
    setCurrentController(controller);

    // 添加空的AI消息占位
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      // API调用
      const response = await fetch('https://api.bigmodel.org/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-cmqi8iWV0aS8oNE2OR71OhiWwTUtXV9BsNevqaua2Bdd27NV'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-0125',
          messages: [{ role: 'user', content: question }],
          stream: true
        }),
        signal: controller.signal
      });

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialContent = '';

      while (true) {
        if (controller.signal.aborted) break;

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.trim().substring(6));
              if (data.choices && data.choices[0].delta.content) {
                partialContent += data.choices[0].delta.content;

                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = partialContent;
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('解析响应失败:', e);
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // 显示错误消息
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
            newMessages[newMessages.length - 1].content = '请求失败，请重试';
          }
          return newMessages;
        });
      }
    } finally {
      setIsLoading(false);
      setCurrentController(null);
    }
  };

  /**
   * 处理发送消息
   * @param {React.FormEvent<HTMLFormElement>} e - 表单提交事件
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: inputText.trim() }]);

    // 调用API
    callStreamAPI(inputText.trim());

    // 清空输入框
    setInputText('');
  };

  /**
   * 处理重试请求
   */
  const handleRetry = () => {
    // 取消当前请求（如果存在）
    if (currentController) {
      currentController.abort();
    }

    // 获取最后一条用户消息
    const lastUserMessageIndex = [...messages].reverse().findIndex(msg => msg.role === 'user');
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];

    // 删除最后一条AI消息
    setMessages(prev => prev.slice(0, -1));

    // 重新调用API
    callStreamAPI(lastUserMessage.content);
  };

  /**
   * 处理复制消息内容
   * @param {string} text - 要复制的文本
   */
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gray-100 p-4">
      <Card className="w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden border border-gray-300 p-6 m-4 bg-white">
        {/* 卡片头部 */}
        <CardHeader className="border-b py-5 px-6 bg-gradient-to-r from-blue-600 to-blue-800">
          <h1 className="text-2xl font-bold text-center text-white drop-shadow-sm">智能助手</h1>
        </CardHeader>

        {/* 消息显示区域 */}
        <CardBody className="flex-grow overflow-y-auto p-6 bg-white">
          <div className="flex flex-col gap-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`relative group p-4 rounded-xl shadow-md max-w-[85%] ${msg.role === 'user' ? 'self-end bg-blue-50 border border-blue-100' : 'self-start bg-gray-50 border border-gray-100'}`}
              >
                <div className="whitespace-pre-wrap text-gray-700 font-normal">{msg.content || '思考中...'}</div>

                {/* 消息操作按钮（悬停显示） */}
                <div className={`absolute top-2 ${msg.role === 'user' ? 'left-2' : 'right-2'} flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  {msg.role === 'assistant' && msg.content && (
                    <Tooltip content="重试">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={handleRetry}
                        className="text-default-400 hover:text-default-600"
                      >
                        <RefreshIcon />
                      </Button>
                    </Tooltip>
                  )}

                  {msg.content && (
                    <Tooltip content="复制">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => handleCopy(msg.content)}
                        className="text-default-400 hover:text-default-600"
                      >
                        <CopyIcon />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardBody>

        <Divider />

        {/* 输入区域 */}
        <CardFooter className="p-5 bg-gray-50 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="w-full flex gap-4">
            <Input
              fullWidth
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入问题..."
              disabled={isLoading}
              className="h-[50px] rounded-xl shadow-sm bg-white"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
            />
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              className="h-[50px] px-6 rounded-xl shadow-md font-semibold"
            >
              发送
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>

  );
};

export default Chatbot;