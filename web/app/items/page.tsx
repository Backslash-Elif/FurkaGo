"use client";
import { ApiGetAllItems, GetAllItem } from "@/components/apiClient";
import DbImage from "@/components/dbImage";
import { title } from "@/components/primitives";
import QRScanner from "@/components/qrScanner";
import { Card, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi";

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
        <h1 className={title()}>Our Collection</h1>
        <QRScanner />
      </div>
      <div className="flex flex-wrap gap-4">
        {items
          ? items.map((item) => (
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
                    <Card.Title className="pr-8 text-xl">
                      {item.name}
                    </Card.Title>
                  </Card.Header>
                  <Card.Footer className="text-3xl text-muted">
                    <HiArrowRight />
                  </Card.Footer>
                </div>
              </Card>
            ))
          : "Loading..."}
      </div>
    </div>
  );
}
