"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessageAction, getMessagesWithUserAction } from "@/app/actions/message";
import { timeAgo } from "@/lib/utils";

interface Conversation {
  user: { id: string; name: string; avatar: string | null };
  lastMessage: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    property?: { id: string; title: string } | null;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
  property?: { id: string; title: string } | null;
}

interface MessagesClientProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedUserId?: string;
}

export function MessagesClient({ conversations, currentUserId, selectedUserId }: MessagesClientProps) {
  const [activeConv, setActiveConv] = useState<string | null>(selectedUserId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async (userId: string) => {
    setLoading(true);
    const result = await getMessagesWithUserAction(userId);
    if ("messages" in result) {
      setMessages(result.messages as Message[]);
    }
    setLoading(false);
  };

  const handleSend = async (formData: FormData) => {
    if (!activeConv) return;
    formData.set("receiverId", activeConv);
    const result = await sendMessageAction(formData);
    if ("success" in result) {
      await loadMessages(activeConv);
    }
  };

  const activeUser = conversations.find((c) => c.user.id === activeConv)?.user;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex h-[600px]">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${activeConv ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Sohbetler</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>Henüz mesajınız yok</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => setActiveConv(conv.user.id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                  activeConv === conv.user.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shrink-0 overflow-hidden">
                  {conv.user.avatar ? (
                    <img src={conv.user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    conv.user.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate">{conv.user.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(conv.lastMessage.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeConv ? "hidden md:flex" : "flex"}`}>
        {activeConv && activeUser ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <button
                onClick={() => setActiveConv(null)}
                className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium overflow-hidden">
                {activeUser.avatar ? (
                  <img src={activeUser.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  activeUser.name.charAt(0)
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{activeUser.name}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center text-gray-400 py-8">Yükleniyor...</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        msg.senderId === currentUserId
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}
                    >
                      {msg.property && (
                        <div className={`text-xs mb-1 ${msg.senderId === currentUserId ? "text-blue-200" : "text-gray-400"}`}>
                          Re: {msg.property.title}
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === currentUserId ? "text-blue-200" : "text-gray-400"}`}>
                        {timeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form action={handleSend} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  name="content"
                  type="text"
                  required
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p>Bir sohbet seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
