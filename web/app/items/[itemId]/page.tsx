"use client";

import React, { useEffect, useState } from "react";
import { Tabs, Button, Card, toast } from "@heroui/react";
import { ApiGetItem, Item } from "@/components/apiClient";
import DbImage from "@/components/dbImage";
import { useRouter } from "next/navigation";
import { HiChevronLeft } from "react-icons/hi";

type QuizItem = { q: string; o: string[]; a: number };

export default function ItemPageWrapper({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = React.use(params);
  return <ItemClient itemId={itemId} />;
}

function ItemClient({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [item, setItem] = useState<Item>();

  // quiz state
  const [quizPick, setQuizPick] = useState<QuizItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (itemId) {
        const data = await ApiGetItem(itemId);
        setItem(data);
      }
    };
    fetchData();
  }, [itemId]);

  // when item arrives, pick a random quiz question
  useEffect(() => {
    const quizzes = (item?.quiz ?? []) as QuizItem[];
    if (quizzes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quizzes.length);
      setQuizPick(quizzes[randomIndex]);
    } else {
      setQuizPick(null);
    }
  }, [item]);

  return (
    <>
      {itemId && item ? (
        <>
          <div className="w-full">
            <Button onPress={() => router.push(`/items`)}>
              <HiChevronLeft /> Back
            </Button>
          </div>
          <h1 className="text-3xl lg:text-4xl">{item.name}</h1>
          <div className="flex flex-col gap-4 w-full max-w-xl">
            <DbImage id={item.id} className="rounded-2xl" />
            <Tabs>
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
                <Card>
                  <Card.Content>
                    <p className="text-justify">{item.info}</p>
                  </Card.Content>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel className="pt-4" id="specs">
                <Card>
                  <Card.Content>
                    {Object.entries(item.tech).length === 0 ? (
                      <div>{"No info... yet ;)"}</div>
                    ) : (
                      <table className="table-auto w-full text-sm border-collapse rounded-2xl">
                        <thead className="bg-background-tertiary">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">
                              Property
                            </th>
                            <th className="px-4 py-2 text-left font-medium">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {Object.entries(item.tech).map(([key, value]) => (
                            <tr key={key}>
                              <td className="px-4 py-3 align-top font-medium whitespace-nowrap">
                                {key}
                              </td>
                              <td className="px-4 py-3 align-top">
                                {String(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </Card.Content>
                </Card>
              </Tabs.Panel>

              <Tabs.Panel className="pt-4" id="quiz">
                <Card>
                  <Card.Content>
                    {!quizPick ? (
                      <div>No quiz available.</div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <h2 className="text-lg font-semibold">{quizPick.q}</h2>

                        <div className="flex flex-col gap-2">
                          {quizPick.o.map((option, idx) => (
                            <Button
                              key={idx}
                              variant="tertiary"
                              className="justify-start"
                              onPress={() => {idx === quizPick.a ? toast.success("Correct!") : toast("Incorrect. Try again")}}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card.Content>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </div>
        </>
      ) : (
        <div>Loading, Please wait...</div>
      )}
    </>
  );
}