import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="max-h-80 rounded-2xl overflow-hidden">
        <img src="/furka_bg.png" alt="furka backdrop" className="w-full" />
      </div>
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>
          Furka-Bergstrecke
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          Entdecken Sie unsere Austellung
        </div>
      </div>

      <div className="flex gap-3">
        <a
          className="button button--primary button--md rounded-full"
          href="/menu"
        >
          Los gehts!
        </a>
      </div>
    </section>
  );
}
