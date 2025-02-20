"use client";

import { useTranslate } from "@/hooks";
import TranslateRequestForm from "@/components/TranslateRequestForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TranslateCard, useApp } from "@/components";
import { useEffect, useRef } from "react";
import { LoadingPage } from "@/components/ui/loading";

export default function Home() {
  const { isLoading, translations } = useTranslate();

  const { user, selectedTranslation, setSelectedTranslation } = useApp();

  const leftPanelRef = useRef<{
    expand: () => void;
    collapse: () => void;
  } | null>(null);

  useEffect(() => {
    if (!leftPanelRef.current) {
      console.log("no panel reference");
      return;
    }
    if (user) {
      leftPanelRef.current?.expand();
    } else {
      leftPanelRef.current?.collapse();
    }
  }, [user]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <main className="flex flex-col h-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel collapsible="true" ref={leftPanelRef}>
          <div className="flex flex-col space-y-2 p-2 bg-gray-600 w-full h-full">
            {translations.map((item) => (
              <TranslateCard
                selected={item.requestId === selectedTranslation?.requestId}
                onSelected={setSelectedTranslation}
                translateItem={item}
                key={item.requestId}
              />
            ))}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <div className="p-4">
            <TranslateRequestForm />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
