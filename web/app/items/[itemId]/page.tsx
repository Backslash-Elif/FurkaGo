"use client";

import React from "react";
import { Tabs, Button } from "@heroui/react";

export default function ItemPageWrapper({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = React.use(params); // unwrap promise in client
  return <ItemClient itemId={itemId} />;
}

function ItemClient({ itemId }: { itemId: string }) {
  return (
    <div>
      <div
        className="bg-center bg-cover w-screen max-w-lg pt-32 lg:rounded-2xl drop-shadow-[inset_0px_-2em_2em_-1em_rgba(255,255,255,0.5)]"
        style={{
          backgroundImage: `url(/items/item_${itemId}.png)`,
          boxShadow: "rgb(0, 0, 0) 0px -4em 4em -4em inset",
        }}
      >
        <h1 className="text-3xl lg:text-4xl">Item {itemId}</h1>
      </div>
      <div className="p-2 flex flex-col gap-2">
        <Button className="w-full">Open Hotspot view</Button>
        <Tabs className="w-full max-w-md">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Options">
              <Tabs.Tab id="info">
                Information
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="specs">
                Specification
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="quiz">
                Quiz
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel className="pt-4" id="info">
            <h2>Info</h2>
            <p>not implemented yet</p>
          </Tabs.Panel>
          <Tabs.Panel className="pt-4" id="specs">
            <h2>Specs</h2>
            <p>not implemented yet</p>
          </Tabs.Panel>
          <Tabs.Panel className="pt-4" id="quiz">
            <h2>Quiz</h2>
            <p>not implemented yet</p>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
