"use client";

import React, { useEffect, useState } from "react";
import { Tabs, Button } from "@heroui/react";
import { ApiGetItem, Item } from "@/components/apiClient";
import DbImage from "@/components/dbImage";
import { useRouter } from "next/navigation";

export default function ItemPageWrapper({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = React.use(params); // unwrap promise in client
  return <ItemClient itemId={itemId} />;
}

function ItemClient({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [item, setItem] = useState<Item>();
  useEffect(() => {
    const fetchData = async () => {
      if (itemId) {
        const data = await ApiGetItem(itemId);
        setItem(data);
      }
    };

    fetchData();
  }, [itemId]);
  return (
    <>
      {itemId && item ? (
        <div>
          <Button onClick={() => router.push(`/items`)}>{"<"} Back</Button>
          <h1 className="text-3xl lg:text-4xl">{item.name}</h1>
          <DbImage id={item.id} />
          <div className="p-2 flex flex-col gap-2">
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
                <p>{item.info}</p>
              </Tabs.Panel>
              <Tabs.Panel className="pt-4" id="specs">
                <h2>Specs</h2>
                {Object.entries(item.tech).length === 0 ? (
                  <div>{"No info... yet ;)"}</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <td>Property</td>
                        <td>Value</td>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(item.tech).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Tabs.Panel>
              <Tabs.Panel className="pt-4" id="quiz">
                <h2>Quiz</h2>
                <p>not implemented yet</p>
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      ) : (
        <div>Loading, Please wait...</div>
      )}
    </>
  );
}
