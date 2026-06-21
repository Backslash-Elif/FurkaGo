"use client";
import { ApiGetAllItems, GetAllItem } from "@/components/apiClient";
import DbImage from "@/components/dbImage";
import LoadingDisplay from "@/components/loadingDisplay";
import { title } from "@/components/primitives";
import QRScanner from "@/components/qrScanner";
import { Card, Button, Label, ProgressBar } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiArrowRight, HiChevronLeft } from "react-icons/hi";
import { HiQrCode } from "react-icons/hi2";

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<GetAllItem>();
  useEffect(() => {
    const fetchData = async () => {
      const data = await ApiGetAllItems();
      setItems(data);
    };

    fetchData();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center p-4 gap-2">
        <div className="w-full">
          <Button variant="outline" onPress={() => router.push(`/`)}>
            <HiChevronLeft /> Home
          </Button>
        </div>
        <h1 className={title()}>Unsere Austellungsstücke</h1>
        <p className="text-muted whitespace-nowrap">
          You can find a{" "}
          <span className="inline-flex align-text-bottom my-0.5 text-accent">
            <HiQrCode />
          </span>{" "}
          <span className="text-accent">QR Code</span> at every exhibit.
        </p>
        <QRScanner />
      </div>
      <div className="flex flex-wrap gap-4">
        {items ? (
          items.map((item) => (
            <Card
              key={item.id}
              className="w-md items-stretch sm:flex-row hover:cursor-pointer"
              onClick={() => router.push(`/items/${item.id}`)}
            >
              <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
                <DbImage
                  id={item.id}
                  className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <Card.Header className="gap-1">
                  <Card.Title className="pr-8 text-xl">{item.name}</Card.Title>
                </Card.Header>
                <Card.Footer className="text-3xl text-muted">
                  <HiArrowRight />
                </Card.Footer>
              </div>
            </Card>
          ))
        ) : (
          <LoadingDisplay />
        )}
      </div>
    </div>
  );
}
