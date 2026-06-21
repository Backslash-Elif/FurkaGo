"use client";

import React, { useEffect, useState } from "react";
import { Tabs, Button, Card, toast } from "@heroui/react";
import { ApiGetItem, Item } from "@/components/apiClient";
import DbImage from "@/components/dbImage";
import { useRouter } from "next/navigation";
import { HiChevronLeft } from "react-icons/hi";
import { franc } from "franc";
import { HiPlay, HiStop } from "react-icons/hi2";

type QuizItem = { q: string; o: string[]; a: number };

function mapFrancToBCP47(francCode: string) {
  // franc returns ISO 639-3 codes; we map a subset to BCP-47-ish language tags
  const map: Record<string, string> = {
    eng: "en",
    spa: "es",
    fra: "fr",
    deu: "de",
    ita: "it",
    por: "pt",
    nld: "nl",
    tur: "tr",
    pol: "pl",
    rus: "ru",
    ara: "ar",
    hin: "hi",
    ben: "bn",
    pan: "pa",
    jpn: "ja",
    kor: "ko",
    cmn: "zh",
    zho: "zh",
    swe: "sv",
    nor: "no",
    dan: "da",
    ukr: "uk",
    hun: "hu",
    vie: "vi",
    ind: "id",
    tha: "th",
    kat: "ka",
    ron: "ro",
    ell: "el",
    // add more as needed
  };

  return map[francCode] || francCode; // fallback to the franc code (might not match voices)
}

function normalizeLang(lang: string) {
  return (lang || "").split("-")[0];
}

async function pickVoiceForLang(targetLang: string) {
  const synth = window.speechSynthesis;

  let voices = synth.getVoices();
  if (!voices || voices.length === 0) {
    await new Promise<void>((resolve) => {
      synth.onvoiceschanged = () => resolve();
      setTimeout(() => resolve(), 800);
    });
    voices = synth.getVoices();
  }

  const exact = voices.find((v) => v.lang === targetLang);
  if (exact) return exact;

  const short = normalizeLang(targetLang);
  const baseMatch = voices.find((v) => normalizeLang(v.lang) === short);
  return baseMatch || null;
}

function detectLanguageFr(text: string) {
  // franc expects a string with enough text; returns "und" if uncertain
  const lang3 = franc(text, { minLength: 20 });
  if (lang3 === "und") return null;
  return mapFrancToBCP47(lang3);
}

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

  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
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
                    <div className="flex items-center gap-3 mb-3 bg-surface-secondary rounded-2xl">
                      {isTtsPlaying ? (
                        <Button
                          variant="danger-soft"
                          onPress={() => {
                            if (typeof window === "undefined") return;
                            if (!("speechSynthesis" in window)) return;
                            window.speechSynthesis.cancel();
                            setIsTtsPlaying(false);
                          }}
                        >
                          <HiStop />
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onPress={async () => {
                            if (typeof window === "undefined") return;
                            if (!("speechSynthesis" in window)) {
                              toast.warning(
                                "Text-to-speech not supported in this browser.",
                              );
                              return;
                            }

                            window.speechSynthesis.cancel();

                            const text = (item?.info ?? "").trim();
                            if (!text) {
                              toast.warning("Nothing to read.");
                              return;
                            }

                            const detectedLang = detectLanguageFr(text); // e.g. "fr", "es", "en", etc.
                            const utterance = new SpeechSynthesisUtterance(
                              text,
                            );

                            // Prefer matched voice when we can
                            if (detectedLang) {
                              const voice =
                                await pickVoiceForLang(detectedLang);
                              if (voice) utterance.voice = voice;
                              utterance.lang = detectedLang;
                            } else {
                              // fallback to browser language
                              utterance.lang = navigator.language || "en";
                            }

                            utterance.rate = 1;
                            utterance.pitch = 1;

                            window.speechSynthesis.speak(utterance);
                            setIsTtsPlaying(true);
                          }}
                        >
                          <HiPlay />
                        </Button>
                      )}
                      <p>Play Audio Narration</p>
                    </div>
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
                              onPress={() => {
                                idx === quizPick.a
                                  ? toast.success("Correct!")
                                  : toast("Incorrect. Try again");
                              }}
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
