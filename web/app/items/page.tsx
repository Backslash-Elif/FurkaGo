"use client";
import { ApiGetAllItems, GetAllItem } from "@/components/apiClient";
import DbImage from "@/components/dbImage";
import { title } from "@/components/primitives";
import QRScanner from "@/components/qrScanner";
import { Card, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    <div>
      <h1 className={title()}>Items</h1>
      <QRScanner />
      {items
        ? items.map((item) => (
            <Card key={item.id} className="w-full items-stretch md:flex-row">
              <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
                <DbImage
                  id={item.id}
                  className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <Card.Header className="gap-1">
                  <Card.Title className="pr-8">{item.name}</Card.Title>
                </Card.Header>
                <Card.Footer className="mt-auto flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button onClick={() => router.push(`/items/${item.id}`)}>
                    Explore!
                  </Button>
                </Card.Footer>
              </div>
            </Card>
          ))
        : "Loading..."}
    </div>
  );
}
