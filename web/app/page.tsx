"use client";
import { title, subtitle } from "@/components/primitives";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button, Card, Dropdown, Header, Label } from "@heroui/react";
import type { Selection } from "@heroui/react";
import { useState } from "react";
import { HiChevronRight, HiLanguage } from "react-icons/hi2";
import { LuPartyPopper } from "react-icons/lu";

export default function Home() {
  const [langSelect, setLangSelect] = useState<Selection>(new Set([]));

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <span className={title()}>Furka-Bergstrecke</span>
      <div className="max-h-80 rounded-2xl overflow-hidden">
        <img src="/furka_bg.png" alt="furka backdrop" className="w-full" />
      </div>
      <div className="inline-block max-w-xl text-center justify-center">
        <div className={subtitle({ class: "mt-4" })}>
          Explore our exhibition
        </div>
      </div>

      <div className="flex gap-3">
        <a
          className="button button--primary button--md rounded-full"
          href="/items"
        >
          Let's go! <HiChevronRight />
        </a>
      </div>
      <div className="flex flex-row justify-around w-full max-w-2xl">
        <ThemeSwitch />
        <Dropdown>
          <Button aria-label="Menu" variant="outline">
            <HiLanguage />
          </Button>
          <Dropdown.Popover className="min-w-[256px]">
            <Dropdown.Menu
              selectedKeys={langSelect}
              selectionMode="single"
              onSelectionChange={setLangSelect}
            >
              <Dropdown.Section>
                <Header>Select a language</Header>
                <Dropdown.Item id="en" textValue="en">
                  <Dropdown.ItemIndicator />
                  <Label>English</Label>
                </Dropdown.Item>
                <Dropdown.Item id="de" textValue="de">
                  <Dropdown.ItemIndicator />
                  <Label>Deutsch</Label>
                </Dropdown.Item>
                <Dropdown.Item id="fr" textValue="fr">
                  <Dropdown.ItemIndicator />
                  <Label>Français</Label>
                </Dropdown.Item>
              </Dropdown.Section>
              <Dropdown.Item id="it" textValue="it">
                <Dropdown.ItemIndicator />
                <Label>Italiano</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
      <Card className="max-w-md" variant="default">
        <Card.Header>
          <Card.Title className="flex flex-row items-baseline">
            <LuPartyPopper /> &nbsp;100 Years Furka-Oberalp-Bahn!
          </Card.Title>
          <Card.Description>
            We're Proud to announce this special exhibition
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <p className="text-justify">
            100 Years of the Furka-Oberalp-Bahn is a milestone worth
            celebrating. We're proud to announce this special exhibition
            honoring a century of history, engineering, and journeys across the
            Swiss Alps. Join us to explore stories, artifacts, and moments that
            keep the railway's legacy alive.
          </p>
        </Card.Content>
      </Card>
    </section>
  );
}
