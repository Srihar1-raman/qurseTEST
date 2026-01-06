'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useQueryState } from 'nuqs';
import { messageParser } from '@/lib/url-params/parsers';
import dynamicImport from 'next/dynamic';
import { TypingProvider } from '@/lib/contexts/TypingContext';
import { useConversation } from '@/lib/contexts/ConversationContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/homepage/Hero';
import ModelSelector from '@/components/homepage/ModelSelector';
import DeepSearchButton from '@/components/homepage/DeepSearchButton';
import WebSearchSelector from '@/components/homepage/WebSearchSelector';
import MainInput from '@/components/homepage/MainInput';
import HistorySidebar from '@/components/layout/history/HistorySidebar';
import { ConversationPageSkeleton } from '@/components/ui/ConversationPageSkeleton';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useConversationId } from '@/hooks/use-conversation-id';
import { getOptionFromChatMode, getChatModeFromOption } from '@/lib/conversation/chat-mode-utils';

export const dynamic = 'force-dynamic';

// Lazy load ConversationClient to code split AI SDK
// AI SDK code is only loaded when needed
// Loading state uses same skeleton as NavigationWrapper for seamless transition
const ConversationClient = dynamicImport(
  () => import('@/components/conversation/ConversationClient').then(mod => ({ default: mod.ConversationClient })),
  {
    loading: () => <ConversationPageSkeleton />,
  }
);

function HomePageContent() {
  const { chatMode: contextChatMode, setChatMode: setContextChatMode } = useConversation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();

  // Derive display name from context chat mode
  const selectedSearchOption = getOptionFromChatMode(contextChatMode);

  // Handle search option selection - sync to context
  const handleSearchOptionChange = useCallback((optionName: string) => {
    const modeId = getChatModeFromOption(optionName);
    setContextChatMode(modeId);
  }, [setContextChatMode]);

  // Track if user is typing
  const isTyping = inputValue.trim().length > 0;

  // Extract conversation ID from URL pathname using hook
  const conversationId = useConversationId();

  // Check if URL has message params (for Phase 2 - MainInput uses URL params)
  // Using nuqs with Suspense
  const [message] = useQueryState('message', messageParser);
  const hasInitialMessageParam = useMemo(() => {
    return !!message;
  }, [message]);

  // Wrap handleNewChat with useCallback for stable reference
  const handleNewChat = useCallback(() => {
    // Update URL instantly (no navigation)
    window.history.replaceState({}, '', '/');
    // HomePage will detect URL change via usePathname() and show homepage UI
  }, []);

  // Wrap onHistoryClick with useCallback for stable reference
  const handleHistoryClick = useCallback(() => {
    setIsHistoryOpen(true);
  }, []);

  // Wrap onClose with useCallback for stable reference
  const handleHistoryClose = useCallback(() => {
    setIsHistoryOpen(false);
  }, []);

  // Always mount ConversationClient (matching Scira's pattern)
  // Conditionally show homepage UI or ConversationClient based on conversationId
  return (
    <TypingProvider isTyping={isTyping}>
      <div className="homepage-container">
        <Header
          user={user}
          showHistoryButton={true}
          onHistoryClick={handleHistoryClick}
          showNewChatButton={!!conversationId}
          onNewChatClick={handleNewChat}
        />

        {/* Show homepage UI when no conversation */}
        {!conversationId && (
          <>
        <main
          className="flex-1 flex flex-col justify-center items-center px-5 py-10 max-w-3xl mx-auto w-full"
        >
          <Hero />

          {/* Input comes FIRST */}
          <div style={{ marginTop: '12px', marginBottom: '8px', width: '100%' }}>
            <MainInput inputValue={inputValue} setInputValue={setInputValue} />
          </div>

        {/* Control Buttons come BELOW the input */}
        <div 
          className="flex gap-3 flex-wrap justify-center items-center"
          style={{ 
            marginTop: '0',
            marginBottom: '0',
          }}
        >
          <ModelSelector />
          
          <DeepSearchButton />
          
          <WebSearchSelector
            selectedOption={selectedSearchOption}
            onSelectOption={handleSearchOptionChange}
          />
        </div>
      </main>

        <Footer user={user} />
          </>
        )}

        {/* Always mount ConversationClient (matching Scira's pattern) */}
        {/* When conversationId exists, it's visible; when null, it's hidden but mounted */}
        {/* This pre-initializes useChat hook for instant sends when conversation starts */}
        <div style={{ display: conversationId ? 'block' : 'none' }}>
          <ConversationClient
            conversationId={conversationId || undefined}
            initialMessages={[]}
            initialHasMore={false}
            initialDbRowCount={0}
            hasInitialMessageParam={hasInitialMessageParam}
          />
        </div>

        {/* History Sidebar */}
        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={handleHistoryClose}
        />
      </div>
    </TypingProvider>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<ConversationPageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
